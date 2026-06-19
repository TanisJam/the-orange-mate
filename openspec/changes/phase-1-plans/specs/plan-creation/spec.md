# Plan Creation Specification

## Purpose

Form-based plan creation at `/plans/new`. Server action persists a new travel plan and auto-enrolls the creator as first participant with `solo_ver` permission.

## Requirements

### Requirement: Plan Creation Form

The system MUST render a form at `/plans/new` with all `travel_plans` fields. On submit, the server action MUST create the plan and assign the creator as a participant.

#### Scenario: Successful plan creation

- GIVEN an authenticated user at `/plans/new`
- WHEN they fill all required fields and submit
- THEN a new `travel_plans` row is inserted with `is_public = false`
- AND the creator is inserted into `plan_participants` with `permission = 'solo_ver'`

#### Scenario: Validation errors

- GIVEN an authenticated user at `/plans/new`
- WHEN they submit with missing required fields or invalid values (e.g., `max_participants < 2`)
- THEN the form re-renders with per-field validation errors
- AND no database write occurs

#### Scenario: Unauthenticated access

- GIVEN an unauthenticated user navigating to `/plans/new`
- WHEN the page loads
- THEN the user is redirected to the login page

### Requirement: Private by Default

The system MUST set `is_public = false` on all newly created plans. Users MUST NOT be able to override this on creation.

#### Scenario: New plan is private

- GIVEN any successfully created plan
- WHEN queried from the database
- THEN `is_public` is `false`
- AND the plan does not appear in public plan listings
