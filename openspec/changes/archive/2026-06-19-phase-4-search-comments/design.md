# Design: Phase 4 — Search & Comments

## Technical Approach

Two slices delivered within the existing App Router + Supabase SSR pattern. Slice 1: server-rendered `/discover` with client filter panel syncing via URL search params. Slice 2: comment data functions in `lib/database.ts` (+ `database-client.ts`) and `plan-detail.tsx` restructuring to separate comments (threaded) from notes (participant-only). Dashboard "Descubrir" tab becomes a link to `/discover`.

## Architecture Decisions

| Decision | Options | Choice | Rationale |
|----------|---------|--------|-----------|
| `/discover` auth | Require auth (redirect) vs. **Allow anonymous** | Allow anonymous | Spec requires unauth card view. Middleware already whitelists `/profile/*`; adding `/discover` follows pattern. |
| Search data layer | Client-only `searchTravelPlans()` vs. **Server** `searchTravelPlans(isServer=true)` | Server | SSR for initial load with URL params; client pagination/refilter via URL push re-triggers server render. Uses existing `isServer` pattern from `lib/database.ts`. |
| Comment tree | DB recursive query vs. **Flat query + client grouping** | Flat + client grouping | Simpler Supabase query (no recursive CTE needed). Tree caps at 2 levels per spec. Query by `created_at ASC`, group by `parent_comment_id` in component. |
| Comment browser wrapper | **`lib/database-client.ts`** vs. `lib/chat-client.ts` | `database-client.ts` | Comments are plan data, not chat. Follows existing notes pattern in database-client.ts. |
| Dashboard "Descubrir" | Remove tab vs. **Replace tab content with link** | Replace with link | Keeps tab navigation structure. Tab content becomes a redirect/link card to `/discover`. |
| Note privacy filter | Server-side filter vs. **Client-side filter** | Client-side filter | `getPlanNotes()` returns all notes for participants (needed for non-private). Hide private notes in UI for non-authors via `note.is_private && note.author_id !== currentUserId`. Simpler than two queries. |
| `CreatePlanCommentData` type | Dedicated type vs. inline params | Dedicated type | Follows `CreatePlanNoteData`/`CreateMessageData` pattern. Fields: `plan_id`, `content`, `parent_comment_id?`. |

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  /discover (Server Page)                                     │
│  searchParams → SearchFilters → searchTravelPlans(f, p, true)│
│  ──► passes plan[] + count to client children                │
│                                                              │
│  DiscoverFilters (Client)                                    │
│  useSearchParams() ←→ URL ←→ router.push()                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  plan-detail.tsx (Client)                                    │
│  ┌──────────────────┐  ┌──────────────────┐                  │
│  │  Comments Section │  │  Notes Section    │                 │
│  │                   │  │                   │                 │
│  │ getPlanComments() │  │ getPlanNotes()   │                 │
│  │  → flat array     │  │  → filter private│                 │
│  │ buildCommentTree()│  │ createPlanNote() │                 │
│  │ createComment()   │  │ (existing func)  │                 │
│  │ deleteComment()   │  │                   │                 │
│  └──────────────────┘  └──────────────────┘                  │
│                                                              │
│  Both call lib/database-client.ts (browser-side wrappers)    │
└─────────────────────────────────────────────────────────────┘
```

## Component Tree & Server/Client Boundaries

```
app/
├── discover/
│   ├── page.tsx                    ← Server Component (auth optional)
│   │    reads searchParams, calls searchTravelPlans(isServer=true)
│   │    renders: DiscoverFilters, DiscoverResults
│   │
│   └── [no layout needed — uses root app/layout.tsx]
│
components/
├── discover-filters.tsx            ← Client ("use client")
│   │    useSearchParams + useRouter, form with:
│   │    <Select> plan_type, <Input> destinations/date/budget,
│   │    <Checkbox> share_*, <Button> apply/clear
│   │    State → URLSearchParams → router.push()
│   │
├── discover-results.tsx            ← Server (default)
│   │    Props: { plans, count, searchParams, isAuthenticated }
│   │    Renders card grid + pagination + empty state
│   │    Anonymous card: destinations badges + date range + login prompt
│   │    Auth card: full card with <Link href={`/plans/${id}`}>
│   │
│   └─► discover-card.tsx           ← Server (can be server, no hooks)
│        Pure presentational: destinations, dates, budget, type icon,
│        creator name, link. Two variants via isAuthenticated prop.
│
├── comment-list.tsx                ← Client
│   │    Props: { planId, currentUserId, canViewFullContent,
│   │            commentsEnabled, isPlanPrivate, amIParticipant }
│   │    Fetches getPlanComments(planId), calls buildCommentTree()
│   │    Renders thread + comment form (if allowed) + delete buttons
│   │
├── comment-item.tsx                ← Client
│   │    Single comment: author avatar, name, content, timestamp,
│   │    reply form (collapsed), delete button (own only)
│   │
├── note-list.tsx                   ← Client
│   │    Props: { planId, currentUserId }
│   │    Fetches getPlanNotes(planId), filters private-non-own
│   │    Renders notes + create form with is_private toggle
│   │
└── note-item.tsx                   ← Client
     Single note: author, content, private badge, timestamp
```

## Comment Tree Algorithm

```typescript
function buildCommentTree(comments: PlanComment[]): PlanComment[] {
  const map = new Map<string, PlanComment>();
  const roots: PlanComment[] = [];

  // Index all comments
  for (const c of comments) {
    map.set(c.id, { ...c, replies: [] });
  }

  // Group by parent
  for (const c of comments) {
    const node = map.get(c.id)!;
    if (c.parent_comment_id) {
      const parent = map.get(c.parent_comment_id);
      // Only nest 1 level deep (cap at 2); ignore deeper nesting
      if (parent && !parent.parent_comment_id) {
        parent.replies!.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  return roots; // sorted by created_at ASC from flat query
}
```

- Flat query: `SELECT *, author:user_profiles(*) FROM plan_comments WHERE plan_id = $1 ORDER BY created_at ASC`
- Replies render indented via `ml-8` on reply nodes, no further nesting.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `app/discover/page.tsx` | **Create** | Server page: reads searchParams, calls `searchTravelPlans(filters, pagination, true)`, renders `DiscoverFilters` + `DiscoverResults`. Checks auth via `supabase.auth.getUser()`. |
| `components/discover-filters.tsx` | **Create** | Client filter panel: plan_type `<Select>`, destinations `<Input>`, date `<Input type="date">` ×2, budget_min/budget_max `<Input type="number">` ×2, share checkboxes. Syncs via `useSearchParams` + `router.push`. |
| `components/discover-results.tsx` | **Create** | Server component: card grid + pagination controls. Uses `PaginationParams`. Empty state with "No se encontraron planes". |
| `components/discover-card.tsx` | **Create** | Two variants: anonymous (limited fields, login prompt) and authenticated (full fields, link to `/plans/[id]`). |
| `components/comment-list.tsx` | **Create** | Client: fetch, tree-build, render loop. Form hidden when `!comments_enabled \|\| (isPrivate && !amIParticipant)`. |
| `components/comment-item.tsx` | **Create** | Client: single comment display. Reply form, delete button. |
| `components/note-list.tsx` | **Create** | Client: fetch notes, filter private-non-own, create form with `is_private` checkbox. |
| `components/note-item.tsx` | **Create** | Client: single note display with private badge. |
| `lib/database.ts` | **Modify** | Add `getPlanComments(planId, isServer)`, `createPlanComment(userId, data, isServer)`, `deletePlanComment(commentId, isServer)`. Import `PlanComment`, `CreatePlanCommentData`. |
| `lib/database-client.ts` | **Modify** | Add browser wrappers: `getPlanComments(planId)`, `createPlanComment(userId, data)`, `deletePlanComment(commentId)`. |
| `lib/types.ts` | **Modify** | Add `CreatePlanCommentData { plan_id, content, parent_comment_id? }`. |
| `components/plan-detail.tsx` | **Modify** | Split section 4 into: section 4 `<CommentList>`, section 5 `<NoteList>`, renumber participants to section 6. Remove combined "Notas y Comentarios" card (lines 315-375). Add `commentsEnabled` prop derivation. |
| `components/dashboard-content.tsx` | **Modify** | Replace "Descubrir" tab content (lines 476-566) with link card: `<Button asChild><Link href="/discover">Explorar Planes</Link></Button>`. Keep tab for nav consistency. |
| `middleware.ts` | **Modify** | Add `!request.nextUrl.pathname.startsWith("/discover")` to anonymous-allowed paths (line 54 area, alongside `/profile/`). |

## RLS Policy Changes

| Policy | Action | SQL |
|--------|--------|-----|
| `plan_comments` INSERT | **Modify** | Extend to allow participants + creator on private plans. Add: `OR (auth.uid() IN (SELECT user_id FROM plan_participants WHERE plan_id = plan_comments.plan_id)) OR (auth.uid() IN (SELECT creator_id FROM travel_plans WHERE id = plan_comments.plan_id))` |
| `plan_comments` SELECT | **Verify** | Must allow participants + creator on private plans. If current SELECT only checks `is_public`, extend with same membership check as INSERT. |
| `plan_comments` DELETE | **Verify** | Author-only. Existing policy likely covers this; verify no regression. |

## Testing Strategy

| Layer | What | How |
|-------|------|-----|
| Build | Full project | `npm run build` — must pass with no TS errors |
| Manual | `/discover` render, filter apply/clear, auth/unauth view, pagination | Browser smoke test |
| Manual | Comment create/delete, reply nesting, form visibility (disabled, private unauth) | Browser smoke test |
| Manual | Note create with privacy toggle, private note hidden from other participant | Browser smoke test |

## Open Questions

- None. All patterns exist in the codebase (server/client data function split, URL param sync via useSearchParams in chat-nav-link, shadcn/ui primitives available).
