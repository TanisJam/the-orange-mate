# Design: Phase 1 — Plans

## Technical Approach

Two new App Router routes under `app/plans/`, following the existing dashboard pattern: server page (`page.tsx`) handles auth via `createClient().auth.getUser()` → redirects on no session → passes `userId` to a `"use client"` component.

Detail page (`/plans/[id]`) deviates from the dashboard pattern by doing **server-side initial data load** (plan + participants + pending requests) and passing it as props. This provides faster FCP and eliminates the loading flash. Mutations (join request, publish, accept/reject) happen client-side via `database-client.ts`.

## Route & Component Architecture

```
app/plans/
├── new/
│   └── page.tsx                    # Server: auth check → <PlanForm userId={} />
└── [id]/
    └── page.tsx                    # Server: auth + getTravelPlan() → <PlanDetail ... />

components/
├── plan-form.tsx                   # "use client" — full creation form
├── plan-detail.tsx                 # "use client" — ordered sections renderer
├── join-request-flow.tsx           # "use client" — request/accept/reject UI
└── dashboard-content.tsx           # Modified: wire dead buttons to /plans/[id]
```

**`PlanForm` sub-structure** (shadcn/ui cadr + form sections):
1. Title + Plan Type (`Select` from `PLAN_TYPES`)
2. Destinations (dynamic text input array)
3. Dates + Flexible toggle (`Checkbox`)
4. Budget range (two `Input` + `Select` currency)
5. Description (`Textarea` — needs `npx shadcn@latest add textarea`)
6. Max participants (`Input[type=number]`)
7. Sharing toggles (`Checkbox` × 3: accommodation, transport, tours)
8. Visibility + Comments (`Checkbox` × 2)
9. Submit → `createTravelPlan()` + redirect to `/plans/[id]`

**`PlanDetail` sub-structure** (ordered sections per proposal):
1. Header: title, badge ("Not published" if `!is_public`), publish button (creator only)
2. Destinations list
3. Budget range + currency
4. Description
5. Comments section (`getPlanNotes`)
6. Participants list
7. Join/request area → renders `<JoinRequestFlow />`

## Architecture Decisions

| Decision | Options | Tradeoffs | Choice |
|----------|---------|-----------|--------|
| **Detail data loading** | A) Server fetch → pass props. B) Client fetch (like dashboard). | A: better FCP/SEO, avoids loading flash. B: consistent with dashboard, simpler. | **A** — server loads plan+participants+requests, client handles mutations. |
| **Waiting list** | A) New `waiting_list` status in check constraint. B) Count-based (full → pending = waiting). | A: clear semantics, needs migration. B: no migration, but ambiguous UX. | **A** — add `waiting_list` to `plan_join_requests.status` check constraint. |
| **Permission picker** | A) Keep hardcoded `solo_ver`. B) `Select` in accept dialog. | A: simple, inflexible. B: correct, requires passing param through `updateJoinRequest`. | **B** — accept dialog renders `PERMISSION_LEVELS` select, default `solo_ver`. |
| **Re-application after rejection** | A) Update existing rejected row back to pending. B) Remove unique constraint. | A: preserves audit trail (one row per user/plan). B: simpler inserts, loses history. | **A** — upsert: if exists(rejected) → update to pending, else → insert. |
| **Comment RLS fix** | Match `travel_plans` select policy (public OR creator OR participant). | Aligns with plan visibility. | Replace `plan_comments` select policy with the same pattern. |
| **Publish action placement** | A) Inline button in detail header. B) Form toggle in edit page. | A: immediate, visible. B: buried. Edit page is out of scope. | **A** — `Button` in header calls `updateTravelPlan({is_public: true})`. |

## Data Flow

```
Create Plan:
  User → PlanForm (client)
    ├─ submit form
    └─ createTravelPlan(userId, data) → redirect → /plans/[id]

View Detail:
  Server page.tsx
    ├─ getTravelPlan(planId, isServer=true)  → plan + creator + participants
    ├─ getPlanJoinRequests(planId, isServer=true)  → pending requests
    └─ pass as props → PlanDetail (client)
        ├─ render sections from initial data
        └─ user actions (client-side mutations):
            ├─ publish → updateTravelPlan({is_public: true})
            ├─ join request → createJoinRequest(userId, {plan_id, message})
            ├─ accept → updateJoinRequest(reqId, 'accepted', permission_level)
            └─ reject → updateJoinRequest(reqId, 'rejected')
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `app/plans/new/page.tsx` | Create | Server auth → `<PlanForm>` |
| `app/plans/[id]/page.tsx` | Create | Server auth + data load → `<PlanDetail>` |
| `components/plan-form.tsx` | Create | "use client" form, all `travel_plans` fields |
| `components/plan-detail.tsx` | Create | "use client" detail renderer with ordered sections |
| `components/join-request-flow.tsx` | Create | "use client" request button + accept/reject card |
| `components/dashboard-content.tsx` | Modify | Replace dead `<Button>`s with `<Link href={/plans/${plan.id}}>` |
| `lib/database.ts` | Modify | `updateJoinRequest` accepts `permission_level?` param |
| `lib/database-client.ts` | Modify | Export `createJoinRequest`, `updateJoinRequest`, `getPlanJoinRequests`, `getPlanNotes`, `createPlanNote` |
| `database-schema.sql` | Modify | Add `waiting_list` to status check; fix plan_comments RLS |

## RLS + Schema Fixes

**`plan_join_requests.status` check constraint**:
```sql
-- Before:
check (status in ('pending', 'accepted', 'rejected'))
-- After:
check (status in ('pending', 'accepted', 'rejected', 'waiting_list'))
```

**`plan_comments` select policy** (replace existing):
```sql
create policy "Users can view comments on accessible plans" on public.plan_comments
  for select using (
    exists (
      select 1 from public.travel_plans
      where id = plan_id and (
        is_public = true or
        creator_id = auth.uid() or
        exists (select 1 from public.plan_participants where plan_id = travel_plans.id and user_id = auth.uid())
      )
    )
  );
```

## Open Questions

- [ ] Should the `unique(plan_id, requester_id)` constraint be removed to allow re-application, or should we upsert rejected rows? (Design assumes upsert.)
- [ ] Does the `Textarea` component from shadcn need to be installed manually before implementation? (Not in `components/ui/` currently.)
