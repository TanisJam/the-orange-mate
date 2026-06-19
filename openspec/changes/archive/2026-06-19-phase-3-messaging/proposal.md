# Proposal: Phase 3 — Messaging

## Intent

Users need direct communication with other travelers discovered through profiles and plans. The backend (tables, types, data functions) is complete. Missing: chat UI, routes, realtime updates, and entry points from existing pages.

## Scope

### In Scope
- `/messages` — Chat inbox with participant avatar, name, last message, timestamp
- `/messages/[chatId]` — Chat view with message history (ASC) and send input
- Five new components: chat-list, chat-window, message-bubble, message-input, unread-badge
- Polling for new messages (5s interval, Slice 1)
- Supabase Realtime subscriptions (Slice 2)
- Mark messages as read on chat open (Slice 2)
- Unread count badge in dashboard nav (Slice 2)
- "Send message" button on public profile page (Slice 3)
- "Message" button on plan detail page (Slice 3)

### Out of Scope
- Typing indicators, message reactions, attachments, group chats, push notifications

## Capabilities

### New Capabilities
- `chat-inbox`: Chat list at `/messages` showing all user conversations ordered by `updated_at DESC`
- `chat-window`: Individual chat view at `/messages/[chatId]` with history, send, and polling
- `chat-realtime`: Supabase Realtime subscription for live messages; unread badge in nav; mark-as-read
- `chat-entry-points`: Buttons to initiate chat from profile and plan pages

### Modified Capabilities
- None

## Approach

Three slices, incremental delivery:

**Slice 1 — Core UI**: Two new App Router pages under `app/messages/`. Inbox uses `getUserChats()` server-side, passes data to `ChatList` client component. Chat page uses `getChatMessages()` server-side for initial load, then client-side `sendMessage()` on submit. Polling via `setInterval` every 5s.

**Slice 2 — Realtime**: Replace polling with `supabase.channel('chat-{chatId}')`. Subscribe to `messages` INSERT events. Add `useEffect` to mark messages as read (`is_read=true`) on chat open. Unread count computed client-side from `getUserChats()` minus read state, displayed as badge on nav link.

**Slice 3 — Entry points**: Add "Send message" button to `PublicProfileDisplay` (visible to authenticated non-owners). Add "Message creator" button to `PlanDetail`. Both call `getOrCreateChat()` → redirect to `/messages/[chatId]`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/messages/page.tsx` | New | Inbox server page with chat list |
| `app/messages/[chatId]/page.tsx` | New | Chat view server page |
| `components/chat-list.tsx` | New | Renders sorted chat list with preview |
| `components/chat-window.tsx` | New | Message history + input |
| `components/message-bubble.tsx` | New | Single message display |
| `components/message-input.tsx` | New | Text input + send button |
| `components/chat-nav-link.tsx` | New | Nav link with unread badge |
| `app/dashboard/layout.tsx` | Modified | Add chat nav link with badge |
| `components/public-profile-display.tsx` | Modified | Add "Send message" button |
| `components/plan-detail.tsx` | Modified | Add "Message creator" button |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Polling floods Supabase with requests | Med | 5s interval, `isServer=true` for initial load only |
| Realtime subscription leaks on navigation | Low | Cleanup in `useEffect` return; single channel per page |
| Unread count drifts from reality | Med | Recompute on window focus; server `is_read` is source of truth |
| Chat creation race — duplicate chats | Low | `get_or_create_chat` DB function uses least/greatest ordering |

## Rollback Plan

Remove `app/messages/` directory. Revert `dashboard/layout.tsx`, `public-profile-display.tsx`, and `plan-detail.tsx` modifications. No database migration required — all schema and data functions are pre-existing. Build verification: `npm run build` passes after rollback.

## Dependencies

- Supabase schema with `chats`, `messages` tables and RLS policies (deployed)
- `lib/database.ts` chat functions (complete)
- `lib/types.ts` Chat/Message/CreateMessageData types (complete)
- Dashboard layout with nav bar (exists)

## Success Criteria

- [ ] Inbox renders all user chats with correct participant name and last message preview
- [ ] Chat page loads message history in chronological order
- [ ] Sending a message persists to DB and appears in chat immediately
- [ ] Polling detects new messages within 5s (Slice 1) / realtime is instant (Slice 2)
- [ ] Unread badge shows count, clears when chat is opened
- [ ] "Send message" from profile creates chat and redirects
- [ ] "Message creator" from plan detail creates chat and redirects
- [ ] `npm run build` passes
