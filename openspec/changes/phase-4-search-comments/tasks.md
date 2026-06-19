# Tasks: Phase 4 — Search & Comments

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 450–650 (Slice 1: 250–350, Slice 2: 200–300) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Slice 1 — Discovery) → PR 2 (Slice 2 — Comments) |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Base |
|------|------|-----------|------|
| 1 | Discover page + filters + card grid + middleware + dashboard link | PR 1 | feature/phase-4-search-comments |
| 2 | Comment data functions, RLS, threaded UI, notes section, plan-detail split | PR 2 | PR 1 branch |

## Phase 1: Foundation (Shared)

- [x] 1.1 Add `CreatePlanCommentData { plan_id, content, parent_comment_id? }` to `lib/types.ts`
- [x] 1.2 Add `/discover` to anonymous-allowed paths in `lib/supabase/middleware.ts` line 54
- [x] 1.3 SQL: Extend `plan_comments` INSERT RLS for private plan participants/creator
- [x] 1.4 SQL: Verify `plan_comments` SELECT RLS allows private plan participants

## Phase 2: Slice 1 — Discovery Page

- [x] 2.1 Create `app/discover/page.tsx` — server page: parse searchParams, call `searchTravelPlans(filters, pagination, true)`, check auth, render children
- [x] 2.2 Create `components/discover-filters.tsx` — client: `useSearchParams` + `useRouter`, plan_type select, date/budget inputs, share checkboxes, sync filter state ↔ URL
- [x] 2.3 Create `components/discover-results.tsx` — client: card grid with authenticated/unauth variants, pagination, empty state
- [x] 2.4 Build verification: `npm run build` passes with zero TS errors

## Phase 3: Slice 2 — Comment Data Layer

- [ ] 3.1 Add `getPlanComments(planId, isServer)` to `lib/database.ts` — query `plan_comments` with author join, `created_at ASC`
- [ ] 3.2 Add `createPlanComment(userId, data, isServer)` to `lib/database.ts` — insert with author join return
- [ ] 3.3 Add `deletePlanComment(commentId, isServer)` to `lib/database.ts` — delete by id, return boolean
- [ ] 3.4 Add browser wrappers for all three to `lib/database-client.ts` matching existing notes pattern

## Phase 4: Slice 2 — Comments UI

- [ ] 4.1 Create `components/comment-item.tsx` — client: author, content, timestamp, reply toggle, delete button (own only)
- [ ] 4.2 Create `components/comment-list.tsx` — client: fetch, `buildCommentTree()` (2 levels), render thread, form gated by `comments_enabled` + access, empty state

## Phase 5: Slice 2 — Notes UI + Plan Detail Restructure

- [ ] 5.1 Create `components/note-item.tsx` — client: author, content, timestamp, "Privada" badge
- [ ] 5.2 Create `components/note-list.tsx` — client: fetch `getPlanNotes`, filter private-non-own, create form with `is_private` toggle, empty state
- [ ] 5.3 Modify `components/plan-detail.tsx` — replace combined section 4 (lines 315–375) with `<CommentList>` (section 4) + `<NoteList>` (section 5), renumber participants to 6

## Phase 6: Dashboard + Verification

- [x] 6.1 Modify `components/dashboard-content.tsx` — replace "Descubrir" tab content with link card to `/discover`
- [ ] 6.2 Verify: `npm run build` (zero TS errors, zero ESLint warnings)
