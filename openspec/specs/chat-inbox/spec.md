# Chat Inbox Specification

## Purpose

Authenticated users view their conversations at `/messages`. Server Component fetches chats via `getUserChats()`, passes data to client components that render participant info, last message preview, and timestamps.

## Requirements

### Requirement: Inbox Page Route

The system MUST serve `/messages` as an authenticated Server Component. It SHALL fetch the current user's chats via `getUserChats(userId)` ordered by `updated_at DESC`. Unauthenticated access MUST redirect to login.

#### Scenario: Authenticated user views inbox

- GIVEN an authenticated user with existing chats
- WHEN they visit `/messages`
- THEN all chats are listed in `updated_at DESC` order
- AND each row shows participant name, last message preview, timestamp

#### Scenario: Unauthenticated user

- GIVEN an unauthenticated user
- WHEN they visit `/messages`
- THEN they are redirected to the login page

#### Scenario: Empty inbox

- GIVEN an authenticated user with no chats
- WHEN they visit `/messages`
- THEN an empty state message is displayed ("No messages yet")

### Requirement: Chat List Item

Each chat list item MUST display: the other participant's profile info (full_name, avatar), the last message preview truncated to one line, and a relative timestamp. The item SHALL be a tappable link to `/messages/[chatId]`.

#### Scenario: Chat with messages

- GIVEN a chat with at least one message
- WHEN the inbox renders
- THEN the last message text is displayed as a one-line preview
- AND the timestamp shows relative time (e.g., "2m ago")

#### Scenario: Chat with no messages

- GIVEN a chat with zero messages (just created)
- WHEN the inbox renders
- THEN no preview text is shown
- AND the timestamp is omitted or shows creation time

### Requirement: Participant Identification

For each chat, the system MUST identify the other participant (not the current user). It SHALL use `participant_1_id` and `participant_2_id` to determine which is the other user and fetch their profile.

#### Scenario: Current user is participant_1

- GIVEN a chat where `participant_1_id` matches the current user
- WHEN the inbox renders that chat row
- THEN participant_2's name and avatar are displayed

#### Scenario: Current user is participant_2

- GIVEN a chat where `participant_2_id` matches the current user
- WHEN the inbox renders that chat row
- THEN participant_1's name and avatar are displayed
