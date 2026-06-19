# Tasks: Phase 2 — Public Profiles

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~410 |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 |
| Delivery strategy | ask-on-risk |
| Chain strategy | feature-branch-chain |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Base Branch | Notes |
|------|------|-----------|-------------|-------|
| 1 | Database functions + storage upload | PR 1 | `phase-2-public-profiles` | ~113 lines; no UI changes |
| 2 | Public profile route + display | PR 2 | PR 1 branch | ~150 lines; depends on PR 1 DB fns |
| 3 | Avatar upload + profile linking | PR 3 | PR 2 branch | ~147 lines; depends on PR 1+2 |

## Phase 1: Database Layer + Storage (PR 1)

- [x] 1.1 Add `getUserProfileByUsername(username, isServer?)` to `lib/database.ts` — `.eq('username', username).single()`, return `UserProfile|null`
- [x] 1.2 Add `getUserPlanStats(userId, isServer?)` to `lib/database.ts` — `Promise.all` of created count (`travel_plans.creator_id`) + participating count (`plan_participants.user_id`)
- [x] 1.3 Add `getUserProfileByUsername(username)` and `getUserPlanStats(userId)` client wrappers in `lib/database-client.ts` — follow existing `createClient()` pattern
- [x] 1.4 Add `uploadAvatar(userId, file)` to `lib/database-client.ts` — upload to `avatars` bucket at `{userId}/avatar.{ext}` with `upsert:true`, get public URL, call `updateUserProfile` to persist `avatar_url`, return URL or null

## Phase 2: Public Profile Page (PR 2)

- [x] 2.1 Create `app/profile/[username]/page.tsx` — Server Component: call `createClient().auth.getUser()` for optional auth, fetch profile via `getUserProfileByUsername(params.username)`, `notFound()` on null, fetch `getUserInterests(profile.id, true)` + `getUserPlanStats(profile.id, true)`, compute `isOwner`, pass all to `<PublicProfileDisplay>`
- [x] 2.2 Create `components/public-profile-display.tsx` — `'use client'`: render avatar image (if `avatar_url`), full_name, @username, bio, age, country, city, interest badges via `<Badge>`, stats "Planes creados: N · Participando: M", omit `phone`, show "Editar perfil" → `/dashboard?tab=profile` when `isOwner`

## Phase 3: Avatar Upload + Profile Linking (PR 3)

- [ ] 3.1 Create `components/avatar-upload.tsx` — `'use client'`: accept `userId`+`onUploadComplete` props, `<input type="file" accept="image/*">`, validate type (jpeg/png/webp) and size (≤2MB) client-side with Spanish error messages, FileReader preview, upload button calling `uploadAvatar()` from `database-client`
- [ ] 3.2 Integrate `<AvatarUpload>` into `components/user-profile-form.tsx` — import and render before "Información Personal" card, pass `userId`, set `onUploadComplete` to update local `avatar_url` state
- [ ] 3.3 Add "Mi Perfil" link to `components/auth-button.tsx` — import `getUserProfile` from `lib/database`, fetch profile after `auth.getUser()`, render `<Link href={/profile/${profile.username}}>` when username exists, hide when null
- [ ] 3.4 Wrap creator name in `components/plan-detail.tsx` line 168 with `<Link href={/profile/${plan.creator?.username || plan.creator_id}}>` — import `Link` from `next/link`
- [ ] 3.5 Wrap creator names in `components/dashboard-content.tsx` at lines 270 (suggested), 424 (participating), 507 (discover) with profile `<Link>` using `username || creator_id` fallback — `Link` already imported
