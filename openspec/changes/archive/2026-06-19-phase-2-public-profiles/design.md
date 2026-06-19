# Design: Phase 2 — Public Profiles

## Technical Approach

Server Components handle all data fetching and auth checks, passing ready-to-render props to client components. Follows the exact pattern used in `app/plans/[id]/page.tsx` and `app/dashboard/page.tsx`. No new UI library patterns. No React context. No DB migrations.

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Owner check on profile page | Server-side `isOwner` prop | Matches plan detail page pattern (`isCreator` computed server-side). |
| AuthButton profile fetch | Extend AuthButton with `getUserProfile()` | Minimal change; already a Server Component. One extra query. |
| Profile link fallback | `/profile/{username}` with `/profile/{userId}` fallback | Prevents broken links when username not set. |
| Plan stats query | Single `getUserPlanStats(userId)` | Co-located data, internal `Promise.all`. |
| Avatar storage | `{userId}/avatar.{ext}` with `upsert:true` | Deterministic path, overwrite-friendly. |
| Client DB functions | New wrappers in `database-client.ts` | Follows existing codebase convention. |
| Phone filtering | Client-side (omit from render) | No DB transformation needed. |

## Data Flow

```
GET /profile/[username]
│
└─ page.tsx (Server Component)
     ├─ createClient().auth.getUser()          → user? (optional)
     ├─ getUserProfileByUsername(username)     → profile | notFound()
     ├─ getUserInterests(profile.id, true)     → userInterests[]
     ├─ getUserPlanStats(profile.id, true)     → { created, participating }
     │
     └─ <PublicProfileDisplay
          profile={profile}
          interests={userInterests}
          stats={{ created, participating }}
          isOwner={user?.id === profile.id}
        />
          │  (Client Component)
          ├─ Avatar (if avatar_url)
          ├─ full_name, @username
          ├─ bio, age, country, city
          ├─ <Badge> per interest
          ├─ "Planes creados: N · Participando: M"
          └─ "Editar perfil" → /dashboard?tab=profile  (if isOwner)
```

**Avatar upload flow** (inside `UserProfileForm`):

```
UserProfileForm
 └─ <AvatarUpload userId={string} onUploadComplete={fn}>
      ├─ <input type="file" accept="image/*">
      │    └─ client validation: type=jpeg|png|webp, size ≤2MB
      ├─ FileReader preview (object URL)
      └─ upload():
           ├─ supabase.storage.from('avatars').upload(`{userId}/avatar.{ext}`, file, {upsert:true})
           ├─ supabase.storage.from('avatars').getPublicUrl(path)
           ├─ updateUserProfile(userId, {avatar_url})
           └─ onUploadComplete(url)
```

**Profile linking** (existing component modifications):

```
PlanCard (dashboard)          PlanDetail (plan page)          AuthButton (navbar)
  plan.creator.username ──→     plan.creator.username ──→      user.username ──→
  /profile/{username}           /profile/{username}            /profile/{username}
                                fallback: /profile/{id}        (hidden if no username)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `app/profile/[username]/page.tsx` | **Create** | Server Component: fetches profile by username, interests, stats, auth user. Returns 404 on miss. Passes data + `isOwner` to display component. |
| `components/public-profile-display.tsx` | **Create** | `'use client'`. Renders avatar, name, bio, age, country, city, interest badges, plan stats. Hides `phone`. Shows "Editar perfil" link when `isOwner=true`. |
| `components/avatar-upload.tsx` | **Create** | `'use client'`. File input + preview + upload. Props: `userId`, `onUploadComplete`. Client-side type/size validation. Calls Supabase Storage `upload` with `upsert:true`. |
| `lib/database.ts` | **Modify** | Add `getUserProfileByUsername(username, isServer)` — `.eq('username', username).single()`. Add `getUserPlanStats(userId, isServer)` — two counts via `Promise.all`. |
| `lib/database-client.ts` | **Modify** | Add client-side `getUserProfileByUsername(username)` and `getUserPlanStats(userId)` wrappers. Add `uploadAvatar(userId, file)` — storage upload + profile update. |
| `components/auth-button.tsx` | **Modify** | Import `getUserProfile` from `lib/database`. After `auth.getUser()`, fetch profile row for `username`. Add "Mi Perfil" `<Link>` to `/profile/{username}` when authenticated and username exists. |
| `components/plan-detail.tsx` | **Modify** | Wrap creator name (line 168) in `<Link href={/profile/${plan.creator?.username || plan.creator_id}}>`. |
| `components/dashboard-content.tsx` | **Modify** | Wrap creator names in suggested plans (line 270) and participating plans (line 424) with `<Link>` to `/profile/{username || creator_id}`. |
| `components/user-profile-form.tsx` | **Modify** | Import and render `<AvatarUpload>` above personal info card. Pass `userId` and `onUploadComplete` callback that updates local state. |

## Database Function Signatures

**`lib/database.ts`** (server-safe, `isServer` flag):
- `getUserProfileByUsername(username, isServer?) → UserProfile | null` — `.eq('username', username).single()`
- `getUserPlanStats(userId, isServer?) → {created, participating}` — two counts via `Promise.all`

**`lib/database-client.ts`** (client-only):
- `getUserProfileByUsername(username) → UserProfile | null`
- `getUserPlanStats(userId) → {created, participating}`
- `uploadAvatar(userId, file) → string | null` — uploads + updates `avatar_url`, returns public URL

## Edge Cases

- Username is null: link hidden in AuthButton; plan cards fall back to `/profile/{userId}`.
- Own profile view: `isOwner=true` via server-side ID comparison. "Editar perfil" → `/dashboard?tab=profile`.
- Avatar bucket missing: `uploadAvatar` returns null; component shows error; profile form works without avatar.
- Username special chars in URL: Next.js decodes automatically; Supabase `.eq()` handles raw values.
- AuthButton on new user (no profile row): link hidden gracefully.

## Open Questions

None. All decisions resolved in architecture table above.
