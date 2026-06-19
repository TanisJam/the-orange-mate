# Tasks: Phase 3 — Messaging

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~500–700 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Delivery strategy | feature-branch-chain |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Lines | PR Base |
|------|------|-------|---------|
| WU1 | Core UI: inbox, chat window, polling | ~250–350 | feature/phase-3-messaging |
| WU2 | Realtime: subscriptions, badge, mark-as-read | ~150–200 | WU1 branch |
| WU3 | Entry points: profile + plan buttons | ~100–150 | WU2 branch |

## Slice 1 — Core UI (Work Unit 1)

- [x] 1.1 Install `sonner` + add `<Toaster />` to `app/layout.tsx` inside `<ThemeProvider>`
- [x] 1.2 Create `app/messages/layout.tsx` — server layout: header with `← Back` link to `/dashboard`, wraps `children`
- [x] 1.3 Create `app/messages/page.tsx` — server: auth guard → `getUserChats(userId, true)` → render `<ChatList chats={chats} currentUserId={userId} />`
- [x] 1.4 Create `components/chat-list.tsx` — "use client": maps chats to `<Link href={/messages/${chat.id}}>` rows showing other participant's avatar + name, last message preview (1-line truncation), relative timestamp. Empty state: "No messages yet"
- [x] 1.5 Create `components/message-bubble.tsx` — presentational: own messages right-aligned (primary bg), other's left (secondary bg). Renders sender name, content, timestamp
- [x] 1.6 Create `components/message-input.tsx` — "use client": controlled `<textarea>` + Send `<Button>`. Enter submits, disabled on empty/whitespace. Calls `onSend(content)` prop
- [x] 1.7 Create `components/chat-window.tsx` — "use client": receives `initialMessages`, `chatId`, `currentUserId`. Holds messages in `useState`. Send: `sendMessage()` from `@/lib/database`. Polling: `setInterval(5s)` → `getChatMessages(chatId)` → filter `created_at > lastKnown` → append. Cleanup on unmount
- [x] 1.8 Create `app/messages/[chatId]/page.tsx` — server: auth guard → `getChatMessages(chatId, true)` + participant check (`getUserChats` filter) → 403 if not participant → render `<ChatWindow ... />`
- [x] 1.9 Verify: `npm run build` passes; manual: inbox renders → open chat → send → polling delivers new messages

## Slice 2 — Realtime (Work Unit 2)

- [x] 2.1 Add `getUnreadCount(userId: string): Promise<number>` and `markMessagesAsRead(chatId: string, userId: string): Promise<boolean>` to `lib/chat-client.ts` — browser-only wrappers (no isServer flag per WU1 architecture decision)
- [x] 2.2 Create `components/unread-badge.tsx` — badge pill showing count; renders nothing when `count === 0`
- [x] 2.3 Create `components/chat-nav-link.tsx` — "use client": fetches `getUnreadCount` on mount + `window` focus. Subscribes to global `messages` INSERT channel filtered by user's chat IDs for live updates. Renders `<Link href="/messages">` with `<UnreadBadge count={count} />`
- [x] 2.4 Add `<ChatNavLink />` to `app/dashboard/layout.tsx` nav, replacing the plain `<Link href="/messages">`
- [x] 2.5 Replace polling in `chat-window.tsx`: subscribe to `supabase.channel('chat-{chatId}').on('INSERT', cb).subscribe()` in `useEffect`; cleanup via `supabase.removeChannel(channel)`
- [x] 2.6 Add mark-as-read to `chat-window.tsx`: `useEffect` on mount calls `markMessagesAsRead(chatId, currentUserId)`
- [x] 2.7 Auto mark-as-read on new realtime message when `document.visibilityState === "visible"`; also mark on visibility change
- [x] 2.8 Own messages handled: realtime callback only appends messages where `sender_id !== currentUserId` (own messages already appended via send callback)

## Slice 3 — Entry Points (Work Unit 3)

- [x] 3.1 Modify `components/public-profile-display.tsx` — add `currentUserId?: string \| null` prop. Render "Send message" `<Button>` when `!isOwner && currentUserId`. On click: `getOrCreateChat(currentUserId, profile.id)` → `router.push(/messages/${chat.id})`. Toast error via `sonner`
- [x] 3.2 Modify `app/profile/[username]/page.tsx` — pass `user?.id ?? null` as `currentUserId` to `<PublicProfileDisplay>`
- [x] 3.3 Modify `components/plan-detail.tsx` — add "Message creator" `<Button>` when `!isCreator && isParticipant`. On click: `getOrCreateChat(currentUserId, plan.creator_id)` → `router.push(/messages/${chat.id})`. Toast error via `sonner`
- [x] 3.4 Verify: `npm run build` passes; manual: profile button hidden for self/unauthenticated, plan button hidden for creator/unauthenticated, both create/retrieve chat and redirect correctly
