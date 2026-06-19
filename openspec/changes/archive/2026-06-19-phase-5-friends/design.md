# Design: Phase 5 — Friends

## Technical Approach

Implement the full friend system across three layers: data functions (`lib/database.ts` + `lib/database-client.ts`), a `/friends` page with tabbed views, and profile integration via a `FriendRequestButton` component. Follow existing patterns: `isServer` flag for server functions, `createClient()` for browser wrappers, server component → client component for pages.

## Architecture Decisions

| Decision | Options | Choice | Rationale |
|---|---|---|---|
| `rejected` status | (A) Migration to add `rejected` to CHECK constraint, (B) Delete row on reject, (C) Use `blocked` | **A** | Spec explicitly requires `rejected` status. Only requires `ALTER TABLE`. Preserves audit trail. |
| `/friends` page pattern | (A) Server component fetching data + client tabs, (B) Fully client component | **A** | Matches existing `/messages` pattern and orchestrator instructions. Provides SSR data on first render. |
| Profile relationship fetch | (A) Server-side in `page.tsx`, (B) Client-side in button component | **A** | Avoids extra client query. Page already has `isServer: true` access. |
| Bidirectional friend query | (A) Two parallel queries, (B) Single `.or()` + dual joins | **A** | Supabase FK joins only go one direction. Two queries (`user_id = me` + `friend_id = me`) are parallel-safe and produce clean types. |
| Toast on accept | sonner (already installed from Phase 3) | sonner | Already a dependency. Minimal. Bottom-right, auto-dismiss. |

## Data Flow

```
Server (page.tsx)                    Client Components
─────────────────                    ─────────────────
app/profile/[username]/page.tsx
  ├─ getUserProfileByUsername()
  ├─ getUserInterests()
  ├─ getUserPlanStats()
  ├─ getFriendStatus(viewer, owner)  →  PublicProfileDisplay
  └─ passes friendStatus prop              ├─ FriendRequestButton
                                           │    └─ sendFriendRequest() (mutation)
                                           └─ "Enviar mensaje" (existing)

app/friends/page.tsx                 FriendTabs (client)
  ├─ auth check (redirect if !user)  ──→  ├─ Tabs (Amigos | Pendientes | Enviadas)
  ├─ getFriends(userId)                   ├─ FriendCard × N
  ├─ getPendingRequests(userId)           │    ├─ Avatar + name + date
  └─ getSentRequests(userId)              │    └─ Actions: Accept/Reject (Pendientes)
       └─ passes arrays as props          └─ sonner toast on accept
                                                → refetch lists
```

## File Changes

| File | Action | Description |
|---|---|---|
| `lib/types.ts` | Modify | Add `'rejected'` to `FriendStatus` type |
| `lib/database.ts` | Modify | Add 6 friend functions: `sendFriendRequest`, `acceptFriendRequest`, `rejectFriendRequest`, `getFriends`, `getPendingRequests`, `getSentRequests`, `getFriendStatus` |
| `lib/database-client.ts` | Modify | Add 7 browser wrappers for above functions |
| `supabase/migrations/phase-5-rejected-status.sql` | Create | `ALTER TABLE user_friends DROP CONSTRAINT ... ADD CHECK (status IN ('pending','accepted','blocked','rejected'))` |
| `app/friends/page.tsx` | Create | Server component: auth check, fetch all 3 lists, render `FriendsPageClient` |
| `components/friends-page-client.tsx` | Create | Client component: tabs (Amigos/Pendientes/Enviadas), empty states, refetch on action |
| `components/friend-card.tsx` | Create | Card: avatar, name, date, action buttons (accept/reject for pendientes, badge for enviadas) |
| `components/friend-request-button.tsx` | Create | Client component: state machine based on `friendStatus` prop |
| `components/public-profile-display.tsx` | Modify | Add `FriendRequestButton` below plan stats (under `!isOwner && currentUserId` guard); add `friendStatus` prop |
| `app/profile/[username]/page.tsx` | Modify | Fetch `getFriendStatus` server-side, pass to display |
| `middleware.ts` | No change | Already protected: `/friends` is not in the allowlist (`/`, `/login`, `/auth`, `/demo`, `/profile/`, `/discover`), so unauthenticated users are redirected |

## Interfaces / Contracts

```ts
// lib/types.ts — add to FriendStatus
export type FriendStatus = 'pending' | 'accepted' | 'blocked' | 'rejected';

// lib/database.ts — new functions
export async function sendFriendRequest(
  userId: string, friendId: string, isServer?: boolean
): Promise<UserFriend | null>;

export async function acceptFriendRequest(
  requestId: string, userId: string, isServer?: boolean
): Promise<UserFriend | null>;
// Only succeeds if userId = row.friend_id

export async function rejectFriendRequest(
  requestId: string, userId: string, isServer?: boolean
): Promise<UserFriend | null>;
// Only succeeds if userId = row.friend_id

export async function getFriendStatus(
  userId: string, peerId: string, isServer?: boolean
): Promise<{ id: string; status: FriendStatus; isSender: boolean } | null>;
// Returns null if no row exists between the pair

export async function getFriends(
  userId: string, isServer?: boolean
): Promise<EnrichedFriend[]>;
// Two parallel queries: user_id=me + friend_id=me, both status='accepted'
// Returns unified: { id, friend: UserProfile, created_at }

export async function getPendingRequests(
  userId: string, isServer?: boolean
): Promise<EnrichedFriend[]>;
// friend_id = me AND status = 'pending', join user_id's profile as 'friend'

export async function getSentRequests(
  userId: string, isServer?: boolean
): Promise<EnrichedFriend[]>;
// user_id = me AND status = 'pending', join friend_id's profile as 'friend'
```

`EnrichedFriend` is a local interface:
```ts
interface EnrichedFriend {
  id: string; // user_friends row id
  friend: UserProfile; // the OTHER user (not caller)
  created_at: string;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| None | No test runner | Verify via `npm run build` and manual functional testing per spec scenarios |

## Migration / Rollout

One migration required: `phase-5-rejected-status.sql` adds `'rejected'` to the `user_friends.status` CHECK constraint. No data migration — existing rows are unaffected. Rollback: `ALTER TABLE` back to original constraint.

## Open Questions

- None — all decisions resolved above.
