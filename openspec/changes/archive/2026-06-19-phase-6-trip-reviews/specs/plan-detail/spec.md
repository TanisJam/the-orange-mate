# Delta for Plan Detail

## MODIFIED Requirements

### Requirement: Content Order

The system MUST render plan detail sections in this order:

1. Destinations
2. Budget
3. Description
4. Comments (threaded, with create/delete — per plan-comments spec)
5. Notes (participants/creator only, with create form and privacy toggle)
6. Participants
7. Reviews (visible only when plan status is `'completado'`; authenticated users only)

(Previously: Reviews section did not exist. Comments and Notes were split from a combined section in a prior change.)

#### Scenario: Full plan renders in order

- GIVEN a plan with all sections populated and status `'completado'`
- WHEN a participant views the detail page
- THEN sections render sequentially as listed, reviews appear at position 7

#### Scenario: Non-completed plan hides reviews

- GIVEN a plan with status `'planeado'`
- WHEN a participant views the detail page
- THEN sections 1-6 render, but the reviews section (position 7) is absent

## ADDED Requirements

### Requirement: Complete Plan Button

The plan detail page MUST show a "Mark as Completed" button for the plan creator when the plan status is NOT `'completado'`. The button SHALL trigger the trip-completion flow. Solo plans (no participants) SHALL be eligible. Non-creators and unauthenticated users MUST NOT see this button.

#### Scenario: Creator sees completion button on active plan

- GIVEN a plan with status `'planeado'` viewed by its creator
- WHEN the detail page renders
- THEN a "Mark as Completed" button is visible

#### Scenario: Creator does not see button on completed plan

- GIVEN a plan with status `'completado'` viewed by its creator
- WHEN the detail page renders
- THEN no completion button is shown

#### Scenario: Participant does not see completion button

- GIVEN a plan with status `'planeado'` viewed by a participant (not creator)
- WHEN the detail page renders
- THEN no completion button is shown

### Requirement: Reviews Section on Completed Plans

When a plan has status `'completado'`, the plan detail page MUST render a reviews section showing all reviews for that plan. The section SHALL display each review with reviewer name, star rating, comment, and timestamp. Edited reviews SHALL show an "(editado)" indicator. The section SHALL be visible to authenticated users only; unauthenticated visitors MUST NOT see it.

#### Scenario: Completed plan shows reviews

- GIVEN a plan with status `'completado'` and 2 reviews
- WHEN an authenticated user views the plan detail
- THEN both reviews are displayed with reviewer name, star rating, comment, and date

#### Scenario: Completed plan with no reviews

- GIVEN a plan with status `'completado'` and zero reviews
- WHEN an authenticated user views the plan detail
- THEN the reviews section shows an empty state message (e.g., "No reviews yet")

#### Scenario: Unauthenticated user sees no reviews

- GIVEN a completed plan with reviews
- WHEN an unauthenticated visitor views the plan detail
- THEN the reviews section is not rendered
