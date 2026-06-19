# Delta for Public Profile Page

## ADDED Requirements

### Requirement: Profile Friend Interaction

The public profile display component MUST include a friend interaction element below plan stats when the viewer is authenticated. Behavior depends on the relationship between viewer and profile owner:

| Relationship | Button shown |
|---|---|
| Own profile (viewer = owner) | No button (hidden) |
| No `user_friends` row exists | "Enviar solicitud" |
| `status = 'pending'` (viewer is sender) | "Solicitud enviada" (disabled, no action) |
| `status = 'pending'` (viewer is recipient) | "Responder solicitud" (links to /friends) |
| `status = 'accepted'` | "Amigos" (disabled, no action) |

The component SHALL query the `user_friends` table for the viewer–owner pair to determine status. On unauthenticated views, no button SHALL be rendered.

#### Scenario: Viewer on own profile

- GIVEN authenticated user `alice` viewing her own profile at `/profile/alice`
- WHEN the display component renders
- THEN no friend interaction button is shown

#### Scenario: Viewer with no relationship to profile owner

- GIVEN authenticated user `alice` viewing `bob`'s profile, and no `user_friends` row exists between them
- WHEN the display component renders
- THEN an "Enviar solicitud" button is shown below plan stats
- WHEN `alice` clicks the button
- THEN `sendFriendRequest(aliceId, bobId)` is called
- AND the button transitions to "Solicitud enviada" (disabled)

#### Scenario: Viewer has pending outgoing request

- GIVEN `alice` already sent a pending friend request to `bob`
- WHEN `alice` views `/profile/bob`
- THEN a disabled "Solicitud enviada" button is shown

#### Scenario: Viewer has pending incoming request

- GIVEN `bob` sent a pending friend request to `alice`
- WHEN `alice` views `/profile/bob`
- THEN a "Responder solicitud" button is shown
- AND clicking it navigates to `/friends` (Pendientes tab)

#### Scenario: Users are already friends

- GIVEN `alice` and `bob` are accepted friends
- WHEN `alice` views `/profile/bob`
- THEN a disabled "Amigos" button is shown

#### Scenario: Unauthenticated viewer

- GIVEN an unauthenticated visitor viewing `/profile/bob`
- WHEN the display component renders
- THEN no friend interaction element is shown
