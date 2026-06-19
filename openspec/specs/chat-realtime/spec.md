# Chat Realtime Specification

## Purpose

Live message delivery via Supabase Realtime subscriptions (Slice 2). Unread message count displayed as a badge on the navigation link. Messages marked as read when a chat is opened.

## Requirements

### Requirement: Realtime Subscription

The system MUST subscribe to `messages` INSERT events on the active chat channel via `supabase.channel('chat-{chatId}')`. New messages SHALL appear instantly in the chat window. The subscription MUST be cleaned up on component unmount.

#### Scenario: Live message delivery

- GIVEN a participant viewing a chat with an active realtime subscription
- WHEN the other participant sends a message
- THEN the message appears in the chat window immediately (no polling delay)

#### Scenario: Subscription cleanup on navigation

- GIVEN an active realtime subscription
- WHEN the user navigates away from the chat
- THEN the channel is unsubscribed
- AND no memory leaks occur

### Requirement: Unread Count Badge

The system SHALL display an unread message count badge on the dashboard navigation link to `/messages`. The count MUST include messages where `is_read = false` and `sender_id != current_user_id`. A count of zero SHALL NOT render the badge.

#### Scenario: Unread messages exist

- GIVEN the current user has 3 unread messages across their chats
- WHEN the dashboard nav renders
- THEN a badge with "3" is displayed on the messages nav link

#### Scenario: No unread messages

- GIVEN all messages for the current user have `is_read = true`
- WHEN the dashboard nav renders
- THEN no badge is displayed

#### Scenario: Realtime updates badge

- GIVEN a user viewing any page with the dashboard nav
- WHEN a new message arrives via realtime subscription
- THEN the unread badge count increments immediately

### Requirement: Mark Messages as Read

When a user opens a chat, the system MUST mark all messages from the other participant as `is_read = true`. This SHALL happen on chat page mount.

#### Scenario: Chat opened

- GIVEN a chat with unread messages from the other participant
- WHEN the current user opens `/messages/[chatId]`
- THEN all messages where `sender_id = other_participant_id` are marked `is_read = true`

#### Scenario: Own messages not affected

- GIVEN a chat where the current user sent messages (already `is_read = true`)
- WHEN the mark-as-read logic runs
- THEN only the other participant's messages are updated
- AND the current user's messages remain unchanged
