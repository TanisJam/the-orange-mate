# Chat Entry Points Specification

## Purpose

Buttons on public profile and plan detail pages that allow authenticated users to initiate a chat with the profile owner or plan creator. Both entry points call `getOrCreateChat()` and redirect to the resulting chat.

## Requirements

### Requirement: Send Message from Profile

The system MUST render a "Send message" button on the public profile page (`/profile/[username]`). The button SHALL be visible only to authenticated users who are viewing another user's profile. Clicking it MUST call `getOrCreateChat(currentUserId, profileOwnerId)` and redirect to `/messages/[chatId]`.

#### Scenario: Authenticated non-owner views profile

- GIVEN an authenticated user viewing another user's public profile
- WHEN the page renders
- THEN a "Send message" button is visible
- AND clicking it creates or retrieves a chat and redirects to the chat page

#### Scenario: Profile owner views own profile

- GIVEN an authenticated user viewing their own public profile
- WHEN the page renders
- THEN the "Send message" button is hidden

#### Scenario: Unauthenticated user views profile

- GIVEN an unauthenticated user viewing a public profile
- WHEN the page renders
- THEN the "Send message" button is hidden

#### Scenario: Chat already exists

- GIVEN a chat already exists between the current user and the profile owner
- WHEN the user clicks "Send message"
- THEN `getOrCreateChat` returns the existing chat ID
- AND the user is redirected to `/messages/[chatId]` without creating duplicates

### Requirement: Message Creator from Plan Detail

The system MUST render a "Message creator" button on the plan detail page (`/plans/[id]`). The button SHALL be visible only to authenticated participants who are NOT the plan creator. Clicking it MUST call `getOrCreateChat(currentUserId, creatorId)` and redirect to `/messages/[chatId]`.

#### Scenario: Participant messages creator

- GIVEN an authenticated plan participant who is not the creator
- WHEN they view the plan detail page
- THEN a "Message creator" button is visible
- AND clicking it creates or retrieves a chat with the creator and redirects

#### Scenario: Creator views own plan

- GIVEN the plan creator viewing their own plan detail
- WHEN the page renders
- THEN the "Message creator" button is hidden

#### Scenario: Unauthenticated user

- GIVEN an unauthenticated user viewing the plan detail page
- WHEN the page renders
- THEN the "Message creator" button is hidden

### Requirement: Redirect After Chat Creation

Both entry points MUST redirect the user to `/messages/[chatId]` after `getOrCreateChat` resolves. The redirect SHALL use client-side navigation (`next/navigation` `router.push`). On failure (e.g., network error), an error toast SHALL be displayed instead.

#### Scenario: Successful redirect

- GIVEN `getOrCreateChat` returns a valid chat ID
- WHEN the entry point button is clicked
- THEN the user is navigated to `/messages/[chatId]`

#### Scenario: Chat creation fails

- GIVEN `getOrCreateChat` throws an error
- WHEN the entry point button is clicked
- THEN an error toast is displayed
- AND the user remains on the current page
