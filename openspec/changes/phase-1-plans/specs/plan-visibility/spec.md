# Plan Visibility Specification

## Purpose

Private-by-default model with explicit publish action. Clear visual indicator when a plan is not yet published.

## Requirements

### Requirement: Not Published Indicator

The system MUST display a visible "Not Published" badge on private plan cards (dashboard) and on the detail page. The indicator MUST be unambiguous to the plan creator.

#### Scenario: Creator sees unpublished badge

- GIVEN a plan with `is_public = false` owned by the current user
- WHEN the plan card renders on the dashboard or the detail page loads
- THEN a "Not Published" badge is visible
- AND the badge is styled to draw attention (e.g., warning/amber tone)

#### Scenario: Non-creator does not see unpublished badge

- GIVEN a private plan where the current user is NOT the creator
- WHEN the plan card or detail restricted view renders
- THEN no "Not Published" badge is displayed

### Requirement: Publish Action

The system MUST provide a publish action for the plan creator. On activation, `is_public` is set to `true`.

#### Scenario: Creator publishes a plan

- GIVEN a plan with `is_public = false` and the current user is the creator
- WHEN they activate the publish action from the detail page
- THEN `is_public` is set to `true`
- AND the "Not Published" badge disappears
- AND the plan becomes visible in public listings

#### Scenario: Non-creator cannot publish

- GIVEN a plan with `is_public = false` and the current user is NOT the creator
- WHEN they view the detail page (restricted or as participant)
- THEN no publish action is available

### Requirement: Public Plan Visibility

Plans with `is_public = true` MUST be visible to all authenticated users at their detail URL.

#### Scenario: Any authenticated user views public plan

- GIVEN a public plan and an authenticated user (any role)
- WHEN they access `/plans/[id]`
- THEN the full detail page renders
- AND comments and participants are visible
