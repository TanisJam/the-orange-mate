# Design: Phase 3 — Messaging

## Technical Approach

Three incremental slices. Server Components handle auth + initial data at `app/messages/` (standalone, not under dashboard). Client Components handle mutations, polling, and realtime — following the existing `isServer` flag pattern in `lib/database.ts`. `app/messages/layout.tsx` provides a back-navigation header. Error feedback via `sonner` toast (added Slice 1).

```
app/messages/layout.tsx           (server — header + "← Back")
├── page.tsx                      (server — auth + getUserChats)
│   └── ChatList                  (client — links to /messages/[id])
└── [chatId]/page.tsx             (server — auth + getChatMessages + access check)
    └── ChatWindow                (client — history, send, polling → realtime)
        ├── MessageBubble         (presentational)
        └── MessageInput          (client — controlled form)
```

## Sequence: Entry Point → Chat Redirect

```
Profile/Plan Page (client)          DB (RPC)               Router
     │                                │                      │
     │── getOrCreateChat(uid1,uid2)──▶│                      │
     │◀─────── chat.id ──────────────│                      │
     │                                                        │
     │────────────────── router.push(/messages/{id})─────────▶│
```

## Architecture Decisions

### Decision: Route placement

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Under `app/(dashboard)/messages/` | Inherits nav; couples chat to dashboard | Rejected |
| `app/messages/` standalone | Clean separation; needs own layout | **Chosen** |

**Rationale**: Dashboard layout has no nav links today. Standalone allows independent evolution. Middleware already protects `/messages/*` (not in auth/profile/demo exceptions).

### Decision: Sonner for error toasts

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Custom toast | No dependency; significant dev effort | Rejected |
| `sonner` | shadcn standard; server-safe `<Toaster />` | **Chosen** |

**Rationale**: Project uses shadcn/ui primitives. Sonner is the recommended toast. Add `<Toaster />` to root `app/layout.tsx`.

### Decision: Polling before realtime

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Polling (5s `setInterval`) | Simple; 5s latency; extra DB reads | **Slice 1** |
| Supabase Realtime channel | Instant; complex lifecycle management | **Slice 2** |

**Rationale**: Proposal sequences polling → realtime. Separates delivery risk.

## Data Flow

**Inbox**: Server fetches `getUserChats(userId, true)` → passes `Chat[]` + `currentUserId` to `ChatList` (client). `ChatList` identifies other participant via `participant_1_id`/`participant_2_id`, renders `<Link href={/messages/${chat.id}}>` per row.

**Chat window**: Server fetches `getChatMessages(chatId, true)` + chat for participant check → passes to `ChatWindow` (client) as `initialMessages`. ChatWindow holds messages in `useState`. Send: `sendMessage(userId, {chat_id, content})` → appends returned `Message` to state. Slice 1 polling: `setInterval(5s)` → `getChatMessages(chatId)` → filter `created_at > lastKnown` → append. Slice 2 realtime replaces polling: `supabase.channel('chat-{id}').on('INSERT', ...)` on mount, cleanup via `useEffect` return. Slice 2 mark-as-read: `useEffect` on mount calls `markMessagesAsRead(chatId, userId)`.

**Unread count (Slice 2)**: `ChatNavLink` fetches `getUnreadCount(userId)` on mount + on `window` focus. Subscribes to a global `messages` INSERT channel filtered to user's chats for live increment. `UnreadBadge` renders pill; hidden when count=0.

## Realtime Lifecycle

```
ChatWindow mount                Supabase                    ChatWindow unmount
     │                            │                              │
     │── channel('chat-{id}')───▶│                              │
     │── .on('INSERT', cb)──────▶│                              │
     │── .subscribe()───────────▶│                              │
     │                            │── payload(new message)─────▶│
     │                            │── payload(new message)─────▶│
     │                                                           │
     │──────────────── removeChannel(channel) ──────────────────▶│
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `app/messages/layout.tsx` | Create | Server layout with back link to `/dashboard` |
| `app/messages/page.tsx` | Create | Auth + `getUserChats` → renders `ChatList` |
| `app/messages/[chatId]/page.tsx` | Create | Auth + `getChatMessages` + access check → renders `ChatWindow` |
| `components/chat-list.tsx` | Create | "use client": chat rows with avatar, preview, timestamp |
| `components/chat-window.tsx` | Create | "use client": message history + send + polling/realtime |
| `components/message-bubble.tsx` | Create | Presentational: own=right, other=left alignment |
| `components/message-input.tsx` | Create | "use client": controlled input + send, Enter submits |
| `components/chat-nav-link.tsx` | Create | "use client": nav Link with `UnreadBadge` (Slice 2) |
| `components/unread-badge.tsx` | Create | Badge pill, hidden when count=0 |
| `lib/database.ts` | Modify | Add `getUnreadCount` + `markMessagesAsRead` |
| `app/dashboard/layout.tsx` | Modify | Add `ChatNavLink` in nav (Slice 2) |
| `components/public-profile-display.tsx` | Modify | Accept `currentUserId`; "Send message" when `!isOwner && currentUserId` |
| `app/profile/[username]/page.tsx` | Modify | Pass `currentUserId` to `PublicProfileDisplay` |
| `components/plan-detail.tsx` | Modify | "Message creator" when `!isCreator && isParticipant` (Slice 3) |
| `app/layout.tsx` | Modify | Add `<Toaster />` from sonner |
| `package.json` | Modify | Add `sonner` dependency |

## Interfaces / Contracts

```typescript
// New in lib/database.ts
getUnreadCount(userId: string, isServer?: boolean): Promise<number>
markMessagesAsRead(chatId: string, userId: string, isServer?: boolean): Promise<void>

// Modified
PublicProfileDisplayProps { currentUserId?: string | null } // NEW
```

## Testing Strategy

No test runner (`strict_tdd: false`). Verification: `npm run build` passes each slice. Manual: auth → inbox → open chat → send → verify persistence. Two-browser for polling/realtime. Unread badge via receiving message on dashboard.

## Migration / Rollout

No migration. Supabase schema + RPC functions pre-deployed. Rollback: remove `app/messages/`, revert modified files. Build must pass.

## Open Questions

- [ ] Plan detail "Message creator": spec says "participants who are NOT the plan creator" — confirms participant-only visibility.
