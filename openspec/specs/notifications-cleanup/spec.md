# Notifications Cleanup Specification

## Purpose

Eliminación automática de notificaciones con más de 360 días de antigüedad mediante tarea programada. Mantiene la tabla sin crecimiento indefinido y cumple la política de retención definida.

## Requirements

### Requirement: Limpieza Automática por Antigüedad

The system MUST eliminar notificaciones donde `created_at < NOW() - INTERVAL '360 days'`. La función de limpieza `cleanup_old_notifications()` SHALL ejecutarse periódicamente. El mecanismo preferido es pg_cron; si no está disponible, una edge function programada SHALL servir como fallback.

#### Scenario: Notificaciones expiradas eliminadas por pg_cron

- GIVEN notificaciones con más de 360 días de antigüedad
- WHEN pg_cron ejecuta `cleanup_old_notifications()`
- THEN todas las filas expiradas son eliminadas
- AND las notificaciones dentro del período de retención permanecen intactas

#### Scenario: pg_cron no disponible — fallback edge function

- GIVEN la extensión pg_cron no está habilitada en la instancia Supabase
- WHEN la edge function programada se ejecuta (diaria/semanalmente)
- THEN se invoca `cleanup_old_notifications()` con el mismo comportamiento de eliminación
- AND se documenta el procedimiento SQL manual como último recurso

#### Scenario: Sin notificaciones expiradas

- GIVEN todas las notificaciones tienen menos de 360 días
- WHEN la función de limpieza se ejecuta
- THEN ninguna fila es eliminada

### Requirement: Programación de la Tarea

The system SHOULD ejecutar la limpieza al menos una vez por semana. La frecuencia recomendada SHALL ser diaria para pg_cron y semanal para edge function. La tarea MUST NOT bloquear operaciones normales de lectura/escritura en la tabla.

#### Scenario: Limpieza diaria con pg_cron

- GIVEN pg_cron configurado con schedule `0 3 * * *` (3 AM diario)
- WHEN la hora programada llega
- THEN `cleanup_old_notifications()` se ejecuta sin intervención manual

#### Scenario: Limpieza no bloquea operaciones

- GIVEN la función de limpieza en ejecución
- WHEN un usuario abre el dropdown o la página de notificaciones
- THEN las consultas y escrituras normales continúan sin degradación perceptible
