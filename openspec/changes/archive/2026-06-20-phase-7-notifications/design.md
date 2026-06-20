# Design: Phase 7 — In-App Notifications

## Technical Approach

Add a realtime notification system following the established `chat-nav-link` pattern: per-user Supabase Realtime channel, client-side data functions, and a reusable `UnreadBadge`. Notification creation is a side-effect embedded inside the 5 existing data functions (`acceptFriendRequest`, `sendMessage`, `createPlanComment`, `updateJoinRequest`, `submitReview`). The bell component subscribes on dropdown open, unsubscribes on close; badge count refreshes on mount and window focus per the spec.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|-------------|-----------|
| Notification trigger location | Inside data functions (database-client.ts, chat-client.ts) | Call sites in components | Proposal specifies data-layer embedding. Centralizes logic; callers don't need notification context. |
| Subscription lifecycle | Lazy: activate on dropdown open, release on close | Always-on (like chat-nav-link) | Spec explicitly requires this. Reduces open connections when bell is idle. |
| Cleanup mechanism | pg_cron (preferred) + Vercel Cron fallback via API route | Manual SQL only, DB trigger | pg_cron is standard Supabase. Vercel Cron provides free-tier-safe fallback. |
| Self-notifications | Separate row with `actor_id = user_id` | Omit self-notifications | Spec explicitly requires "Usuario ve su propia acción". |
| Realtime channel filter | `INSERT` only on per-user channel | `*` (all events) | Notifications are append-only visible to the channel owner; UPDATE/DELETE not needed for realtime. |

## Data Flow

```
Trigger Site (Component)
  │  calls data function (e.g., acceptFriendRequest)
  ▼
Data Function (lib/database-client.ts)
  │  1. Performs mutation (UPDATE/INSERT)
  │  2. Calls createNotification() with extracted context
  ▼
Supabase DB ──INSERT──▶ notifications table
  │                        │
  │  realtime publishes    │  RLS enforces user_id = auth.uid()
  ▼                        ▼
NotificationBell          /notifications page
  │  channel("notif-{uid}")  │  getNotifications(userId, page)
  │  .on("INSERT", ...)       │
  ▼                           ▼
DropdownMenu prepends      Paginated list (20/page)
Badge increments
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `lib/types.ts` | Modify | Add `NotificationEventType`, `Notification` interface, `CreateNotificationParams` |
| `lib/notification-client.ts` | Create | `createNotification()`, `getNotifications()`, `getUnreadCount()`, `markAsRead()`, `markAllAsRead()` |
| `lib/database-client.ts` | Modify | Call `createNotification()` from `acceptFriendRequest`, `createPlanComment`, `updateJoinRequest`, `submitReview` |
| `lib/chat-client.ts` | Modify | Call `createNotification()` from `sendMessage` (other participant) |
| `components/notification-bell.tsx` | Create | Bell icon + badge + DropdownMenu + realtime sub; opens `NotificationDropdown` |
| `components/notification-dropdown.tsx` | Create | Last 5 items via shadcn DropdownMenu; live insert; empty state; "Ver todas" + "Marcar todas" actions |
| `components/notification-item.tsx` | Create | Single row: actor avatar/name, title, time-ago, is_read styling, click-to-mark-read + navigate |
| `app/notifications/page.tsx` | Create | Server shell + client paginated list (20/page), mark-read toggle |
| `app/dashboard/layout.tsx` | Modify | Add `<NotificationBell />` next to `<ChatNavLink />` |
| `database-schema.sql` | Modify | Add `notification_event_type_enum`, `notifications` table, indexes, RLS, REPLICA IDENTITY, publication, `cleanup_old_notifications()` function |

## Database Layer

### DDL

```sql
create type notification_event_type_enum as enum (
  'friend_accepted', 'new_message', 'comment_reply',
  'join_accepted', 'review_received'
);

create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  actor_id uuid not null references public.user_profiles(id) on delete cascade,
  type notification_event_type_enum not null,
  title text not null,
  body text not null,
  link text,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

create index idx_notif_user_unread on public.notifications(user_id, is_read)
  where is_read = false;
create index idx_notif_user_created on public.notifications(user_id, created_at desc);

alter table public.notifications enable row level security;
alter table public.notifications replica identity full;
alter publication supabase_realtime add table public.notifications;
```

### RLS Policies

```sql
create policy "Users can view own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Authenticated users can insert notifications" on public.notifications
  for insert with check (auth.uid() is not null);

create policy "Users can update own notification read status" on public.notifications
  for update using (auth.uid() = user_id);
```

### Cleanup

```sql
create or replace function public.cleanup_old_notifications()
returns void language plpgsql security definer as $$
begin
  delete from public.notifications where created_at < now() - interval '360 days';
end; $$;

-- pg_cron (preferred):
select cron.schedule('cleanup-notifications', '0 3 * * *',
  'select public.cleanup_old_notifications();');
```

**Fallback**: If pg_cron unavailable, use Vercel Cron → API route → `supabase.rpc('cleanup_old_notifications')`. Manual SQL documented as last resort.

## Type Definitions

```typescript
// lib/types.ts additions
export type NotificationEventType =
  | 'friend_accepted' | 'new_message' | 'comment_reply'
  | 'join_accepted' | 'review_received';

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  type: NotificationEventType;
  title: string;
  body: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
  actor?: Pick<UserProfile, 'id' | 'username' | 'full_name' | 'avatar_url'>;
}

export interface CreateNotificationParams {
  user_id: string;
  actor_id: string;
  type: NotificationEventType;
  title: string;
  body: string;
  link?: string;
}
```

## Data Functions (lib/notification-client.ts)

| Function | Signature | Supabase Query |
|----------|-----------|----------------|
| `createNotification` | `(params: CreateNotificationParams) → Notification \| null` | `from("notifications").insert(params).select("*").maybeSingle()` |
| `getNotifications` | `(userId, page, limit=20) → { data: Notification[], count: number }` | `from("notifications").select("*, actor:user_profiles!actor_id(id,username,full_name,avatar_url)").eq("user_id", userId).order("created_at", {ascending: false}).range(from, to)` with `count: "exact"` |
| `getUnreadCount` | `(userId) → number` | `from("notifications").select("*", {count: "exact", head: true}).eq("user_id", userId).eq("is_read", false)` |
| `markAsRead` | `(notificationId) → boolean` | `from("notifications").update({is_read: true}).eq("id", notificationId)` |
| `markAllAsRead` | `(userId) → boolean` | `from("notifications").update({is_read: true}).eq("user_id", userId).eq("is_read", false)` |

## Component Design

### NotificationBell (client)

- State: `unreadCount`, `open`, `notifications` (last 5)
- On mount: `getUnreadCount(userId)` → set count
- Window focus: `refreshUnread()`
- Dropdown open: fetch 5 → `getNotifications(userId, 1, 5)`, subscribe to `channel("notifications-{userId}").on("INSERT", ...)` — prepends to list, increments count
- Dropdown close: `supabase.removeChannel(channel)`
- Renders: Bell icon + `UnreadBadge` + `DropdownMenu`

### NotificationDropdown (inside DropdownMenuContent)

- Maps `notifications` state → `NotificationItem`
- Empty state: "No tienes notificaciones"
- Footer: DropdownMenuSeparator → "Ver todas" link (`/notifications`) → "Marcar todas leídas" button
- Mark all: `markAllAsRead(userId)` → set count=0, update UI

### NotificationItem

- Props: `notification: Notification`, `onRead: () => void`
- Actor avatar (initial fallback), name
- Title + body text, `formatRelativeDate(created_at)`
- `is_read` visual: muted opacity when read
- Click: `markAsRead(id)` → navigate to `notification.link` if set

### /notifications page

- Server component wrapper imports client `NotificationList`
- `NotificationList`: `useState` for page, fetches via `getNotifications(userId, page, 20)`
- Each item has mark-read toggle (checkbox/button)
- Pagination: prev/next buttons with page indicator
- Empty state: "No tienes notificaciones aún"

## Integration Points (5 Event Triggers)

### 1. acceptFriendRequest (lib/database-client.ts)

After update succeeds (`data` non-null), create TWO notifications:

```typescript
// Notify original requester
await createNotification({
  user_id: data.user_id,           // requester
  actor_id: userId,                // accepter
  type: 'friend_accepted',
  title: `${accepterName} aceptó tu solicitud de amistad`,
  body: 'Ahora son amigos en SoloTravelers',
  link: `/profile/${accepterUsername}`,
});
// Self-notification for accepter
await createNotification({
  user_id: userId,
  actor_id: userId,
  type: 'friend_accepted',
  title: `Aceptaste la solicitud de ${requesterName}`,
  body: 'Ahora son amigos en SoloTravelers',
  link: `/profile/${requesterUsername}`,
});
```

Requires adding `requester:user_profiles!user_id(id,username,full_name,avatar_url)` to the SELECT in `acceptFriendRequest`.

### 2. sendMessage (lib/chat-client.ts)

After insert succeeds, fetch chat to find other participant, then:

```typescript
const otherId = chat.participant_1_id === userId
  ? chat.participant_2_id : chat.participant_1_id;
await createNotification({
  user_id: otherId,
  actor_id: userId,
  type: 'new_message',
  title: `Nuevo mensaje de ${senderName}`,
  body: content.slice(0, 100),
  link: '/messages',
});
```

### 3. createPlanComment (lib/database-client.ts)

When `commentData.parent_comment_id` exists, after insert succeeds, fetch parent comment's `author_id`. If parent author ≠ current user:

```typescript
await createNotification({
  user_id: parentComment.author_id,
  actor_id: userId,
  type: 'comment_reply',
  title: `${actorName} respondió a tu comentario`,
  body: commentData.content.slice(0, 100),
  link: `/plans/${commentData.plan_id}`,
});
```

### 4. updateJoinRequest (lib/database-client.ts)

Inside existing `if (status === 'accepted' && data)` block, after participant upsert:

```typescript
await createNotification({
  user_id: data.requester_id,
  actor_id: userId,                          // plan creator ID from auth context
  type: 'join_accepted',
  title: `${creatorName} aceptó tu solicitud`,
  body: `Te has unido al plan ${data.plan?.title ?? ''}`,
  link: `/plans/${data.plan_id}`,
});
```

Add `callerId: string` parameter to `updateJoinRequest(requestId, status, permission, callerId)`. All call sites (`join-request-flow.tsx`) pass `user.id` as callerId. This is the plan creator accepting the request.

### 5. submitReview (lib/database-client.ts)

After review insert succeeds:

```typescript
await createNotification({
  user_id: data.reviewed_id,
  actor_id: reviewerId,
  type: 'review_received',
  title: `${reviewerName} te dejó una reseña`,
  body: `${data.rating} estrellas — ${data.comment?.slice(0, 80) ?? 'Sin comentario'}`,
  link: `/profile/${reviewedUsername}`,
});
```

## Realtime Flow

```
Dropdown open:
  channel = supabase
    .channel(`notifications-${userId}`)
    .on("postgres_changes", {
      event: "INSERT", schema: "public",
      table: "notifications",
      filter: `user_id=eq.${userId}`,
    }, (payload) => {
      setNotifications(prev => [payload.new, ...prev].slice(0, 5));
      setUnreadCount(prev => prev + 1);
    })
    .subscribe();

Dropdown close:
  supabase.removeChannel(channel);
```

## Testing Strategy

| Layer | What | How |
|-------|------|-----|
| Build | TypeScript strict, no unused vars | `npm run build` passes |
| Manual | Real-time: two browsers, one triggers event, other sees bell update | Cross-browser test script |
| Manual | All 5 event types produce correct DB rows | SQL query verification |
| Visual | Badge hides at 0, shows count, dropdown empty/filled/paginated | Storybook/visual check |

## Open Questions

- [ ] pg_cron availability on the deployed Supabase instance needs verification; if absent, Vercel Cron API route is the fallback (implement in that case)
