# Plan Detail Specification

## Purpose

Server-rendered page at `/plans/[id]` displaying all plan information in a defined content order. Controls access based on plan visibility and participation status.

## Requirements

### Requirement: Content Order

The system MUST render plan detail sections in this exact order:

1. Destinations
2. Budget
3. Description
4. Comments
5. Participants

#### Scenario: Full plan renders in defined order

- GIVEN a plan with destinations, budget, description, comments, and participants
- WHEN a participant navigates to `/plans/[id]`
- THEN sections render sequentially: destinations → budget → description → comments → participants

### Requirement: Private Plan Access Control

The system MUST restrict `/plans/[id]` to participants only for private plans. Non-participants MUST see a restricted view or be redirected.

#### Scenario: Participant views private plan

- GIVEN a private plan (`is_public = false`) and an authenticated participant
- WHEN they access `/plans/[id]`
- THEN the full detail page renders with all sections

#### Scenario: Non-participant views private plan

- GIVEN a private plan and an authenticated non-participant
- WHEN they access `/plans/[id]`
- THEN they see a restricted view (plan metadata only) with a "join" option
- AND comments and participants sections are hidden

#### Scenario: Unauthenticated user views private plan

- GIVEN a private plan and an unauthenticated user
- WHEN they access `/plans/[id]`
- THEN they are redirected to login

### Requirement: Plan Comments RLS for Private Plans (Fix)

The system MUST allow participants of private plans to view comments. The `plan_comments` RLS policy MUST include a check for `plan_id` membership in `plan_participants` in addition to the existing `is_public` check.

(Previously: RLS only allowed comment reads when `plan.is_public = true`, blocking participants on private plans.)

#### Scenario: Participant reads comments on private plan

- GIVEN a private plan with comments and an authenticated participant
- WHEN the detail page loads the comments section
- THEN comments are fetched and displayed successfully
- AND no RLS violation occurs
