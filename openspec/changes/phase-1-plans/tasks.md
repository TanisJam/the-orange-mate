# Tasks: Phase 1 — Plans

## Review Workload Forecast

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

| Unit | Goal | PR | Lines | Base |
|------|------|-----|-------|------|
| 1 | Prerequisites + DB foundation | PR 1 | ~95 | main |
| 2 | Plan creation (form + /plans/new) | PR 2 | ~195 | main, after PR 1 |
| 3 | Detail, join flow, dashboard | PR 3 | ~250 | main, after PR 1 |

## Phase 1: Prerequisites (PR 1)

- [x] 1.1 Install shadcn Textarea: `npx shadcn@latest add textarea`
- [x] 1.2 Add `'waiting_list'` to `JoinRequestStatus` union in `lib/types.ts`
- [x] 1.3 `database-schema.sql`: add `'waiting_list'` to `plan_join_requests.status` check constraint
- [x] 1.4 `database-schema.sql`: replace `plan_comments` select policy with public/creator/participant check per design

## Phase 2: Database Layer (PR 1, continued)

- [x] 2.1 `lib/database.ts`: modify `createTravelPlan()` to insert creator into `plan_participants` with `editar` after plan insert (permission elevated from `solo_ver` since creator owns the plan)
- [x] 2.2 `lib/database.ts`: add `permission_level?: PermissionLevel` param to `updateJoinRequest()`; use it in participant insert instead of hardcoded `'solo_ver'`
- [x] 2.3 `lib/database-client.ts`: mirror `createTravelPlan()` auto-participant logic from 2.1
- [x] 2.4 `lib/database-client.ts`: export `createJoinRequest`, `updateJoinRequest`, `getPlanJoinRequests`, `getPlanNotes`, `createPlanNote`

## Phase 3: Plan Creation (PR 2)

- [x] 3.1 Create `components/plan-form.tsx`: "use client" form with all `travel_plans` fields (title, type select, destinations array, dates+flexible toggle, budget range+currency, description via Textarea, max participants, sharing toggles×3, visibility+comments toggles). Per-field validation errors per spec. Submit calls `createTravelPlan()` + redirect to `/plans/[id]`.
- [x] 3.2 Create `app/plans/new/page.tsx`: server auth check pattern from `app/dashboard/page.tsx` — redirect login on fail → render `<PlanForm userId={} />`
- [x] 3.3 Verify: plan creation flow — non-auth redirect, validation errors, successful insert → private plan, creator is participant with `solo_ver`

## Phase 4: Plan Detail + Join Flow (PR 3)

- [x] 4.1 Create `components/plan-detail.tsx`: "use client" — sections in order: destinations → budget → description → comments (`getPlanNotes`) → participants. "Not Published" badge for creator of private plans. Publish button (calls `updateTravelPlan({is_public: true})`). Hide comments+participants for non-participants of private plans.
- [x] 4.2 Create `app/plans/[id]/page.tsx`: server auth + load plan via `getTravelPlan(isServer=true)`, join requests via `getPlanJoinRequests(isServer=true)`, pass as props to `<PlanDetail>`
- [x] 4.3 Create `components/join-request-flow.tsx`: "use client" — join request form (for non-participants), pending queue for creator (accept with `PERMISSION_LEVELS` select default `solo_ver`, reject), waiting-list message when at capacity. Re-application via upsert rejected rows.
- [x] 4.4 Verify: detail + join flow works

## Phase 5: Dashboard Wiring (PR 3, continued)

- [x] 5.1 `components/dashboard-content.tsx`: replace dead `<Button>` instances ("Ver", "Ver Detalles", "Editar", "Crear Nuevo Plan") with `<Link href={/plans/${plan.id}}>` or `<Link href="/plans/new">`
- [x] 5.2 Verify: clicking plan cards navigates to detail, "Crear Nuevo Plan" navigates to form, no broken interactions
