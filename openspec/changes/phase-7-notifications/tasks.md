# Tasks: Phase 7 — In-App Notifications

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~550 (PR 1: ~230, PR 2: ~320) |
| 400-line budget risk | High |
| Suggested split | PR 1: Schema + types + data layer → PR 2: UI + page + cleanup |
| Delivery strategy | force-chained |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Base |
|------|------|-----------|------|
| 1 | Schema DDL, types, notification-client, integrate 5 event triggers | PR 1 | `feat/phase-7-notifications` (tracker) |
| 2 | UI bell/dropdown/items, /notifications page, navbar wiring, cleanup fallback | PR 2 | PR 1 branch |

## Phase 1: Schema & Types (PR 1)

- [ ] 1.1 Add `notification_event_type_enum`, `notifications` table (FKs: `user_id`, `actor_id` → `user_profiles`), indexes (`idx_notif_user_unread` partial WHERE `is_read = false`, `idx_notif_user_created`), RLS policies (SELECT/UPDATE: `user_id = auth.uid()`; INSERT: authenticated), `REPLICA IDENTITY FULL`, `supabase_realtime` publication, `cleanup_old_notifications()` function, pg_cron schedule to `database-schema.sql`
- [ ] 1.2 Add `NotificationEventType`, `Notification` (with optional `actor?: Pick<UserProfile, 'id'|'username'|'full_name'|'avatar_url'>`), `CreateNotificationParams` to `lib/types.ts`

## Phase 2: Data Layer (PR 1)

- [ ] 2.1 Create `lib/notification-client.ts` with five functions: `createNotification(params)→Notification|null`, `getNotifications(userId, page, limit=20)→{data,count}`, `getUnreadCount(userId)→number`, `markAsRead(id)→boolean`, `markAllAsRead(userId)→boolean`
- [ ] 2.2 Modify `updateJoinRequest()` in `lib/database-client.ts`: add `callerId: string` parameter; update 2 call sites in `components/join-request-flow.tsx` (pass `userId`)
- [ ] 2.3 Call `createNotification()` from `acceptFriendRequest()`: after update succeeds, notify requester (`user_id=data.user_id, type=friend_accepted`) + self-notify accepter (`user_id=userId`). Add `requester:user_profiles!user_id(id,username,full_name,avatar_url)` to SELECT
- [ ] 2.4 Call `createNotification()` from `createPlanComment()`: when `parent_comment_id` exists, fetch parent author via `getPlanComments`, notify if author ≠ current user (`type=comment_reply`)
- [ ] 2.5 Call `createNotification()` from `updateJoinRequest()`: inside `status==='accepted' && data` block, notify requester (`user_id=data.requester_id, actor_id=callerId, type=join_accepted`)
- [ ] 2.6 Call `createNotification()` from `submitReview()`: after insert succeeds, notify reviewed user (`user_id=data.reviewed_id, type=review_received`)
- [ ] 2.7 Call `createNotification()` from `sendMessage()` in `lib/chat-client.ts`: after insert succeeds, fetch chat to identify other participant, notify (`type=new_message`)

## Phase 3: UI Components (PR 2)

- [x] 3.1 Create `components/notification-item.tsx` — actor avatar (initial fallback) + name, title, body, `formatRelativeDate(created_at)`, muted opacity when `is_read`, click-to-mark-read + navigate via `notification.link`
- [x] 3.2 Create `components/notification-dropdown.tsx` — renders `NotificationItem` list (max 5), empty state "No tienes notificaciones", footer: DropdownMenuSeparator → "Ver todas" link (`/notifications`) → "Marcar todas leídas" via `markAllAsRead`
- [x] 3.3 Create `components/notification-bell.tsx` — Bell icon + `UnreadBadge`, `getUnreadCount` on mount, window focus refresh, lazy realtime: `channel("notifications-{uid}").on("INSERT",…)` on dropdown open, `removeChannel` on close, prepends live inserts (max 5), increments count

## Phase 4: Pages & Integration (PR 2)

- [x] 4.1 Create `app/notifications/page.tsx` — server shell importing client `NotificationList` with pagination (20/page via `getNotifications`), prev/next buttons, mark-read toggle, empty state "No tienes notificaciones aún"
- [x] 4.2 Add `<NotificationBell />` next to `<ChatNavLink />` in `app/dashboard/layout.tsx`

## Phase 5: Cleanup & Verify (PR 2)

- [x] 5.1 Implement cleanup fallback: if pg_cron unavailable, add Vercel Cron API route to invoke `cleanup_old_notifications()` via RPC; document manual SQL as last resort
- [x] 5.2 Run `npm run build` — verify zero TypeScript errors and successful build
