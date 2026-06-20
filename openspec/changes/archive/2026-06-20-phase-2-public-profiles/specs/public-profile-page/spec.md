# Public Profile Page Specification

## Purpose

Public read-only profile at `/profile/[username]`. No auth required. Server Component fetches profile data by username and passes it to a client display component.

## Requirements

### Requirement: Profile Lookup by Username

The system MUST provide `getUserProfileByUsername(username: string)` that queries `user_profiles` by username. It SHALL return the full `UserProfile` row or `null` if no match exists. Both server (`lib/database.ts`) and client (`lib/database-client.ts`) variants MUST be available.

#### Scenario: Existing username

- GIVEN a `user_profiles` row with `username = 'alice'`
- WHEN `getUserProfileByUsername('alice')` is called
- THEN the full profile object is returned

#### Scenario: Unknown username

- GIVEN no `user_profiles` row with `username = 'ghost'`
- WHEN `getUserProfileByUsername('ghost')` is called
- THEN `null` is returned

### Requirement: Public Profile Route

The system MUST serve `/profile/[username]` as a Server Component requiring no authentication. It MUST fetch the profile via `getUserProfileByUsername()` and pass the result to a client display component. Unknown usernames MUST return HTTP 404.

#### Scenario: Valid profile renders

- GIVEN a profile exists for username `alice`
- WHEN an unauthenticated user visits `/profile/alice`
- THEN the page renders with avatar, full_name, username, bio, age, country, city, interests as badges, and plan stats (created + participating counts)

#### Scenario: Unknown username returns 404

- GIVEN no profile exists for username `ghost`
- WHEN any user visits `/profile/ghost`
- THEN the page returns 404

### Requirement: Public Profile Display

The client component MUST render profile data in this order: avatar → full_name → username → bio → age → country → city → interests (badge list) → plan stats. The `phone` field MUST be excluded from public rendering. Plan stats SHALL show two counts: plans created and plans participating.

#### Scenario: Complete profile renders all fields

- GIVEN a profile with all fields populated, including phone
- WHEN the public display component renders
- THEN all fields except `phone` are visible
- AND interests render as badges
- AND "Plans created: N" and "Plans participating: M" are displayed

#### Scenario: Missing optional fields

- GIVEN a profile with null bio, age, country, and city
- WHEN the public display component renders
- THEN missing fields are omitted gracefully without layout breakage

### Requirement: Plan Stats Query

The system MUST provide `getUserPlanStats(userId: string)` that returns `{ created: number, participating: number }`. Created counts `travel_plans` where `creator_id = userId`. Participating counts `plan_participants` where `user_id = userId`. Both server and client variants MUST be available.

#### Scenario: User with plans

- GIVEN user `alice` created 3 plans and participates in 5
- WHEN `getUserPlanStats(aliceId)` is called
- THEN `{ created: 3, participating: 5 }` is returned

#### Scenario: User with no plans

- GIVEN user `bob` has no plans created and no participations
- WHEN `getUserPlanStats(bobId)` is called
- THEN `{ created: 0, participating: 0 }` is returned
