# Friend List Specification

## Purpose

Authenticated users view and manage friends at `/friends`. Card-based layout with three tabs. Minimal toast notification on accepting a request.

## Requirements

### Requirement: Friends Page Route

The system MUST serve `/friends` requiring authentication. Unauthenticated access SHALL redirect to login. The page MUST be a client component fetching friend data via `lib/database-client.ts`.

#### Scenario: Authenticated user visits /friends

- GIVEN an authenticated user `alice`
- WHEN she navigates to `/friends`
- THEN the page renders with three tabs: Amigos, Pendientes, Enviadas
- AND the "Amigos" tab is selected by default

#### Scenario: Unauthenticated user redirected

- GIVEN an unauthenticated visitor
- WHEN they attempt to access `/friends`
- THEN they are redirected to the login page

### Requirement: Friend Tabs with Cards

The page MUST display three mutually exclusive tabs:

| Tab | Data source | Sorting |
|-----|-------------|---------|
| **Amigos** | `getFriends(userId)` — accepted friends | Most recent first |
| **Pendientes** | `getPendingRequests(userId)` — incoming pending | Most recent first |
| **Enviadas** | `getSentRequests(userId)` — outgoing pending | Most recent first |

Each tab SHALL render a card list. Each friend/request card MUST show the other user's `avatar_url`, `full_name` (or `username` as fallback), and `created_at` date. Incoming pending cards (Pendientes) MUST include "Aceptar" and "Rechazar" action buttons. Outgoing pending cards (Enviadas) SHALL show a "Pendiente" status label with no action buttons.

#### Scenario: Friends tab with accepted friends

- GIVEN `alice` has 3 accepted friends
- WHEN she views the Amigos tab
- THEN 3 cards are rendered, each showing the friend's avatar, name, and friendship date
- AND cards are sorted by newest friendship first

#### Scenario: Pendientes tab with action buttons

- GIVEN `alice` has 2 incoming pending requests
- WHEN she views the Pendientes tab
- THEN each card shows "Aceptar" and "Rechazar" buttons
- WHEN she taps "Aceptar" on one
- THEN the request moves to the Amigos tab and a toast appears

#### Scenario: Enviadas tab shows pending label

- GIVEN `alice` has 1 outgoing pending request
- WHEN she views the Enviadas tab
- THEN the card shows a "Pendiente" status badge with no actionable buttons

### Requirement: Empty State

Each tab MUST display an empty state when the list is empty. The Amigos empty state SHALL read: **"No tenés amigos todavía. Encontrá viajeros en Discover"** with a link to `/discover`. The Pendientes and Enviadas empty states SHALL read: **"No hay solicitudes pendientes"** and **"No has enviado solicitudes"** respectively.

#### Scenario: Empty Amigos tab

- GIVEN `alice` has no accepted friends
- WHEN she visits /friends
- THEN the Amigos tab shows the empty state message with a clickable link to `/discover`

#### Scenario: Empty Pendientes tab

- GIVEN `alice` has no incoming pending requests
- WHEN she switches to the Pendientes tab
- THEN "No hay solicitudes pendientes" is displayed

### Requirement: Accept Toast Notification

When a user accepts a friend request on the Pendientes tab, the system MUST display a minimal toast notification confirming the action. The toast SHALL appear in the bottom-right corner and auto-dismiss after 3 seconds. The toast is shown to the accepter only — no notification is sent to the other party.

#### Scenario: Toast on accept

- GIVEN `alice` accepts a pending request from `bob` on the Pendientes tab
- WHEN the accept completes successfully
- THEN a toast appears: "Solicitud de amistad aceptada"
- AND the toast auto-dismisses after 3 seconds
- AND `bob` does NOT receive a notification

#### Scenario: Toast on reject

- GIVEN `alice` rejects a pending request on the Pendientes tab
- WHEN the reject completes successfully
- THEN the card is removed from the list
- AND no toast is shown (rejection is silent)
