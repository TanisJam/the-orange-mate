# Proposal: Phase 4 — Search & Comments

## Intent

`searchTravelPlans()` has no UI. Comments table and types exist but lack data functions and UI. Notes are loaded but mixed into a single undifferentiated section with comments. Two slices deliver discovery and engagement.

## Scope

### In Scope
- `/discover` page: filter panel (plan_type, destinations, date range, budget, share options), paginated results grid reusing dashboard plan card pattern
- Comment data functions: `getPlanComments`, `createPlanComment`, `deletePlanComment` in `database.ts` + `database-client.ts`
- `CreatePlanCommentData` type
- Threaded comment list + create/delete in `plan-detail.tsx` (2-level nesting: comment + reply)
- Split combined "Notas y Comentarios" into separate comments section and notes section
- Notes create form (data functions already exist)

### Out of Scope
- Comment editing, reactions, rich text, notifications
- Infinite scroll, full-text search, location-based search
- Comment counts on plan cards

## Capabilities

### New Capabilities
- `plan-discovery`: Public plan search at `/discover` with filters, paginated grid, empty state
- `plan-comments`: Threaded comments on public plans. CRUD gated by `comments_enabled=true`.

### Modified Capabilities
- `plan-detail`: Split combined section 4 into dedicated comments section (threaded) then notes section (participants only). Each gets its own form.

## Approach

**Slice 1 — Discovery**: Server page `app/discover/page.tsx` reads URL search params → `SearchFilters`, calls `searchTravelPlans()` server-side. Client `DiscoverFilters` component manages filter state via URL. Results rendered as card grid. Pagination controls.

**Slice 2 — Comments + Notes**: Add server + browser comment functions querying `plan_comments` with author join, ordering by `created_at ASC`. Build comment tree client-side from flat result (group by `parent_comment_id`). Restructure `plan-detail.tsx`: section 4 becomes threaded comments with create/delete, section 4b becomes notes with existing data + new create form. Comment form hidden when `comments_enabled=false` or plan not public.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/discover/page.tsx` | New | Server page with search + pagination |
| `components/discover-filters.tsx` | New | Client filter panel |
| `components/discover-results.tsx` | New | Card grid + pagination |
| `lib/database.ts` | Modified | `getPlanComments`, `createPlanComment`, `deletePlanComment` |
| `lib/database-client.ts` | Modified | Browser-side comment functions |
| `lib/types.ts` | Modified | `CreatePlanCommentData` type |
| `components/plan-detail.tsx` | Modified | Separate comments + notes sections with forms |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| URL params desync from filter UI state | Med | `useSearchParams` as single source of truth |
| Empty result pages feel broken | Low | Explicit empty state with suggestion to broaden filters |
| Comment insert RLS blocks silently | Low | Disable form when `!is_public || !comments_enabled` |
| Nested comments depth uncontrolled | Low | Cap at 2 levels; render flat beyond |

## Rollback Plan

Remove `app/discover/`. Revert `plan-detail.tsx` to current combined section. Remove comment functions from `database.ts` and `database-client.ts`. Remove `CreatePlanCommentData` from `types.ts`. Verify `npm run build`.

## Dependencies

- `searchTravelPlans()`, `getPlanNotes()`, `createPlanNote()` — complete
- `plan_comments` table with RLS — deployed
- `PlanComment`, `SearchFilters`, `PaginationParams` types — complete
- shadcn/ui primitives — installed

## Success Criteria

- [ ] `/discover` renders filterable, paginated grid of public plans
- [ ] Threaded comments render with correct nesting on plan detail
- [ ] Create/delete comment works; form hidden when `comments_enabled=false`
- [ ] Notes section visible only to participants/creator with create form
- [ ] `npm run build` passes
