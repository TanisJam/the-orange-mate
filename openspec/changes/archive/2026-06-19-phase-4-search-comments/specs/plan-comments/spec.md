# Plan Comments Specification

## Purpose

Threaded comments on public and private plans. Two-level nesting (comment + one reply level). Create/delete gated by `comments_enabled=true` and authorization. Private plan comments restricted to creator + participants.

## Requirements

### Requirement: Threaded Display

The system MUST fetch comments via `getPlanComments(planId)` ordered ASC. The client SHALL build a tree grouping replies by `parent_comment_id`, capped at 2 levels. Each comment SHALL show author name, content, and timestamp.

#### Scenario: Plan with nested comments loads

- GIVEN a plan with 3 top-level comments, one having 2 replies
- WHEN a participant views the plan detail comments section
- THEN top-level comments render chronologically, replies indented beneath parent
- AND each shows author avatar, name, content, and timestamp

#### Scenario: Zero comments empty state

- GIVEN a plan with no comments
- WHEN the comments section renders
- THEN "No comments yet" is displayed

### Requirement: Create Comment

The system MUST show a comment form when `comments_enabled=true` AND user is authenticated AND (plan is public OR user is participant/creator of private plan). Submit SHALL call `createPlanComment()` with `plan_id`, `content`, and optional `parent_comment_id`.

#### Scenario: Create top-level comment on public plan

- GIVEN authenticated user on public plan with `comments_enabled=true`
- WHEN they type and submit a comment
- THEN `createPlanComment` is called and the new comment appears

#### Scenario: Reply to existing comment

- GIVEN a comment on a public plan
- WHEN authenticated user submits a reply
- THEN `createPlanComment` is called with `parent_comment_id` set
- AND the reply renders indented beneath parent

#### Scenario: Form hidden when comments disabled

- GIVEN a plan with `comments_enabled=false`
- WHEN any user views the plan detail
- THEN the comment form is hidden with "Comments are disabled for this plan"

#### Scenario: Form hidden for unauthorized private plan viewer

- GIVEN private plan with `comments_enabled=true` and authenticated non-participant
- WHEN they view the plan detail
- THEN the comment form is hidden

### Requirement: Delete Comment

The system MUST allow authors to delete their own comments. Delete button SHALL render only on current user's comments. Deletion SHALL cascade to replies.

#### Scenario: Author deletes own comment

- GIVEN a comment authored by the current user
- WHEN they click delete and confirm
- THEN `deletePlanComment(commentId)` is called and the comment plus replies are removed

#### Scenario: Non-author sees no delete action

- GIVEN a comment NOT authored by the current user
- WHEN the comment renders
- THEN no delete button is shown

### Requirement: Insert RLS for Private Plans

The system MUST update the `plan_comments` INSERT RLS policy to allow comments on private plans where the user is creator or participant.

(Previously: INSERT policy only allowed comments on `is_public=true` plans.)

#### Scenario: Participant creates comment on private plan

- GIVEN private plan with `comments_enabled=true` and authenticated participant
- WHEN they submit a comment
- THEN RLS INSERT check passes via participant membership
- AND the comment is persisted
