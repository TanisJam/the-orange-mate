# Design: Phase 6 — Trip Reviews

## Technical Approach

Server-side data fetching for initial review loads (plan detail page and profile page), client-side mutations via `lib/database-client.ts` for interactive operations (submit, edit, complete plan). All inline — zero new routes. New components: `StarSelector`, `ReviewForm`, `ReviewCard`, `ReviewsSection`. Plan detail and profile pages get new prop layers; their parent pages (`app/plans/[id]`, `app/profile/[username]`) fetch reviews server-side.

## Architecture Decisions

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Reviews fetched server-side and passed as props | + Aligns with existing pattern (plan, interests, stats all go this way) — Rehydration cost | **Server-side fetch** — matches the project's existing "server page fetches, client component renders" convention |
| Reviews fetched client-side inside PlanDetail | + Simpler component API | Rejected — breaks the established data flow pattern (see `app/plans/[id]/page.tsx:31-33`) |
| Reviews gated via RLS `auth.uid() IS NOT NULL` | + Defense in depth at DB level | **RLS gate + component gate** — update `user_reviews` RLS select policy to require auth, AND gate in component; aligns spec requirement "visible to authenticated users only" |
| `completeTrip` as a standalone function vs extending `updateTravelPlan` | Extending is fewer functions, but blurs semantics | **Standalone `completeTrip`** — dedicated function with ownership check, sets status+completed_at atomically; `updateTravelPlan` stays for general edits |
| Edit review: inline replace vs modal | Modal is overkill for simple fields | **Inline replace** — `ReviewCard` swaps to `ReviewForm` pre-filled with existing rating+comment on edit click |

## Data Flow

```
Server (page.tsx)
  ├─ getPlanReviews(planId, isServer) ──→ Supabase (RLS: auth required)
  └─ getUserReviews(profileId, isServer) ──→ Supabase + computed avg

      ▼ props passed to client components

Client (components)
  ├─ [PlanDetail] mark complete ──→ completeTrip(planId, userId) ──→ Supabase
  ├─ [ReviewForm] submit ──→ submitReview(...) ──→ Supabase
  └─ [ReviewCard] edit ──→ editReview(reviewId, userId, ...) ──→ Supabase
```

All mutations go through `lib/database-client.ts` (browser Supabase client) — client components never import `lib/database.ts` (which depends on `next/headers`).

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `database-schema.sql` | Modify | Add `'completado'` to `plan_status_enum`; add `completed_at TIMESTAMPTZ` to `travel_plans`; add `edited_at TIMESTAMPTZ` to `user_reviews`; update RLS select policy to require auth |
| `lib/types.ts` | Modify | Add `'completado'` to `PlanStatus`; add `completed_at?: string` to `TravelPlan`; add `edited_at?: string` to `UserReview`; add `PLAN_STATUSES` entry for completado; add `CreateReviewData`, `UpdateReviewData` |
| `lib/database.ts` | Modify | Add: `completeTrip`, `submitReview`, `editReview`, `getPlanReviews`, `getUserReviews`, `getAverageRating` (server-side with `isServer` param) |
| `lib/database-client.ts` | Modify | Add same functions for browser client (no `isServer` param, uses `createClient()` directly) |
| `components/star-selector.tsx` | Create | Reusable 1-5 clickable stars. Props: `rating`, `onChange`, `readonly`. Uses lucide `Star` filled/empty. |
| `components/review-form.tsx` | Create | `StarSelector` + `<Textarea>` + submit `<Button>`. Props: `reviewedId`, `planId`, `onSubmit`, `initialRating?`, `initialComment?` (for edit pre-fill). |
| `components/review-card.tsx` | Create | Displays one review: reviewer avatar/name, stars, comment, date, "(editado)" if `edited_at`. Own review → edit button swaps to `ReviewForm`. |
| `components/reviews-section.tsx` | Create | Average stars (★★★★☆ 4.2) + list of `ReviewCard` or empty state. Props: `reviews`, `averageRating`, `currentUserId`. |
| `components/plan-detail.tsx` | Modify | Completion button (creator, status ≠ completado); Reviews section at position 7 (completed plans, auth-only). Accept new props: `reviews`, `averageRating`, `onPlanUpdated` callback for refresh. |
| `components/public-profile-display.tsx` | Modify | Reviews section below plan stats (auth-only). Accept new props: `reviews`, `averageRating`. |
| `app/plans/[id]/page.tsx` | Modify | Fetch `getPlanReviews(planId, true)` server-side; pass to `PlanDetail` |
| `app/profile/[username]/page.tsx` | Modify | Fetch `getUserReviews(profile.id, true)` + `getAverageRating(profile.id, true)` server-side; pass to `PublicProfileDisplay` |

## Interfaces / Contracts

```typescript
// lib/types.ts additions
export type PlanStatus = 'buscando_companero' | 'planeado' | 'flexible' | 'tentativo' | 'cerrado' | 'completado';

// TravelPlan gains:
completed_at?: string;

// UserReview gains:
edited_at?: string;

// New:
interface CreateReviewData {
  reviewed_id: string;
  plan_id: string;
  rating: number; // 1-5
  comment?: string;
}

interface UpdateReviewData {
  rating?: number;
  comment?: string;
}
```

```typescript
// lib/database.ts new signatures
completeTrip(planId: string, userId: string, isServer?: boolean): Promise<TravelPlan | null>;
submitReview(reviewerId: string, data: CreateReviewData, isServer?: boolean): Promise<UserReview | null>;
editReview(reviewId: string, reviewerId: string, data: UpdateReviewData, isServer?: boolean): Promise<UserReview | null>;
getPlanReviews(planId: string, isServer?: boolean): Promise<UserReview[]>;
getUserReviews(userId: string, isServer?: boolean): Promise<UserReview[]>;
getAverageRating(userId: string, isServer?: boolean): Promise<{ average: number; count: number }>;
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Manual | Completion button visibility, review CRUD, average calculation | Follow spec scenarios interactively |
| Build | TypeScript strict + ESLint catches type mismatches | `npm run build` verifies no broken contracts |
| DB | Enum migration, unique constraint on reviews | Verify via Supabase SQL editor + app usage |

No test runner configured per project config — verification is manual + build.

## Migration / Rollout

1. **Migration script**: Add `'completado'` to enum via `ALTER TYPE ... ADD VALUE`, add `completed_at` and `edited_at` columns, update RLS. Schema change is additive — no data loss risk.
2. **Rollback**: Enum values cannot be removed from Postgres enums without dropping/recreating, so rollback requires a full enum rebuild or accepting the extra value. Columns can be dropped. Document this.
3. **No feature flags**: Change is small, scoped, and doesn't alter existing behavior — existing plans keep their current statuses.

## Open Questions

- None. All behavior is specified in the four delta specs. No architectural ambiguities remain.
