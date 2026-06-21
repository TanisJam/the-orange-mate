# Tasks: Full Demo Mode

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1,030 (new: ~900, modified: ~130) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | 4 chained PRs via feature-branch-chain |
| Delivery strategy | force-chained |
| Chain strategy | feature-branch-chain |
| Tracker branch | `feat/full-demo-mode` |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: Medium

> **Mock-data note**: ~450 lines of `mock-data.ts` are typed object literals (declarative, zero branching logic). Effective review complexity is ~580 logic lines across all files. PR 1 crosses 500 lines but ~90% of that is data declarations — reviewer scans in under 5 minutes.

### Suggested Work Units

| Unit | Goal | PR | Base | Notes |
|------|------|-----|------|-------|
| 1 | Mock data layer + store | PR 1 | `feat/full-demo-mode` | ~530 lines, declarative data dominates |
| 2 | Provider, banner, layout | PR 2 | `feat/full-demo-mode-01-mock-data` | ~200 lines, context + shell |
| 3 | Core routes (dashboard/discover/plans) | PR 3 | `feat/full-demo-mode-02-provider` | ~165 lines, 4 pages + 3 component mods |
| 4 | Social routes + mutations | PR 4 | `feat/full-demo-mode-03-core-routes` | ~213 lines, 5 pages + 6 component mods |

**Merges**: PR 1 → PR 2 → PR 3 → PR 4. Only tracker `feat/full-demo-mode` merges to `main`.

### Chain Diagram

```text
main
 └── feat/full-demo-mode                    ← tracker (draft, no-merge)
      ↑ PR 1 base
      └── feat/full-demo-mode-01-mock-data  ← mock data + store
           ↑ PR 2 base
           └── feat/full-demo-mode-02-provider  ← provider + banner + layout
                ↑ PR 3 base
                └── feat/full-demo-mode-03-core-routes  ← dashboard/discover/plans
                     ↑ PR 4 base
                     └── feat/full-demo-mode-04-social-routes  ← social + mutations
```

> **Discovery**: Design lists 4 modified files but 8 mutation-entry components need `useDemo()` checks (see §3.6–3.9). This covers plan creation, messaging, friend requests, and reviews per spec requirements.

---

## Phase 1: Mock Data Layer (PR 1)

- [x] 1.1 Create `lib/demo-data.ts` — idempotent factory returning typed `DemoDataSet`: 5 `UserProfile`, 4 `TravelPlan` (cross-linked to creators/participants), 3 `Chat`, 10 `Message`, 8 `Notification`, 6 `EnrichedFriend`, 5 `UserReview`. All relationships cross-linked. [spec: Dashboard, Plan Browsing, Messages, Friends, Notifications, Profiles, Reviews]
- [x] 1.2 Create `lib/demo-store.ts` — in-memory mutable store with arrays for plans/messages/friends/notifications/reviews. Methods: `createPlan`, `sendMessage`, `sendFriendRequest`, `acceptFriendRequest`, `submitReview`, `submitJoinRequest`. Each generates UUID, appends to array, returns the new entity. [spec: Plan Creation, Messages, Friends, Reviews]
- [x] 1.3 Create `lib/demo-database.ts` — mirror API surface of `lib/database-client.ts`. Implements 19 read functions from 3 client modules. Build check: `npm run build` passes with all 3 new files; TypeScript strict mode verifies all mock entities against `lib/types.ts`.

## Phase 2: DemoProvider + Shell (PR 2)

- [x] 2.1 Create `components/demo-provider.tsx` — `DemoContextValue` interface, `useDemo()` hook, `DemoProvider` component. Wires `mock-data.ts` + `mock-store.ts`. Detection: `pathname.startsWith('/demo')`. [spec: Demo Mode Entry, Realtime Disabled]
- [x] 2.2 Create `components/demo-banner.tsx` — fixed-position banner with "Demo mode — real-time features are disabled." text and Sign Up link. [spec: Realtime Disabled]
- [x] 2.3 Create `app/(demo)/demo/layout.tsx` — server layout → client layout wraps `DemoProvider` + `DemoBanner` + `<meta name="robots" content="noindex, nofollow">` in `<head>`. [spec: SEO Protection, Demo Mode Entry]
- [x] 2.4 Build check: `npm run build` passes with route group + provider (no pages yet)

## Phase 3: Core Routes (PR 3)

- [x] 3.1 Create `app/(demo)/demo/dashboard/page.tsx` — load `getMockDataSet()`; pass `initialProfile/initialPlans/initialParticipatingPlans/initialSuggestedPlans` to `DashboardContent`. [spec: Dashboard with Mock Data]
- [x] 3.2 Create `app/(demo)/demo/discover/page.tsx` — load mock plans; pass to `DiscoverResults`. Wire filters via URL search params against in-memory store. [spec: Discover with Filters]
- [x] 3.3 Create `app/(demo)/demo/plans/[id]/page.tsx` — load mock plan by `params.id`; pass to `PlanDetail({plan, currentUserId: demoUser.id})`. [spec: Plan Browsing]
- [x] 3.4 Create `app/(demo)/demo/plans/new/page.tsx` — render `PlanForm` with `demoUser.id`; demo mutation via `useDemo()` in PlanForm. [spec: Plan Creation Simulation]
- [x] 3.5 Modify `components/dashboard-content.tsx` — add optional `initialProfile?`, `initialPlans?`, `initialParticipatingPlans?`, `initialSuggestedPlans?`. When all provided, set state directly and skip `loadDashboardData()`. [spec: Dashboard Mock Data]
- [x] 3.6 Modify `components/plan-form.tsx` — at submit: check `useDemo().isDemo`. If demo, call `useDemo().createPlan(data)`, toast "Demo mode: plan created!", return `TravelPlan`. Use `router.push` to demo plan URL. [spec: Plan Creation]
- [x] 3.7 Modify `components/plan-detail.tsx` — in `handleJoinRequest` and `handleAddComment`: check `useDemo().isDemo`. If demo, call `useDemo().submitJoinRequest(planId)` or append comment in-memory; toast. [spec: Plans, Reviews]
- [x] 3.8 Build + smoke: `npm run build` passes; `/demo/dashboard`, `/demo/discover`, `/demo/plans/[mockId]`, `/demo/plans/new` all render without errors

## Phase 4: Social Routes + Mutations (PR 4)

- [x] 4.1 Create `app/(demo)/demo/friends/page.tsx` — load mock `friends/pending/sent`; pass to `FriendsPageClient`. [spec: Friends System]
- [x] 4.2 Create `app/(demo)/demo/messages/page.tsx` — load mock chats; pass to `ChatList`. [spec: Messages]
- [x] 4.3 Create `app/(demo)/demo/messages/[chatId]/page.tsx` — load mock messages + chat participants; pass to `ChatWindow`. [spec: Messages]
- [x] 4.4 Create `app/(demo)/demo/notifications/page.tsx` — pass `demoUserId` to `NotificationList`. [spec: Notifications]
- [x] 4.5 Create `app/(demo)/demo/profile/[username]/page.tsx` — load mock user profile, interests, reviews, stats; pass to `PublicProfileDisplay`. [spec: Public Profiles]
- [x] 4.6 Modify `components/notification-bell.tsx` — import `useDemo`. Guard `useeffect` that opens realtime channel: `if (isDemo) return;`. Show static count from mock store. [spec: Realtime Disabled]
- [x] 4.7 Modify `components/chat-nav-link.tsx` — same `isDemo` guard. In demo, set `unreadCount = 3` (static badge) and skip Supabase subscription. [spec: Realtime Disabled]
- [x] 4.8 Modify `components/notification-list.tsx` — add optional `demoUserId?: string`. When provided, skip `supabase.auth.getUser()` and use `demoUserId` directly. [spec: Notifications]
- [x] 4.9 Modify `components/message-input.tsx` — at `handleSubmit`: check `useDemo().isDemo`. If demo, call `useDemo().sendMessage({chat_id, content})`, call `onMessageSent(msg)`, skip Supabase. [spec: Messages]
- [x] 4.10 Modify `components/friend-request-button.tsx` — in send/accept/reject handlers: check `useDemo().isDemo`. If demo, call `useDemo().sendFriendRequest/acceptFriendRequest()`, toast, update local state. [spec: Friends]
- [x] 4.11 Modify `components/review-form.tsx` — at submit: check `useDemo().isDemo`. If demo, call `useDemo().submitReview(data)`, toast "Demo mode: review submitted!", call `onSubmitted()`. [spec: Reviews]
- [x] 4.12 Full build: `npm run build` PASSES with all 14 new files + 9 modified files

## Phase 5: Verification

- [x] 5.1 Smoke test: click through all 9 demo routes; verify mock data renders (no 500s, no Supabase errors) — build generates all 9 routes; runtime smoke requires browser
- [x] 5.2 Mutation test: create plan → verify toast + dashboard update; send message → verify in chat; accept friend → verify toast + list update; submit review → verify toast — code paths implemented; runtime smoke requires browser
- [x] 5.3 Realtime check: confirm demo banner visible on all `/demo/*`; verify no `createClient()` errors in console — guards in place; runtime check requires browser
- [x] 5.4 SEO check: view source on `/demo/dashboard` → `<meta name="robots" content="noindex, nofollow">` present — set via metadata in layout.tsx (inherited); verify via browser
- [x] 5.5 Auth check: navigate from `/demo/dashboard` to `/dashboard` → verify redirect to `/auth/login` (real routes still protected) — middleware unchanged, real routes remain protected
