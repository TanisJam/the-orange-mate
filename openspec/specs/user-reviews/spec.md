# User Reviews Specification

## Purpose

Participants review each other on completed plans. Each review: 1-5 star rating, optional comment, one-per-plan-per-reviewer, editable by reviewer. Visible to authenticated users only. Received reviews + average show on profile.

## Requirements

### Requirement: Submit Review

A plan participant MUST be able to submit a review (rating 1-5, optional comment) for another participant on a completed plan. The `user_reviews` unique constraint on (reviewer_id, reviewed_id, plan_id) SHALL prevent duplicates. Reviewer MUST be a participant; plan MUST be `'completado'`.

#### Scenario: Participant submits first review

- GIVEN a completed plan with participants A and B
- WHEN A submits a review for B with rating 4 and comment "Great trip"
- THEN the review persists with rating=4 and comment="Great trip"

#### Scenario: Duplicate review rejected

- GIVEN A already reviewed B on this plan
- WHEN A attempts to submit another review for B on the same plan
- THEN the operation fails with a uniqueness constraint error

#### Scenario: Non-participant cannot review

- GIVEN a completed plan and user C who is not a participant
- WHEN C attempts to review a participant
- THEN the operation is rejected

#### Scenario: Review on non-completed plan rejected

- GIVEN a plan with status `'planeado'` and participant A
- WHEN A attempts to review participant B
- THEN the operation is rejected

### Requirement: Star Selector UI

Review forms MUST use a clickable star selector (1-5 stars). Average ratings MUST display as filled/empty stars plus a numeric value (e.g., "★★★★☆ 4.2").

#### Scenario: User selects star rating

- GIVEN the review form is open
- WHEN user clicks the 3rd star
- THEN stars 1-3 appear filled, stars 4-5 appear empty, and `rating` is set to 3

#### Scenario: Average rating display

- GIVEN user B has reviews with ratings [5, 4, 4]
- WHEN the reviews section renders for B
- THEN the average displays as "★★★★☆ 4.3" (rounded to one decimal)

### Requirement: Edit Review

A reviewer MUST be able to edit their own review after submission. Editing SHALL update the rating and/or comment. The original `created_at` timestamp SHALL be preserved. An `edited_at` timestamp SHALL be set on first edit. The UI MUST show an "(editado)" indicator for edited reviews.

#### Scenario: Reviewer edits their review

- GIVEN A submitted a review for B 3 days ago
- WHEN A edits the rating from 4 to 5
- THEN rating is updated, `created_at` remains unchanged, `edited_at` is set, "(editado)" indicator appears

#### Scenario: Original timestamp preserved on edit

- GIVEN A edited a review originally submitted on 2024-01-15
- WHEN the review is displayed
- THEN the original date 2024-01-15 is shown, not the edit date

#### Scenario: Non-author cannot edit

- GIVEN A submitted a review for B
- WHEN user C attempts to edit that review
- THEN the operation is rejected

### Requirement: Review Visibility and Retrieval

Reviews SHALL be visible to authenticated users only; unauthenticated visitors MUST NOT see them. Reviews SHALL be available immediately after plan completion — no waiting period. Fetching received reviews MUST include computed average rating and reviewer profiles. Queries SHALL be RLS-gated.

#### Scenario: Authenticated user views reviews

- GIVEN a completed plan with reviews and an authenticated user
- WHEN they view the plan detail or profile
- THEN reviews and average rating are displayed with reviewer profiles

#### Scenario: Unauthenticated user sees no reviews

- GIVEN a completed plan with reviews and an unauthenticated visitor
- WHEN they view the plan detail or profile
- THEN no reviews, ratings, or average are visible

#### Scenario: Fetch user reviews with average

- GIVEN user B has 3 reviews from different reviewers
- WHEN the system queries B's reviews
- THEN all 3 reviews return with reviewer profiles AND the computed average rating
