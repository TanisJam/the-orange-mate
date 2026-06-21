# Demo Mode Specification

## Purpose

Unauthenticated users explore all app features under `/demo/*` with mock data, simulated mutations, and disabled realtime. No auth gating, no persistence, and no Supabase *data* reads/writes from demo pages/components (middleware may still call `supabase.auth.getUser()` to refresh session cookies).

## Requirements

### Requirement: Demo Mode Entry

The system MUST render a "Demo" link in the home page footer. `DemoProvider` context SHALL detect `/demo` prefix and expose mock data plus `useDemo()` simulation actions.

#### Scenario: Enter and navigate

- GIVEN an unauthenticated user
- WHEN they click "Demo" in footer OR navigate directly to any `/demo/*` URL
- THEN the full app shell renders with mock data and no redirect to login

### Requirement: Authentication Bypass

The system MUST NOT perform auth checks on `/demo/*`. Middleware SHALL allow unauthenticated access. Server pages SHALL NOT call `supabase.auth.getUser()`. Real routes remain protected.

#### Scenario: Demo bypasses auth

- GIVEN a user with no session
- WHEN requesting `/demo/dashboard` → THEN page renders without Supabase errors
- WHEN requesting `/dashboard` → THEN middleware redirects to login

### Requirement: Dashboard with Mock Data

The system SHALL render `/demo/dashboard` with summary stats, user plans, participating plans, and discover preview. `DashboardContent` MUST accept optional `initial*` props to skip data fetching.

#### Scenario: Dashboard mock data

- GIVEN a user at `/demo/dashboard`
- THEN stats, "My Plans" with titles/statuses/dates, and discover preview all display mock data

### Requirement: Plan Browsing

The system SHALL render `/demo/plans/[id]` with plan details, comments, notes, and participants using mock data passed to `PlanDetail`.

#### Scenario: Mock plan detail

- GIVEN a user at `/demo/plans/[mockPlanId]`
- THEN plan fields, creator, participants, and comments all display mock data

### Requirement: Plan Creation Simulation

The system SHALL render `/demo/plans/new`. Submit via `useDemo().createPlan()` SHALL add to in-memory store, toast "Demo mode: plan created", return `TravelPlan`. No database write.

#### Scenario: Create with validation

- GIVEN a user at `/demo/plans/new`
- WHEN valid submit → THEN toast appears; plan joins dashboard list
- WHEN empty `title` → THEN validation errors; no mutation

### Requirement: Discover with Filters

The system SHALL render `/demo/discover` with mock plans. Filters by `plan_type`, `destinations`, `budget_max` SHALL refine in-memory using `SearchFilters` shape.

#### Scenario: Filter results

- GIVEN user at `/demo/discover`
- WHEN type "Actividad" and budget ≤ 500 selected → THEN only matching mock plans display

### Requirement: Friends System

The system SHALL render `/demo/friends` with pending, accepted, sent requests. `useDemo()` SHALL simulate send/accept/reject with toast and in-memory state updates.

#### Scenario: Friend list and accept

- GIVEN user at `/demo/friends` → THEN accepted friends, pending requests with accept/reject buttons, sent "Pending" entries display
- WHEN they accept a pending request → THEN toast appears; friend moves to accepted

### Requirement: Messages

The system SHALL render `/demo/messages` with mock chat list and `/demo/messages/[chatId]` with mock messages. `useDemo().sendMessage()` SHALL append in-memory with demo user as sender.

#### Scenario: Chat list and send

- GIVEN user at `/demo/messages` → THEN mock chats with participant names and previews display
- WHEN they send a message → THEN it appears in-window without realtime broadcast

### Requirement: Notifications

The system SHALL render bell with badge count and dropdown of mock `NotificationEventType` notifications. Mark-read SHALL update count in-memory.

#### Scenario: Badge and mark read

- GIVEN user on any `/demo/*` → THEN bell badge shows unread mock count
- WHEN they mark one read → THEN badge decrements by 1

### Requirement: Public Profiles

The system SHALL render `/demo/profile/[username]` with mock `UserProfile` data: bio, interests, reviews, plan statistics.

#### Scenario: Profile renders

- GIVEN user at `/demo/profile/[mockUsername]`
- THEN username, bio, country, city, interests, reviews, and plan stats display

### Requirement: Reviews

The system SHALL display mock reviews on plans and profiles. `useDemo().submitReview()` SHALL toast "Demo mode: review submitted" and add to in-memory store.

#### Scenario: View and submit

- GIVEN user at `/demo/plans/[planId]` → THEN existing reviews with ratings/comments display
- WHEN they submit a new review → THEN toast; review joins list

### Requirement: Realtime Disabled

The system MUST disable Supabase realtime in demo. `NotificationBell` and `ChatNavLink` SHALL skip `.channel()` when `useDemo().isDemo`. Banner SHALL state real-time features are disabled with a sign-up CTA.

#### Scenario: Banner and static badges

- GIVEN user on any `/demo/*`
- THEN demo banner visible; bell and chat nav use static badges (no Supabase subscriptions)

### Requirement: SEO Protection

The system MUST include `<meta name="robots" content="noindex, nofollow">` on all `/demo/*` pages via the demo layout.

#### Scenario: noindex present

- GIVEN any `/demo/*` page → THEN `<meta name="robots" content="noindex, nofollow">` present in `<head>`
