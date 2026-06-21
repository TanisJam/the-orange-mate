# Proposal: Full Demo Mode

## Intent

Transform the static `/demo` design showcase into a full demo version where unauthenticated users explore ALL sections with mocked data. The app has 8 auth-gated sections — potential users see nothing without signing up. This drives churn at the top of funnel.

## Scope

### In Scope
- `DemoProvider` context that detects demo mode via `/demo/*` path prefix and swaps the data layer
- Mock data generation: 5 interlinked demo users, 4 plans, 3 chats, 10 messages, 8 notifications, 6 friends, 5 reviews — all typed per `lib/types.ts`
- Demo routes: `/demo/dashboard`, `/demo/plans/*`, `/demo/friends`, `/demo/messages/*`, `/demo/notifications`, `/demo/profile/*`, `/demo/discover`
- Simulated mutations: create plan, send message, add friend, write review — all show toast "Demo mode: action simulated" and keep state in-memory
- Supabase realtime disabled in demo; banner "Demo mode — limited functionality" with link to sign up
- `noindex` meta on all demo pages
- Reuse existing page components via route group under `app/(demo)/` with shared layout

### Out of Scope
- Persisted demo state across sessions (in-memory only)
- Photo gallery, avatar upload, Supabase Storage mocks
- Demo-specific UI components (reuse existing)
- Automated tests for mock data or demo routes

## Capabilities

### New Capabilities
- `demo-mode`: Context provider + mock data layer + `/demo/*` route group that reuses existing pages with mocked backend, simulated mutations, and disabled realtime

### Modified Capabilities
- None (additive change — no existing spec behavior changes)

## Approach

**Demo Context Provider + Mock Data Layer** (per exploration recommendation).

1. **`DemoProvider`** (`components/demo-provider.tsx`): React context that detects `pathname.startsWith('/demo')`. Exposes `isDemo`, `demoUser`, and mock versions of all 3 data client modules. When `isDemo=true`, all data calls resolve to in-memory mock stores.

2. **Mock data layer** (`lib/demo/mock-data.ts`): Idempotent factory returning fully typed mock entities. All relationships cross-linked (plan → creator, plan → participants, review → reviewer/reviewed, chat → participants, etc.).

3. **Route group** `app/(demo)/demo/`: Catch-all layout wraps pages in `DemoProvider`, injects `noindex` meta, shows demo banner. Each page reuses the SAME component as the real route (e.g., `DemoDashboardPage` imports `DashboardContent` directly).

4. **Middleware**: Already whitelists `/demo` — no changes needed.

5. **Realtime**: `ChatNavLink` and `NotificationBell` skip Supabase `.channel()` subscription when `isDemo=true`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `components/demo-provider.tsx` | New | Context + mock data layer swap |
| `lib/demo/mock-data.ts` | New | Mock data factory (5 users, 4 plans, 3 chats, etc.) |
| `lib/demo/mock-store.ts` | New | In-memory store for simulated mutations |
| `app/(demo)/demo/layout.tsx` | New | Demo layout with provider, noindex, banner |
| `app/(demo)/demo/` sub-routes | New | Catch-all pages reusing existing components |
| `components/notification-bell.tsx` | Modified | Skip realtime in demo mode |
| `components/chat-nav-link.tsx` | Modified | Skip realtime in demo mode |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Mock data drift from real `lib/types.ts` | Med | Generate from type definitions; CI type-check catches drift |
| Some components make Supabase calls directly (bypassing lib clients) | Med | Audit all pages/components under demo routes for direct `createClient()` calls; wrap or guard |
| Demo route catch-all conflicts with static files | Low | Use route group `(demo)` to keep demo pages isolated from real routes |
| Reused server components call `createClient()` server-side | Low | Demo pages are client-rendered via `"use client"` wrapper that passes mock data as props |

## Rollback Plan

Remove `app/(demo)/`, `components/demo-provider.tsx`, `lib/demo/`. Revert realtime guard changes in notification-bell and chat-nav-link (2 lines each). No database migrations, no schema changes.

## Dependencies

- Existing routes (`/dashboard`, `/plans/*`, `/friends`, `/messages/*`, `/notifications`) functional
- Middleware already whitelists `/demo` (confirmed)

## Success Criteria

- [ ] Unauthenticated user accesses `/demo/dashboard`, sees plans, clicks through to `/demo/plans/[id]` with full detail
- [ ] All 8 sections render with mock data: dashboard, plans, discover, friends, messages, notifications, profiles, reviews
- [ ] Create plan → toast "Demo mode: action simulated" appears; plan appears in dashboard
- [ ] Send message → appears in chat; friend request → accepted with toast
- [ ] No 500 errors or Supabase connection attempts in demo routes
- [ ] `<meta name="robots" content="noindex, nofollow">` present on all `/demo/*` pages
- [ ] Demo banner visible with CTA to sign up
- [ ] `npm run build` passes
