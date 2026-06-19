# Chat Window Specification

## Purpose

Authenticated users view and participate in a single chat at `/messages/[chatId]`. Server Component fetches initial message history (ASC). Client components handle sending messages and polling for new ones.

## Requirements

### Requirement: Chat Page Route

The system MUST serve `/messages/[chatId]` as an authenticated Server Component. It SHALL fetch message history via `getChatMessages(chatId)` ordered by `created_at ASC`. Access MUST be restricted to chat participants only. Non-participants SHALL see a 403 or be redirected.

#### Scenario: Participant opens chat

- GIVEN an authenticated user who is participant_1 or participant_2 of the chat
- WHEN they visit `/messages/[chatId]`
- THEN message history renders in chronological order (oldest first)
- AND the send input is visible and functional

#### Scenario: Non-participant access denied

- GIVEN an authenticated user who is NOT a participant of the chat
- WHEN they visit `/messages/[chatId]`
- THEN access is denied (403 or redirect)

#### Scenario: Unauthenticated access

- GIVEN an unauthenticated user
- WHEN they visit `/messages/[chatId]`
- THEN they are redirected to login

#### Scenario: Empty chat

- GIVEN a chat with no messages
- WHEN a participant opens it
- THEN an empty state message is displayed ("No messages yet. Say hello!")

### Requirement: Send Message

The system MUST allow chat participants to send messages via `sendMessage(data)`. Each message SHALL include `chat_id`, `sender_id`, and `content`. After sending, the input MUST clear and the new message SHALL appear in the history.

#### Scenario: Successful send

- GIVEN a participant with text in the message input
- WHEN they submit (Enter or click Send)
- THEN `sendMessage` is called with the content
- AND the message appears in the chat history
- AND the input is cleared

#### Scenario: Empty message prevented

- GIVEN an empty or whitespace-only input
- WHEN the user attempts to send
- THEN the message is not sent
- AND the send button is disabled

#### Scenario: Send failure

- GIVEN a participant submitting a message
- WHEN the `sendMessage` call fails (network error, RLS violation)
- THEN an error toast is displayed
- AND the message text remains in the input for retry

### Requirement: New Message Polling (Slice 1)

The system SHALL poll for new messages every 5 seconds using `getChatMessages`. Only messages with `created_at > latest_known_timestamp` SHALL be appended. Polling MUST stop on component unmount.

#### Scenario: New message arrives via polling

- GIVEN a participant viewing a chat
- WHEN the other participant sends a message
- THEN within 5 seconds the new message appears without page refresh

#### Scenario: Polling cleanup on navigation

- GIVEN a participant viewing a chat with active polling
- WHEN they navigate away
- THEN the polling interval is cleared
- AND no further requests are made

### Requirement: Message Display

Each message MUST render as a distinct bubble showing sender identity and content. The current user's messages SHALL align right; the other participant's messages SHALL align left. Timestamps SHALL be shown per message.

#### Scenario: Own message renders right-aligned

- GIVEN the current user sent a message
- WHEN the chat renders
- THEN the bubble is right-aligned with a distinct style

#### Scenario: Other's message renders left-aligned

- GIVEN the other participant sent a message
- WHEN the chat renders
- THEN the bubble is left-aligned with sender name/avatar
