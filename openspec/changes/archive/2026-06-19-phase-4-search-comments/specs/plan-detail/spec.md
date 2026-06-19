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

(Previously: section 4 was a combined "Notas y Comentarios" — now split into separate comments and notes sections. Participants moves to position 6.)

#### Scenario: Full plan renders in order

- GIVEN a plan with all sections populated
- WHEN a participant views the detail page
- THEN sections render sequentially as listed, comments are threaded with create/delete, notes have create form with privacy toggle

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

## ADDED Requirements

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
