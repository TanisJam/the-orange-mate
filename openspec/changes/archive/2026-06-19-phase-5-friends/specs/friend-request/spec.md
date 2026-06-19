# Friend Request Specification

## Purpose

Authenticated users send, accept, and reject friend requests via the `user_friends` table. Data functions live in `lib/database.ts` (server) and `lib/database-client.ts` (client). RLS enforces row-level access.

## Requirements

### Requirement: Send Friend Request

The system MUST allow an authenticated user to send a friend request to another user. It MUST NOT allow self-requests. It MUST NOT allow duplicate requests (any status) between the same user pair. The `sendFriendRequest` function SHALL insert a `user_friends` row with `status = 'pending'` and `user_id = caller`.

#### Scenario: Successful friend request

- GIVEN an authenticated user `alice` viewing user `bob`'s profile, and no `user_friends` row exists between them
- WHEN `alice` sends a friend request to `bob`
- THEN a row is inserted with `user_id = aliceId`, `friend_id = bobId`, `status = 'pending'`
- AND the request appears in `alice`'s sent requests and `bob`'s pending requests

#### Scenario: Self-request blocked

- GIVEN an authenticated user `alice` on her own profile
- WHEN she attempts to send a friend request to herself
- THEN the request is rejected
- AND the UI SHALL NOT show the "Enviar solicitud" button on own profile

#### Scenario: Duplicate request blocked

- GIVEN `alice` already has a `user_friends` row with `bob` (any status: pending, accepted, or blocked)
- WHEN she attempts to send another friend request to `bob`
- THEN the request is rejected
- AND the UI SHALL show the existing relationship status instead of the "Enviar solicitud" button

### Requirement: Accept Friend Request

The system MUST allow the recipient to accept a pending friend request. The `acceptFriendRequest` function SHALL update the status to `accepted`. Only the recipient (row's `friend_id`) MAY accept.

#### Scenario: Recipient accepts request

- GIVEN a `pending` friend request where `user_id = aliceId` and `friend_id = bobId`
- WHEN `bob` accepts the request
- THEN the row status becomes `accepted`
- AND both users appear in each other's friends list

#### Scenario: Non-recipient cannot accept

- GIVEN a `pending` friend request where `user_id = aliceId` and `friend_id = bobId`
- WHEN `charlie` (not `bob`) attempts to accept the request
- THEN the operation fails due to RLS

### Requirement: Reject Friend Request

The system MUST allow the recipient to reject a pending friend request. The `rejectFriendRequest` function SHALL update the status to `rejected`. Only the recipient (row's `friend_id`) MAY reject.

#### Scenario: Recipient rejects request

- GIVEN a `pending` friend request where `user_id = aliceId` and `friend_id = bobId`
- WHEN `bob` rejects the request
- THEN the row status becomes `rejected`
- AND `alice` MAY re-send a request later (rejected is not a terminal block)

### Requirement: Query Friend Lists

The system MUST provide three query functions, each joining `friend` profile data via `user_profiles`:

| Function | Filter | Order |
|---|---|---|
| `getFriends(userId)` | `status = 'accepted'` AND (`user_id` or `friend_id` matches `userId`) | `created_at` descending |
| `getPendingRequests(userId)` | `status = 'pending'` AND `friend_id = userId` (incoming) | `created_at` descending |
| `getSentRequests(userId)` | `status = 'pending'` AND `user_id = userId` (outgoing) | `created_at` descending |

All three MUST exist in both `lib/database.ts` and `lib/database-client.ts`.

#### Scenario: User with friends and pending requests

- GIVEN `alice` has 2 accepted friends, 1 incoming pending, and 1 sent pending
- WHEN `getFriends(aliceId)` is called
- THEN 2 rows with `friend` profiles are returned, sorted newest first
- WHEN `getPendingRequests(aliceId)` is called
- THEN 1 row is returned (the incoming request from a third user)
- WHEN `getSentRequests(aliceId)` is called
- THEN 1 row is returned (the outgoing request)

#### Scenario: User with no friends

- GIVEN `bob` has no `user_friends` rows
- WHEN any of the three query functions is called for `bobId`
- THEN each returns an empty array
