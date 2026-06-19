# Proposal: Phase 1 — Plans

## Intent

Enable plan creation, detail viewing, and join requests. Dashboard renders plan cards with dead buttons — users can't create, view, or join plans.

## Scope

### In Scope
- `/plans/new` — Creation form with all `travel_plans` fields
- `/plans/[id]` — Detail page: destinations → budget → description → comments → participants → join
- Join request: request → creator sees pending → accept (with permission) or reject
- Private-by-default; "not published" badge; publish action
- Wire dashboard cards to detail page

### Out of Scope
Plan editing, messaging, friends, filters, photo gallery, reviews

## Capabilities

### New Capabilities
- `plan-creation`: Form with all fields; creator becomes participant; `is_public=false`
- `plan-detail`: Server-rendered page with destinations → budget → description → comments → participants
- `plan-visibility`: "Not published" badge on private plans; publish action; restricted view for non-participants
- `join-request-flow`: Request, creator queue, accept (permission picker, default `solo_ver`) or reject. Full → waiting list

### Modified Capabilities
- None

## Approach

Two new App Router routes under `app/plans/`:

1. **`/plans/new`** — Server → client `PlanForm` with all fields. Submit creates plan + inserts creator as participant.
2. **`/plans/[id]`** — Server loads plan + creator + participants + pending requests. Client `PlanDetail` renders ordered sections + join/request UI.

3. **Dashboard wiring** — Replace dead buttons with `next/link` to `/plans/[id]`.
4. **Database fix** — Parametrize permission in `updateJoinRequest` (hardcoded `solo_ver`). Fix comment RLS for private-plan participants.

## Affected Areas

| Area | Impact |
|------|--------|
| `app/plans/new/page.tsx` | New |
| `app/plans/[id]/page.tsx` | New |
| `components/plan-form.tsx` | New |
| `components/plan-detail.tsx` | New |
| `components/join-request-flow.tsx` | New |
| `components/dashboard-content.tsx` | Modified |
| `lib/database.ts` | Modified |
| `database-schema.sql` | Modified |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Comment RLS blocks private-plan participants | High | Fix first: add participant check to comment select policy |
| `unique(plan_id, requester_id)` conflicts with waiting-list | Med | Allow insert; rejected users can re-apply |
| Form complexity | Low | Group fields; hide advanced behind collapsible sections |

## Rollback Plan

Remove `app/plans/`, revert dashboard links, roll back RLS policy. No data migration — schema changes are additive.

## Dependencies

- Supabase schema deployed (confirmed)
- Dashboard functional (confirmed)

## Success Criteria

- [ ] Create plan → appears on dashboard
- [ ] Detail page renders all sections in defined order
- [ ] "Not published" badge visible; publish action works
- [ ] Join request → creator accept/reject → participant/permission assigned
- [ ] Full plan → waiting list behavior works
- [ ] Dashboard cards link to `/plans/[id]`
- [ ] `npm run build` passes
