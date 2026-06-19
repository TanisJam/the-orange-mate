# Tasks: Phase 5 — Friends

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~550–600 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (~250 lines data) → PR 2 (~335 lines UI) |
| Delivery strategy | feature-branch-chain |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | PR | Notes |
|------|------|----|-------|
| 1 | DB migration + type + 7 data functions + 7 client wrappers | PR 1 | Base: `feature/phase-5-friends`. Independent, verifiable via build. |
| 2 | /friends page + tabs + cards + profile button + profile wiring | PR 2 | Base: PR 1 branch. Depends on data functions from PR 1. |

---

## Phase 1: Data Layer (PR 1)

- [x] 1.1 Modify `lib/types.ts` — add `'rejected'` to `FriendStatus` union
- [x] 1.2 Create `supabase/migrations/phase-5-rejected-status.sql` — ALTER CHECK constraint on `user_friends.status` to include `'rejected'`
- [x] 1.3 Add `sendFriendRequest(userId, friendId, isServer?)` to `lib/database.ts` — insert pending row, block self-requests and duplicates
- [x] 1.4 Add `acceptFriendRequest(requestId, userId, isServer?)` to `lib/database.ts` — update status to `'accepted'` where recipient matches
- [x] 1.5 Add `rejectFriendRequest(requestId, userId, isServer?)` to `lib/database.ts` — update status to `'rejected'` where recipient matches
- [x] 1.6 Add `getFriendStatus(userId, peerId, isServer?)` to `lib/database.ts` — return `{ id, status, isSender } | null` for pair
- [x] 1.7 Add `getFriends(userId, isServer?)` to `lib/database.ts` — two parallel accepted queries (`user_id=me` + `friend_id=me`), join profiles, define local `EnrichedFriend` interface
- [x] 1.8 Add `getPendingRequests(userId, isServer?)` to `lib/database.ts` — `friend_id=me AND status='pending'`, join sender profile
- [x] 1.9 Add `getSentRequests(userId, isServer?)` to `lib/database.ts` — `user_id=me AND status='pending'`, join recipient profile
- [x] 1.10 Add browser wrappers for all 7 friend functions to `lib/database-client.ts` — mirror signatures without `isServer`, call `createClient()` internally

## Phase 2: UI (PR 2)

- [x] 2.1 Create `app/friends/page.tsx` — server component: auth guard (redirect if !user), fetch 3 lists via `isServer=true`, pass to `FriendsPageClient`
- [x] 2.2 Create `components/friends-page-client.tsx` — `"use client"`: shadcn Tabs (Amigos | Pendientes | Enviadas), `FriendCard` per tab, empty states (Amigos links to /discover), refetch after actions
- [x] 2.3 Create `components/friend-card.tsx` — avatar + name (username fallback) + date, accept/reject buttons (Pendientes), "Pendiente" badge (Enviadas), sonner toast on accept
- [x] 2.4 Create `components/friend-request-button.tsx` — `"use client"` state machine from `friendStatus` prop: "Enviar solicitud" | "Solicitud enviada" disabled | "Responder solicitud" → `/friends` | "Amigos" disabled | hidden
- [x] 2.5 Modify `components/public-profile-display.tsx` — add `friendStatus` prop, render `<FriendRequestButton>` below plan stats, guarded by `!isOwner && currentUserId`
- [x] 2.6 Modify `app/profile/[username]/page.tsx` — call `getFriendStatus(viewerId, ownerId)` server-side, pass result as `friendStatus` prop
