# Proposal: Phase 7 — In-App Notifications

## Intent

Users have no awareness of social activity (friend accepts, messages, comment replies, join approvals, reviews) unless they manually check each feature. Add a realtime notification bell + dedicated page so users see activity as it happens across all features.

## Scope

### In Scope
- Bell icon with unread badge in navbar (reuses `UnreadBadge`)
- Dropdown menu showing last 5 notifications (live realtime inserts while open)
- `/notifications` page: full list, paginated (20/page), mark-read toggle
- `notifications` table with RLS, indexes, REPLICA IDENTITY FULL
- Realtime per-user channel `notifications-{userId}` on INSERT
- `createNotification()` helper fired at 5 event points
- 360-day auto-cleanup mechanism (pg_cron or scheduled edge function)
- User sees own actions ("You accepted X's friend request")

### Out of Scope
- Push notifications, email notifications
- Notification preferences/settings UI
- Notification grouping/bundling
- Toast/sonner integration for realtime alerts beyond the bell

## Capabilities

### New Capabilities
- `notifications`: Bell badge, dropdown, paginated page, realtime insert channel, mark-as-read, per-user RLS, 5-event triggering
- `notifications-cleanup`: Scheduled deletion of notifications older than 360 days

### Modified Capabilities
- None — existing specs retain current behavior. Notification creation is a side-effect added in the data layer without changing spec-level requirements.

## Approach

**Schema**: `notifications(user_id, actor_id, type, title, body, link, is_read, created_at)`. Type enum: `friend_accepted | new_message | comment_reply | join_accepted | review_received`. Index on `(user_id, is_read)` for unread counts. REPLICA IDENTITY FULL for realtime `OLD` payloads on updates.

**Realtime**: `NotificationBell` subscribes to `notifications-{userId}` filtering `INSERT`. On insert, prepends to dropdown list. On window focus, fetches fresh count. Dropdown "View all" links to `/notifications`.

**Data layer**: `createNotification()` in `lib/database-client.ts` inserts via client supabase. Called inside the 5 existing data functions right after operation succeeds. RLS INSERT policy: any authenticated user (system concern). Actor uses `auth.uid()` so RLS `user_id` column is set correctly.

**Cleanup**: Postgres function `cleanup_old_notifications()` deleting `WHERE created_at < NOW() - INTERVAL '360 days'`. Scheduled via pg_cron (Supabase extension) or edge function cron if pg_cron unavailable.

**Navbar**: `<NotificationBell />` added next to `<ChatNavLink />` in `app/dashboard/layout.tsx`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `database-schema.sql` | New | `notifications` table + indexes + RLS + cleanup function |
| `lib/database-client.ts` | Modified | Add `createNotification()`; call from `acceptFriendRequest`, `createPlanComment`, `updateJoinRequest`, `submitReview` |
| `lib/chat-client.ts` | Modified | Call `createNotification()` from `sendMessage` (notify other participant) |
| `components/notification-bell.tsx` | New | Bell icon + dropdown + realtime subscription |
| `app/notifications/page.tsx` | New | Paginated notification list |
| `app/dashboard/layout.tsx` | Modified | Add `<NotificationBell />` to nav |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| REPLICA IDENTITY FULL missing → realtime silent fail | Med | Add migration step; verify in Supabase dashboard |
| Client-side notification loss on crash before insert | Low | Accept; notifications are non-critical. Page fetch is fallback |
| `updateJoinRequest` missing requester_id at call site | Low | Function already selects `requester:user_profiles!requester_id(*)`; pass to `createNotification()` |
| pg_cron not available on Supabase free tier | Med | Fallback: edge function cron via `supabase cron` or Vercel cron; document manual cleanup SQL |
| Chat notification fires even when viewing chat (user decision) | Low | By design — no suppression logic needed |

## Rollback Plan

1. Remove `<NotificationBell />` from navbar layout
2. Delete `components/notification-bell.tsx` and `app/notifications/` route
3. Remove `createNotification()` calls from the 5 data functions (comment out, don't delete)
4. Drop `notifications` table and cleanup function via migration
5. No other feature depends on notifications — zero impact to remaining app

## Dependencies

- `@radix-ui/react-dropdown-menu` already installed (used by existing components)
- Supabase Realtime already active (used by chat/messages)
- No new npm packages required

## Success Criteria

- [ ] Bell icon shows unread count badge, hidden when count=0
- [ ] Dropdown shows last 5 notifications, live-inserts while open
- [ ] `/notifications` page loads with pagination and mark-read toggle
- [ ] All 5 event types trigger notification creation (verified in DB)
- [ ] Realtime: opening notification from another tab's event appears in dropdown without refresh
- [ ] Notifications older than 360 days are deleted by cleanup
- [ ] `npm run build` passes with zero TypeScript errors
