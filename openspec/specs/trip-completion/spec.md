# Trip Completion Specification

## Purpose

Enables plan creators to mark a travel plan as completed. Extends the plan status enum and schema with a completion timestamp. Solo plans (creator only, no participants) are eligible.

## Requirements

### Requirement: Plan Status Migration

The `plan_status_enum` MUST be extended with value `'completado'`. The `travel_plans` table MUST gain a `completed_at TIMESTAMPTZ` column (nullable, default NULL).

#### Scenario: Status enum accepts completado

- GIVEN a plan row
- WHEN its status is set to `'completado'`
- THEN the database accepts the value without constraint violation

#### Scenario: completed_at persisted on status change

- GIVEN a plan with status `'planeado'`
- WHEN the creator marks it as completed
- THEN `status` becomes `'completado'` AND `completed_at` is set to the current timestamp

### Requirement: Mark Plan as Completed

The plan creator MUST be able to mark their plan as `'completado'`. Solo plans (creator only, zero participants) SHALL be eligible. Non-creators MUST NOT mark plans as completed. The operation SHALL set `status = 'completado'` and `completed_at = NOW()` atomically.

#### Scenario: Creator marks multi-participant plan as completed

- GIVEN a plan created by user A with status `'planeado'` and participants
- WHEN A triggers the completion action
- THEN status becomes `'completado'` AND `completed_at` is set

#### Scenario: Creator marks solo plan as completed

- GIVEN a solo plan created by user A with status `'planeado'` and no participants
- WHEN A triggers the completion action
- THEN status becomes `'completado'` AND `completed_at` is set

#### Scenario: Non-creator attempts completion

- GIVEN a plan created by A, viewed by participant B
- WHEN B attempts to mark the plan as completed
- THEN the action is rejected with an authorization error

#### Scenario: Already completed plan

- GIVEN a plan already with status `'completado'`
- WHEN the creator attempts to mark it as completed again
- THEN the action is rejected or is idempotent (no change)

### Requirement: Completed Status Badge

The plan detail UI MUST display a visual badge when the plan status is `'completado'`. The badge SHALL be visually distinct from other status badges (e.g., green checkmark).

#### Scenario: Completed plan shows badge

- GIVEN a plan with status `'completado'`
- WHEN any authenticated user views the plan detail
- THEN a "Completado" badge renders prominently

#### Scenario: Non-completed plan does not show completion badge

- GIVEN a plan with status `'planeado'`
- WHEN a user views the plan detail
- THEN no "Completado" badge is shown
