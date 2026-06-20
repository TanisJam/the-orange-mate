# Delta for Public Profile Page

## ADDED Requirements

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
