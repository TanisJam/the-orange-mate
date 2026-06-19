# Proposal: Phase 2 — Public Profiles

## Intent

Users need to view each other's profiles to assess compatibility before joining plans. Profile data exists in `user_profiles` but has no public route — all profile interaction is limited to self-editing on the dashboard. Creator names on plan cards are plain text with no navigation to author profiles.

## Scope

### In Scope
- Public profile page at `/profile/[username]` with read-only display (avatar, full_name, username, bio, age, country, city, interests as badges, plan stats)
- Avatar upload for own profile via Supabase Storage (single file, overwrite on re-upload)
- `getUserProfileByUsername()` database lookup function
- Profile links on plan cards and plan detail (creator name → `/profile/[username]`)
- Profile link in AuthButton dropdown ("Mi Perfil" → own profile)
- Phone field hidden on public view (client-side filter)

### Out of Scope
- Photo gallery (Fase 5 — `user_photos` table unused)
- Friend system (`user_friends` table unused)
- User reviews display (`user_reviews` table unused)
- Editing profile from public page
- User search or discovery features

## Capabilities

### New Capabilities
- **`public-profile-page`**: `/profile/[username]` route, read-only display component, `getUserProfileByUsername()`, plan stats (created + participating counts)
- **`avatar-upload`**: Supabase Storage avatar upload, preview, `avatar_url` persistence in `user_profiles`
- **`profile-linking`**: Navigation links to profiles from plan cards, dashboard, and AuthButton dropdown

### Modified Capabilities

None — existing specs unchanged at requirement level.

## Approach

Follow existing Server Component → auth → client component pattern. `/profile/[username]` fetches profile by username server-side; client component renders display. Unknown usernames return 404. Own-profile views link to dashboard edit tab.

Avatar upload: Supabase Storage bucket `avatars` (public read, authenticated write). Path: `{user_id}/avatar.{ext}`. Integrated into `UserProfileForm` via new `<AvatarUpload>` sub-component. File size capped at 2 MB.

Database: `getUserProfileByUsername()` uses `.eq('username', username).single()`. Plan stats query joins `travel_plans` + `plan_participants` by `user_id`. Both added to `lib/database.ts` (server) and `lib/database-client.ts` (client).

Profile links: wrap creator name in plan cards and detail with `<Link href={/profile/${creator.username || creator.id}}>`. AuthButton gets "Mi Perfil" menu item.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/profile/[username]/page.tsx` | New | Public profile route (Server Component) |
| `components/public-profile-display.tsx` | New | Read-only profile card with interests, stats |
| `components/avatar-upload.tsx` | New | Avatar upload + preview widget |
| `lib/database.ts` | Modified | Add `getUserProfileByUsername()`, `getUserPlanStats()` |
| `lib/database-client.ts` | Modified | Client-side equivalents |
| `components/user-profile-form.tsx` | Modified | Integrate avatar upload section |
| `components/plan-detail.tsx` | Modified | Creator name → profile link |
| `components/dashboard-content.tsx` | Modified | Creator names → profile links |
| `components/auth-button.tsx` | Modified | Add "Mi Perfil" dropdown item |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Username collision on signup | Low | DB unique constraint already enforced; 404 on lookup miss |
| Avatar storage quota exhaustion | Low | Single file per user (overwrite); 2 MB limit client-side |
| Phone exposed on public view | Low | Client-side filter hides `phone`; future RLS column-level policy |

## Rollback Plan

1. Delete `app/profile/[username]/` directory
2. Revert modified components (plan-detail, dashboard-content, auth-button, user-profile-form) to prior state
3. Remove `getUserProfileByUsername()` and `getUserPlanStats()` from database files
4. No DB migration to revert (no new columns or tables)

## Dependencies

- Supabase Storage bucket `avatars` with public-read, authenticated-write policy (manual setup)

## Success Criteria

- [ ] `/profile/{existing-username}` renders public profile with avatar, name, bio, age, country, city, interests, plan stats
- [ ] `/profile/{nonexistent-username}` returns 404
- [ ] Phone field absent from public view
- [ ] Creator names on plan cards and detail link to author profiles
- [ ] AuthButton dropdown includes "Mi Perfil" linking to own profile
- [ ] Avatar upload in UserProfileForm works end-to-end (select, preview, upload, persist)
- [ ] `getUserProfileByUsername()` returns correct profile or null
