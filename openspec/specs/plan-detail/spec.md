# Plan Detail Specification

## Purpose

Server-rendered page at `/plans/[id]` displaying all plan information in a defined content order. Controls access based on plan visibility and participation status. Includes threaded comments (create/delete) and notes with privacy toggle for participants.

## Requirements

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

### Requirement: Private Plan Access Control

The system MUST restrict `/plans/[id]` to participants for private plans. Non-participants MUST see a restricted metadata-only view.

#### Scenario: Participant views private plan

- GIVEN a private plan and an authenticated participant
- WHEN they access `/plans/[id]`
- THEN the full detail page renders with all sections

#### Scenario: Non-participant views private plan

- GIVEN a private plan and an authenticated non-participant
- WHEN they access `/plans/[id]`
- THEN they see a restricted view (plan metadata only) with a join option
- AND comments, notes, and participants sections are hidden

(Previously: only comments and participants were listed as hidden — notes section now added.)

#### Scenario: Unauthenticated user views private plan

- GIVEN a private plan and an unauthenticated user
- WHEN they access `/plans/[id]`
- THEN they are redirected to login

### Requirement: Plan Comments RLS for Private Plans

The system MUST allow participants and creator of private plans to view AND create comments. Both SELECT and INSERT RLS policies SHALL include a membership check on `plan_participants` OR `creator_id`.

(Previously: SELECT fix was specified. INSERT policy must also allow private plan participants to create comments.)

#### Scenario: Participant reads comments on private plan

- GIVEN a private plan with comments and an authenticated participant
- WHEN the comments section loads
- THEN comments are fetched and displayed without RLS violation

#### Scenario: Participant creates comment on private plan

- GIVEN a private plan with `comments_enabled=true` and an authenticated participant
- WHEN they submit a comment
- THEN the INSERT RLS policy passes participant check and the comment is persisted

### Requirement: Notes Privacy Toggle

The note creation form MUST include an `is_private` toggle. Private notes SHALL be visible only to author. Non-private notes SHALL be visible to all participants and creator.

#### Scenario: Private note creation

- GIVEN a participant creating a note with `is_private=true`
- WHEN they submit
- THEN only the author sees it

#### Scenario: Shared note creation

- GIVEN a participant creating a note with `is_private=false` (default)
- WHEN they submit
- THEN all participants plus creator see it

#### Scenario: Private note hidden from others

- GIVEN a notes list with a private note by user B
- WHEN user A (participant, not author) views notes
- THEN user A does NOT see it; user B sees it with "Privada" badge

### Requirement: Notes Section

The plan detail MUST render a dedicated notes section after comments, visible only to participants and creator. It SHALL list visible notes and show a create form with text input and privacy toggle.

#### Scenario: Participant views and creates notes

- GIVEN a participant on plan detail
- WHEN they view the notes section
- THEN existing notes render, create form is available
- AND submitting calls `createPlanNote()` and refreshes the list

#### Scenario: Empty notes state

- GIVEN a plan with no notes viewed by a participant
- WHEN the section renders
- THEN "No hay notas. ¡Agrega una!" is shown with create form available

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
