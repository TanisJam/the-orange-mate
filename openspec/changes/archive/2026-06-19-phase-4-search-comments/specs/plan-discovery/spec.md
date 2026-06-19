# Plan Discovery Specification

## Purpose

Public plan search at `/discover` with server-rendered paginated results. Filter panel controls URL search params. Cards render limited fields for unauthenticated users, full fields with detail link for authenticated users. Replaces the static dashboard "Descubrir" tab.

## Requirements

### Requirement: Route & Initial Load

The server page at `/discover` MUST read URL search params as `SearchFilters` + `PaginationParams`, call `searchTravelPlans()` server-side, and render a card grid with pagination. Default page size SHALL be 10.

#### Scenario: Initial load with no filters

- GIVEN a user navigates to `/discover`
- WHEN the page renders with no URL params
- THEN all public plans (page 1) are shown in a card grid with pagination and total count

#### Scenario: Load with URL filter params

- GIVEN a user navigates to `/discover?plan_type=viaje_grupal&budget_min=500`
- WHEN the page renders
- THEN filters are extracted from URL and applied to `searchTravelPlans()`
- AND filter UI reflects active values

### Requirement: Filter Panel

The client filter component MUST manage state via URL search params. Filters: `plan_type`, `destinations` (multi), `start_date`, `end_date`, `budget_min`, `budget_max`, `share_accommodation`, `share_transport`, `share_tours`. Budget inputs MUST be two separate numeric fields ("Presupuesto mínimo" / "Presupuesto máximo"), not a range slider.

#### Scenario: User applies filters

- GIVEN a user on `/discover`
- WHEN they select plan_type and enter budget range
- THEN URL updates with filter params and results re-fetch

#### Scenario: User clears a filter

- GIVEN active filters in URL
- WHEN a filter is cleared
- THEN the param is removed from URL and results re-fetch without it

### Requirement: Unauthenticated Card View

For unauthenticated users, cards SHALL show ONLY destination badges and approximate trip dates. Creator identity, budget, and plan detail link MUST NOT be shown. Each card SHALL display "Inicia sesión para ver detalles".

#### Scenario: Unauthenticated user browses discover

- GIVEN an unauthenticated user on `/discover`
- WHEN results render
- THEN each card shows destinations (badges) and date range only
- AND each card shows the login prompt
- AND no creator name, budget, or `/plans/[id]` link is present

### Requirement: Authenticated Card View

For authenticated users, cards SHALL display destinations, full date range, budget range with currency, plan type icon/label, creator name, and a clickable link to `/plans/[id]`.

#### Scenario: Authenticated user clicks a plan card

- GIVEN an authenticated user on `/discover`
- WHEN they click a plan card
- THEN they navigate to `/plans/[id]` for that plan

### Requirement: Empty State

The system MUST display an explicit empty state when zero results match active filters.

#### Scenario: No results

- GIVEN filters producing zero results
- WHEN the page renders
- THEN "No se encontraron planes con estos filtros" is shown with a suggestion to broaden filters

### Requirement: Dashboard Tab Replacement

The dashboard "Descubrir" tab SHOULD link or redirect to `/discover`.
