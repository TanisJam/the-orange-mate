# Public Profile Page Specification

## Purpose

Public profile page displaying user information, interests, plan stats, and friend interaction. Served at `/profile/[username]`.

## Requirements

### Requirement: Profile Friend Interaction

The public profile display component MUST include a friend interaction element below plan stats when the viewer is authenticated. Behavior depends on the relationship between viewer and profile owner:

| Relationship | Button shown |
|---|---|
| Own profile (viewer = owner) | No button (hidden) |
| No `user_friends` row exists | "Enviar solicitud" |
| `status = 'pending'` (viewer is sender) | "Solicitud enviada" (disabled, no action) |
| `status = 'pending'` (viewer is recipient) | "Responder solicitud" (links to /friends) |
| `status = 'accepted'` | "Amigos" (disabled, no action) |

The component SHALL query the `user_friends` table for the viewer–owner pair to determine status. On unauthenticated views, no button SHALL be rendered.

#### Scenario: Viewer on own profile

- GIVEN authenticated user `alice` viewing her own profile at `/profile/alice`
- WHEN the display component renders
- THEN no friend interaction button is shown

#### Scenario: Viewer with no relationship to profile owner

- GIVEN authenticated user `alice` viewing `bob`'s profile, and no `user_friends` row exists between them
- WHEN the display component renders
- THEN an "Enviar solicitud" button is shown below plan stats
- WHEN `alice` clicks the button
- THEN `sendFriendRequest(aliceId, bobId)` is called
- AND the button transitions to "Solicitud enviada" (disabled)

#### Scenario: Viewer has pending outgoing request

- GIVEN `alice` already sent a pending friend request to `bob`
- WHEN `alice` views `/profile/bob`
- THEN a disabled "Solicitud enviada" button is shown

#### Scenario: Viewer has pending incoming request

- GIVEN `bob` sent a pending friend request to `alice`
- WHEN `alice` views `/profile/bob`
- THEN a "Responder solicitud" button is shown
- AND clicking it navigates to `/friends` (Pendientes tab)

#### Scenario: Users are already friends

- GIVEN `alice` and `bob` are accepted friends
- WHEN `alice` views `/profile/bob`
- THEN a disabled "Amigos" button is shown

#### Scenario: Unauthenticated viewer

- GIVEN an unauthenticated visitor viewing `/profile/bob`
- WHEN the display component renders
- THEN no friend interaction element is shown

### Requirement: Reviews Section on Profile

The public profile page MUST display a reviews section showing all reviews received by the profile owner when viewed by an authenticated user. The section SHALL include:

| Element | Behavior |
|---|---|
| Average rating | Stars + numeric (e.g., "★★★★☆ 4.2"), computed from all received reviews |
| Review list | Each review shows: reviewer name/avatar, star rating, comment, date, "(editado)" if edited |
| Empty state | "No reviews yet" when the user has received zero reviews |

The section SHALL be visible to authenticated users only. Unauthenticated visitors MUST NOT see reviews or the average rating. The section SHALL appear immediately — reviews are available as soon as a plan is marked `'completado'`.

(No previous requirement exists for reviews on profiles.)

#### Scenario: Authenticated user views profile with reviews

- GIVEN user B has received 3 reviews with average 4.2
- WHEN authenticated user A views `/profile/B`
- THEN the reviews section renders with "★★★★☆ 4.2", all 3 reviews with reviewer names/avatars

#### Scenario: Authenticated user views profile with no reviews

- GIVEN user B has received zero reviews
- WHEN authenticated user A views `/profile/B`
- THEN an empty state "No reviews yet" is displayed

#### Scenario: Unauthenticated visitor sees no reviews

- GIVEN user B has received reviews
- WHEN an unauthenticated visitor views `/profile/B`
- THEN no reviews, ratings, or average are visible on the profile

#### Scenario: Edited review indicator

- GIVEN user B received a review that was later edited by the reviewer
- WHEN authenticated user A views `/profile/B`
- THEN that review displays "(editado)" next to its timestamp
