# Profile Linking Specification

## Purpose

Add navigation links to public profiles from plan cards, the plan detail page, and the AuthButton dropdown. When viewers visit their own profile, they see an "Editar perfil" link to the dashboard profile tab.

## Requirements

### Requirement: Plan Card Creator Link

Every plan card rendered on the dashboard MUST wrap the creator name in a `<Link>` pointing to `/profile/{creator.username || creator.id}`. The link SHALL be styled as a standard text link.

#### Scenario: Creator has username

- GIVEN a plan with `creator.username = 'alice'`
- WHEN the plan card renders
- THEN the creator name is a clickable link to `/profile/alice`

#### Scenario: Creator has no username (fallback)

- GIVEN a plan with `creator.username = null` and `creator.id = 'abc-123'`
- WHEN the plan card renders
- THEN the creator name is a clickable link to `/profile/abc-123`

### Requirement: Plan Detail Creator Link

The creator name on the plan detail page (`/plans/[id]`) MUST be a clickable link to the creator's profile at `/profile/{creator.username || creator.id}`.

#### Scenario: Creator name links to profile

- GIVEN a plan viewed at `/plans/[id]` with creator username `alice`
- WHEN the plan detail page renders
- THEN the creator name is a clickable link to `/profile/alice`

### Requirement: AuthButton Profile Link

The AuthButton component MUST include a "Mi Perfil" dropdown item. When clicked, it SHALL navigate to `/profile/{currentUser.username}`. The current user's profile MUST be fetched server-side before rendering the link.

#### Scenario: Authenticated user sees profile link

- GIVEN an authenticated user with username `bob`
- WHEN AuthButton renders
- THEN a "Mi Perfil" item is present
- AND clicking it navigates to `/profile/bob`

#### Scenario: Authenticated user has no username

- GIVEN an authenticated user with no username set in `user_profiles`
- WHEN AuthButton renders
- THEN the "Mi Perfil" item SHALL NOT appear (no link target available)

### Requirement: Own Profile Edit Link

When the profile viewer is the profile owner (`viewer.id === profileOwner.id`), the public profile page MUST display an "Editar perfil" link pointing to the dashboard profile tab (`/dashboard?tab=profile`). Non-owner viewers MUST NOT see this link.

#### Scenario: Owner sees edit link

- GIVEN user `alice` viewing her own profile at `/profile/alice`
- WHEN the page renders
- THEN an "Editar perfil" link to `/dashboard?tab=profile` is visible

#### Scenario: Non-owner does not see edit link

- GIVEN user `bob` viewing `alice`'s profile at `/profile/alice`
- WHEN the page renders
- THEN no "Editar perfil" link is shown
