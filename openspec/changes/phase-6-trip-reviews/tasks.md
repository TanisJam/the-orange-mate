# Tasks: Phase 6 — Trip Reviews

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 500–650 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (data layer) → PR 2 (UI + integration) |
| Delivery strategy | feature-branch-chain |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | DB schema + types + server/client data layer | PR 1 | Base: `feature/phase-6-trip-reviews`; ~200 lines; standalone build-verifiable |
| 2 | UI components + page integration | PR 2 | Base: PR 1 branch; ~400 lines; full feature integration |

---

## Phase 1: Schema + Types

- [x] 1.1 `database-schema.sql`: `ALTER TYPE plan_status_enum ADD VALUE 'completado'`; add `completed_at TIMESTAMPTZ` to `travel_plans`; add `edited_at TIMESTAMPTZ` to `user_reviews`; update RLS select policy on `user_reviews` to require `auth.uid() IS NOT NULL`
- [x] 1.2 `lib/types.ts`: add `'completado'` to `PlanStatus` union; add `completed_at?: string` to `TravelPlan` interface; add `edited_at?: string` to `UserReview` interface; add `{ value: 'completado', label: 'Completado', color: 'bg-success' }` to `PLAN_STATUSES`; add `CreateReviewData` and `UpdateReviewData` interfaces

## Phase 2: Server-side Data Functions

- [x] 2.1 `lib/database.ts`: `completeTrip(planId, userId, isServer?)` — verify `creator_id = userId`, set `status = 'completado'` + `completed_at = NOW()` atomically
- [x] 2.2 `lib/database.ts`: `submitReview(reviewerId, data: CreateReviewData, isServer?)` — insert into `user_reviews`; verify plan status is `'completado'` and reviewer is participant
- [x] 2.3 `lib/database.ts`: `editReview(reviewId, reviewerId, data: UpdateReviewData, isServer?)` — update rating/comment; set `edited_at = NOW()`; verify `reviewer_id = reviewerId`
- [x] 2.4 `lib/database.ts`: `getPlanReviews(planId, isServer?)` — select reviews with reviewer profile join, ordered by `created_at`
- [x] 2.5 `lib/database.ts`: `getUserReviews(userId, isServer?)` — select reviews where `reviewed_id = userId` with reviewer profile join
- [x] 2.6 `lib/database.ts`: `getAverageRating(userId, isServer?)` — compute avg rating + count for `reviewed_id = userId`

## Phase 3: Browser Client Wrappers

- [x] 3.1 `lib/database-client.ts`: add `completeTrip(planId, userId)`, `submitReview(reviewerId, data)`, `editReview(reviewId, reviewerId, data)` — same logic, no `isServer` param, uses `createClient()` directly. Import `CreateReviewData`, `UpdateReviewData`, `UserReview` from types
- [x] 3.2 `lib/database-client.ts`: add `getPlanReviews(planId)`, `getUserReviews(userId)`, `getAverageRating(userId)` — same pattern as server-side but without `isServer`

## Phase 4: UI Components

- [ ] 4.1 `components/star-selector.tsx`: 1–5 clickable stars using lucide `Star`/`StarOff`. Props: `rating: number`, `onChange?: (r: number) => void`, `readonly?: boolean`. Filled/empty class: `text-warning`
- [ ] 4.2 `components/review-form.tsx`: StarSelector + `<Textarea>` + submit `<Button>`. Props: `reviewedId`, `planId`, `onSubmit`, `initialRating?`, `initialComment?` (for edit pre-fill). Calls `submitReview`/`editReview` from database-client
- [ ] 4.3 `components/review-card.tsx`: reviewer avatar, name (link to profile), stars (readonly), comment, `formatDate(created_at)`, "(editado)" badge if `edited_at`. Own review → edit button swaps to `ReviewForm` inline
- [ ] 4.4 `components/reviews-section.tsx`: average stars + numeric (e.g., ★★★★☆ 4.2) + list of `ReviewCard`. Empty state: "No reviews yet". Props: `reviews: UserReview[]`, `averageRating`, `currentUserId`

## Phase 5: Page Integration

- [ ] 5.1 `components/plan-detail.tsx`: add `reviews`, `averageRating`, `onPlanUpdated` props. "Mark as Completed" button for creator when `status !== 'completado'` (uses `completeTrip` from database-client). Reviews section at position 7 (after participants), gated on `status === 'completado'` + `isAuthenticated`
- [ ] 5.2 `components/public-profile-display.tsx`: add `reviews`, `averageRating` props. Reviews section after Plan Stats, gated on `currentUserId !== null`
- [ ] 5.3 `app/plans/[id]/page.tsx`: server-side fetch `getPlanReviews(planId, true)`; pass `reviews`, `averageRating` to `PlanDetail`
- [ ] 5.4 `app/profile/[username]/page.tsx`: server-side fetch `getUserReviews(profile.id, true)` + `getAverageRating(profile.id, true)`; pass to `PublicProfileDisplay`

## Phase 6: Verification

- [ ] 6.1 Run `npm run build` — verify no TypeScript errors, no ESLint issues
- [ ] 6.2 Manual: verify all spec scenarios — completion button visibility, review submit/edit, average display, auth gating, empty states, "(editado)" indicator
