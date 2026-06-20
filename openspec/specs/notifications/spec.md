# Notifications Specification

## Purpose

Sistema de notificaciones en-app con campana, badge de no leídos, dropdown en tiempo real, y página dedicada. Cinco tipos de eventos notificables, canal realtime `notifications-{userId}`, y RLS por usuario. Retención de 360 días gestionada en spec separada (`notifications-cleanup`).

## Requirements

### Requirement: Modelo de Notificación

The system MUST persist notifications in a `notifications` table with columns: `id`, `user_id` (receptor), `actor_id` (quien generó la acción), `type`, `title`, `body`, `link`, `is_read` (default `false`), `created_at`. El `type` SHALL ser un enum: `friend_accepted | new_message | comment_reply | join_accepted | review_received`. Un índice compuesto `(user_id, is_read)` MUST existir para conteos eficientes. REPLICA IDENTITY SHALL ser `FULL`.

#### Scenario: Notificación persistida correctamente

- GIVEN un usuario autenticado
- WHEN el sistema inserta una notificación para ese usuario
- THEN la fila tiene `is_read = false`, `created_at` poblado, y `type` dentro del enum

#### Scenario: Tipo inválido rechazado

- GIVEN un intento de insertar con `type` fuera del enum
- THEN la base de datos rechaza la inserción por restricción CHECK

### Requirement: Badge de No Leídos

The system MUST mostrar un badge con el conteo de notificaciones no leídas sobre el ícono de campana en el navbar. Un conteo de cero SHALL NOT mostrar el badge. El conteo SHALL refrescarse al obtener foco la ventana.

#### Scenario: Badge visible con no leídas

- GIVEN el usuario tiene 5 notificaciones con `is_read = false`
- WHEN el navbar renderiza
- THEN la campana muestra un badge con "5"

#### Scenario: Badge oculto sin no leídas

- GIVEN todas las notificaciones del usuario tienen `is_read = true`
- WHEN el navbar renderiza
- THEN la campana no muestra badge

### Requirement: Dropdown de Últimas 5

The system MUST render un dropdown al hacer clic en la campana con las 5 notificaciones más recientes (`created_at` DESC). Cada ítem SHALL mostrar `title` y timestamp relativo. El dropdown MUST incluir un enlace "Ver todas" hacia `/notifications`.

#### Scenario: Dropdown con notificaciones

- GIVEN el usuario tiene 8 notificaciones
- WHEN hace clic en la campana
- THEN se muestran las 5 más recientes con título y "hace X minutos"
- AND al final aparece el enlace "Ver todas"

#### Scenario: Dropdown vacío

- GIVEN el usuario no tiene notificaciones
- WHEN hace clic en la campana
- THEN el dropdown muestra "No tienes notificaciones"

#### Scenario: Inserción en tiempo real con dropdown abierto

- GIVEN el dropdown está abierto mostrando 5 notificaciones
- WHEN llega una nueva notificación por el canal realtime
- THEN se inserta al inicio de la lista manteniendo máximo 5 visibles
- AND el badge se actualiza

### Requirement: Canal Realtime por Usuario

The system MUST suscribirse al canal `notifications-{userId}` filtrando eventos `INSERT`. La suscripción SHALL activarse al abrir el dropdown y liberarse al cerrarlo.

#### Scenario: Notificación aparece en tiempo real

- GIVEN el dropdown está abierto con suscripción activa
- WHEN otro usuario desencadena una notificación para este usuario
- THEN la notificación aparece en el dropdown sin recargar la página

#### Scenario: Suscripción liberada al cerrar

- GIVEN una suscripción realtime activa
- WHEN el usuario cierra el dropdown
- THEN el canal se desuscribe y no quedan listeners huérfanos

### Requirement: Marcar como Leído

The system MUST permitir marcar notificaciones individuales y todas a la vez. Marcar individual SHALL actualizar `is_read = true` para una notificación. "Marcar todas" SHALL actualizar todas las no leídas del usuario actual. Ambas operaciones MUST respetar RLS.

#### Scenario: Marcar una notificación individual

- GIVEN una notificación no leída del usuario
- WHEN el usuario la marca como leída
- THEN `is_read` cambia a `true` y el badge se decrementa

#### Scenario: Marcar todas como leídas

- GIVEN el usuario tiene 3 notificaciones no leídas
- WHEN hace clic en "Marcar todas como leídas"
- THEN las 3 pasan a `is_read = true` y el badge desaparece

### Requirement: Página de Notificaciones

The system MUST renderizar `/notifications` como lista paginada (20 por página) de todas las notificaciones del usuario, ordenadas por `created_at` DESC. Cada ítem SHALL mostrar `title`, `body`, timestamp, y toggle de leído/no leído. La paginación MUST usar cursores o página/offset.

#### Scenario: Lista paginada con múltiples páginas

- GIVEN el usuario tiene 45 notificaciones
- WHEN visita `/notifications`
- THEN la página 1 muestra 20, página 2 muestra 20, página 3 muestra 5

#### Scenario: Página sin notificaciones

- GIVEN el usuario no tiene notificaciones
- WHEN visita `/notifications`
- THEN muestra el estado vacío "No tienes notificaciones aún"

### Requirement: Eventos Disparadores

The system MUST invocar `createNotification()` en estos cinco puntos:

| Evento | Tipo | Receptor | Actor | Condición |
|--------|------|----------|-------|-----------|
| Aceptar solicitud de amistad | `friend_accepted` | Remitente original | Quien acepta | Al hacer `acceptFriendRequest()` |
| Enviar mensaje | `new_message` | Otro participante | Quien envía | Al hacer `sendMessage()` |
| Responder comentario | `comment_reply` | Autor del comentario padre | Quien responde | Al hacer `createPlanComment()` con `parent_comment_id` |
| Aceptar solicitud de unión | `join_accepted` | Solicitante | Creador del plan | Al hacer `updateJoinRequest()` con `accepted` |
| Enviar reseña | `review_received` | Usuario reseñado | Quien reseña | Al hacer `submitReview()` |

#### Scenario: Cada evento produce notificación

- GIVEN el estado adecuado para cada tipo de evento
- WHEN se ejecuta la función de datos correspondiente
- THEN se inserta una notificación con el `type`, `user_id`, y `actor_id` correctos
- AND la notificación es visible para el receptor en su canal realtime

### Requirement: Notificaciones de Acciones Propias

The system MUST crear notificaciones para las acciones del propio usuario (ej. "Aceptaste la solicitud de X"). El actor SHALL ver sus propias acciones en su historial.

#### Scenario: Usuario ve su propia acción

- GIVEN Bob acepta la solicitud de amistad de Alice
- WHEN Bob consulta sus notificaciones
- THEN ve "Aceptaste la solicitud de amistad de Alice" con `actor_id = bob_id`

### Requirement: RLS por Usuario

The system MUST aplicar Row-Level Security en `notifications`. SELECT policy SHALL restringir a `user_id = auth.uid()`. UPDATE policy SHALL restringir a `user_id = auth.uid()` y solo permitir modificar `is_read`. INSERT policy SHALL permitir a cualquier `authenticated` (inserción por sistema).

#### Scenario: Usuario solo ve sus notificaciones

- GIVEN Alice tiene notificaciones y Bob tiene otras
- WHEN Alice consulta la tabla
- THEN solo obtiene filas donde `user_id = alice_id`

#### Scenario: Usuario no modifica notificaciones ajenas

- GIVEN una notificación cuyo `user_id` es Bob
- WHEN Alice intenta marcarla como leída
- THEN RLS rechaza la operación
