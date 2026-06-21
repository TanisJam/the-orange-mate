# Design: Full Demo Mode

## Technical Approach

Add a `(demo)` route group with a `DemoProvider` context and mock data layer that lets unauthenticated users explore all app features under `/demo/*` using the same components as the real routes. Server pages under `(demo)` skip auth checks and pass mock data as props; client mutations go through `useDemo()` hook to simulate writes with toast feedback.

```
app/
├── (demo)/demo/          ← route group (doesn't affect URL)
│   ├── layout.tsx         ← DemoProvider wrapper + noindex + banner
│   ├── dashboard/page.tsx ← mock data → DashboardContent
│   ├── plans/[id]/page.tsx
│   ├── plans/new/page.tsx
│   ├── friends/page.tsx
│   ├── messages/page.tsx
│   ├── messages/[chatId]/page.tsx
│   ├── notifications/page.tsx
│   ├── discover/page.tsx
│   └── profile/[username]/page.tsx
└── demo/page.tsx          ← existing design-system page (unchanged)

components/
├── demo-provider.tsx      ← React context + useDemo() hook
└── demo-banner.tsx        ← "Demo mode — limited functionality" bar

lib/demo/
├── mock-data.ts           ← idempotent factory (5 users, 4 plans, 3 chats, ...)
└── mock-store.ts          ← in-memory mutable store for simulated mutations
```

## Architecture Decisions

| Decision | Option A | Option B | Choice | Rationale |
|----------|----------|----------|--------|-----------|
| Route structure | Route group `app/(demo)/demo/` | Catch-all `[...route]` | **A** | Explicit per-route pages allow per-page mock data loading; matches Next.js conventions; no path-parsing hacks. |
| Component reuse | Demo pages import existing components + pass mock props | Make components demo-aware via context | **A** | Existing components already receive data as props (e.g., `DashboardContent({userId})`, `PlanDetail({plan, currentUserId})`). Adding optional `initial*` props is a 2-line change vs. threading context through every render path. |
| Mock data source | Static factory `lib/demo/mock-data.ts` | Generated at build-time from types | **Static** | Types change slowly; factory is simpler and debuggable. CI type-check catches drift. |
| Mutation simulation | `useDemo()` hook exposes `demoActions` (toast + in-memory store update) | Proxy/wrapper around `database-client.ts` | **Hook** | Hooks are explicit and testable. Wrapping the data-client would require dynamic imports or conditional paths that Next.js tree-shaking doesn't handle well. |
| Auth bypass (server) | Demo pages skip `supabase.auth.getUser()` entirely | Mock `createClient()` to return fake session | **Skip** | Cleaner — no risk of Supabase connection attempts. Demo pages are pure data renderers. |
| Realtime disable | `useDemo()` early-return guard in `NotificationBell`, `ChatNavLink` | Flag-based conditional in each component | **Context guard** | Single check at top of `useEffect`; no prop drilling. Components already client-side. |

## DemoProvider Context Shape

```ts
// components/demo-provider.tsx
interface DemoContextValue {
  isDemo: boolean;
  demoUser: UserProfile;
  users: UserProfile[];
  plans: TravelPlan[];
  chats: Chat[];
  messages: Message[];
  notifications: Notification[];
  friends: EnrichedFriend[];
  reviews: UserReview[];
  // Simulated mutations — each shows toast on success
  createPlan: (data: CreateTravelPlanData) => TravelPlan;
  sendMessage: (data: CreateMessageData) => Message;
  sendFriendRequest: (friendId: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  submitReview: (data: CreateReviewData) => UserReview;
  submitJoinRequest: (planId: string) => void;
}
```

Placed in `app/(demo)/demo/layout.tsx` (server component wrapping client layout):

```
DemoLayout (server)
  └── DemoLayoutClient ("use client")
        ├── DemoProvider {value from mock-data + mock-store}
        │   └── {children}
        └── DemoBanner "Demo mode — limited functionality" + Sign up CTA
```

## Auth Bypass Strategy

| Layer | Strategy |
|-------|----------|
| Middleware (`lib/supabase/middleware.ts`) | Already whitelists `startsWith("/demo")` on line 53. No changes needed. |
| Server pages (route group) | Demo pages do NOT call `supabase.auth.getUser()`. They import `getMockDataSet()` from `lib/demo/mock-data.ts` and pass to client components. |
| Client data-fetch components (`DashboardContent`, `NotificationList`) | Accept optional `initial*` props. When provided (demo mode), skip `useEffect` fetch and use props directly. Added: `initialProfile?`, `initialPlans?`, etc. |
| Client mutation components | Check `const { isDemo, createPlan } = useDemo()`. If `isDemo`, call the demo action (toast + store update). If not, call real `createTravelPlan()` from `lib/database-client.ts`. |

## Component Reuse — Specific Patterns

**No-change components** (already receive all data as props):
- `PlanDetail({plan, currentUserId})` — demo page passes mock plan + demoUserId
- `ChatList({chats, currentUserId})` — demo page passes mock chats
- `FriendsPageClient({initialFriends, ...})` — demo page passes mock friends
- `DiscoverResults({plans, isAuthenticated, currentUserId})` — demo page passes mock search results

**Minimal-change components** (add optional `initial*` props):
- `DashboardContent` — add `initialProfile?`, `initialPlans?`, `initialParticipatingPlans?`, `initialSuggestedPlans?`. When all provided, skip `loadDashboardData()`.
- `NotificationList` — add `demoUserId?` prop. When provided, skip `supabase.auth.getUser()` call and use `demoUserId` in `getNotifications()`.

**Context-aware components** (check `useDemo()`):
- `NotificationBell` — guard Supabase `.channel()` subscription with `if (isDemo) return;` 
- `ChatNavLink` — same guard for realtime subscription
- `PlanDetail` (mutations: join/comment) — check `isDemo` before calling `createJoinRequest()` / `createPlanComment()`

## Realtime Disable

```ts
// In NotificationBell useEffect (line 71-72):
if (!open || !userId || isDemo) return;

// In ChatNavLink useEffect (line 31-33):
if (isDemo) { setUnreadCount(3); return; } // show static badge
```

The `DemoBanner` shows: "You're in demo mode — real-time features are disabled. [Sign up] to connect with real travelers."

## Sequence: Plan Creation in Demo

```
User clicks "Create Plan" button
  → form component checks useDemo().isDemo
    → calls createPlan(mockData) from context
      → mock-store adds plan to in-memory array
      → toast("Demo mode: plan created!")
      → returns the new TravelPlan object
        → local state updates → plan appears in list
```

## Sequence: Message Send in Demo

```
User types message, clicks Send
  → ChatView checks useDemo().isDemo
    → calls sendMessage({chat_id, content}) from context
      → mock-store creates Message with demoUser as sender
      → returns Message with sender populated
        → local messages state updated → message appears
```

## File Change Inventory

### New Files (11)
| File | Purpose |
|------|---------|
| `components/demo-provider.tsx` | Context + useDemo() hook + DemoDataSet type |
| `components/demo-banner.tsx` | Banner bar with CTA |
| `lib/demo/mock-data.ts` | Idempotent factory — 5 users, 4 plans, 3 chats, 10 messages, 8 notifications, 6 friends, 5 reviews |
| `lib/demo/mock-store.ts` | In-memory mutable store with mutation methods |
| `app/(demo)/demo/layout.tsx` | DemoLayoutClient wrapping DemoProvider + DemoBanner |
| `app/(demo)/demo/dashboard/page.tsx` | Load mock data → DashboardContent |
| `app/(demo)/demo/plans/[id]/page.tsx` | Load mock plan → PlanDetail |
| `app/(demo)/demo/friends/page.tsx` | Load mock friends → FriendsPageClient |
| `app/(demo)/demo/messages/page.tsx` | Load mock chats → ChatList |
| `app/(demo)/demo/notifications/page.tsx` | Load mock notifications → NotificationList |
| `app/(demo)/demo/discover/page.tsx` | Load mock search → DiscoverResults |

### Modified Files (4)
| File | Change |
|------|--------|
| `components/dashboard-content.tsx` | Add optional `initialProfile?`, `initialPlans?`, `initialParticipatingPlans?`, `initialSuggestedPlans?`; skip fetch when all provided |
| `components/notification-list.tsx` | Add optional `demoUserId?`; skip auth check when provided |
| `components/notification-bell.tsx` | Import `useDemo`, guard realtime subscription with `isDemo` check |
| `components/chat-nav-link.tsx` | Import `useDemo`, guard realtime subscription; show static badge in demo |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Build | All demo pages render without errors | `npm run build` must pass |
| Manual | 8 sections render with mock data | Click through each `/demo/*` route |
| Manual | Mutations: create plan, send message, add friend, write review | Verify toast appears + in-memory state updates |
| Manual | No Supabase 500 errors in demo | Check console for no `createClient()` failures |
| Manual | Realtime: notification bell / chat nav don't error | Verify banner shows "real-time disabled" |
| Manual | `noindex` meta present | View source on `/demo/dashboard` |

No automated test runner is configured. Build verification + manual smoke test covers the success criteria.

## Open Questions

None — all design decisions have clear rationale and the codebase patterns are well understood.
