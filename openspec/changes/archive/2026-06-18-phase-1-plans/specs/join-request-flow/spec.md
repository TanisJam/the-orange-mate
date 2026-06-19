# Join Request Flow Specification

## Purpose

Authenticated users request to join a plan. Creator reviews pending requests, accepts (with permission selection) or rejects. When `max_participants` is reached, requests enter a waiting list.

## Requirements

### Requirement: Join Request

The system MUST allow authenticated users to submit a join request for any plan they are not already participating in or waiting on.

#### Scenario: Successful join request

- GIVEN an authenticated user viewing a plan detail page they are not a participant in
- WHEN they submit a join request
- THEN a `join_requests` row is inserted with `status = 'pending'`
- AND the creator sees the request in their pending queue

#### Scenario: Duplicate join request

- GIVEN an authenticated user who already has a `pending` join request for the same plan
- WHEN they attempt to submit another join request
- THEN the request is rejected with a "request already pending" message
- AND no duplicate row is inserted

#### Scenario: Already a participant

- GIVEN an authenticated user who is already a `plan_participants` entry for the plan
- WHEN they attempt to submit a join request
- THEN the request is rejected
- AND the UI does not show the join button

### Requirement: Creator Reviews Pending Requests

The system MUST display pending join requests to the plan creator on the detail page. Each request SHALL show the requester's identity.

#### Scenario: Creator sees pending requests

- GIVEN a plan with pending join requests and the current user is the creator
- WHEN they view the detail page
- THEN pending requests are listed in the participants section
- AND each shows the requester name and accept/reject actions

#### Scenario: No pending requests

- GIVEN a plan with no pending join requests
- WHEN the creator views the detail page
- THEN the pending queue shows an empty state message ("No pending requests")

### Requirement: Accept with Permission

The system MUST allow the creator to accept a join request with a permission level selection. The default permission MUST be `solo_ver`. The permission parameter in `updateJoinRequest` MUST NOT be hardcoded.

#### Scenario: Creator accepts with permission

- GIVEN a pending join request and the creator viewing the request
- WHEN they select a permission level and confirm acceptance
- THEN the request status becomes `accepted`
- AND a `plan_participants` row is inserted with the selected permission
- AND the user gains access to the plan detail page as a participant

#### Scenario: Default permission is solo_ver

- GIVEN a pending join request and the creator accepting it
- WHEN they do not change the permission selection
- THEN the participant is created with `permission = 'solo_ver'`

(Previously: `updateJoinRequest` hardcoded `permission = 'solo_ver'` — now parametrized.)

### Requirement: Reject Request

The system MUST allow the creator to reject a join request.

#### Scenario: Creator rejects a request

- GIVEN a pending join request and the creator viewing it
- WHEN they select reject and confirm
- THEN the request status becomes `rejected`
- AND no `plan_participants` row is inserted
- AND the requester MAY re-apply later (rejected status does not block re-application)

### Requirement: Waiting List at Capacity

When `plan_participants` count reaches `max_participants`, new join requests MUST enter a waiting list rather than being blocked.

#### Scenario: Plan at full capacity

- GIVEN a plan where `COUNT(plan_participants) >= max_participants`
- WHEN a new authenticated user submits a join request
- THEN the request is accepted with a `waiting_list` designation (not blocked)
- AND the creator is notified that the plan is at capacity
- AND the requester is informed they are on the waiting list

#### Scenario: Under capacity

- GIVEN a plan where `COUNT(plan_participants) < max_participants`
- WHEN a new authenticated user submits a join request
- THEN the request proceeds normally (not waiting-listed)
