import type {
  UserProfile,
  Interest,
  UserInterest,
  TravelPlan,
  PlanParticipant,
  PlanNote,
  PlanComment,
  PlanJoinRequest,
  EnrichedFriend,
  Chat,
  Message,
  UserReview,
  Notification,
} from "./types";

// ── Timestamps ──────────────────────────────────────────────────────────────
const NOW = "2026-06-20T12:00:00Z";
const DAY = 86_400_000;

function ts(daysAgo: number, hours?: number): string {
  const h = (hours ?? 0) * 3_600_000;
  return new Date(new Date(NOW).getTime() - daysAgo * DAY + h).toISOString();
}

// ── Users (5) ───────────────────────────────────────────────────────────────
export const demoUsers: UserProfile[] = [
  {
    id: "demo-user-1",
    username: "mariagarcia",
    full_name: "María García",
    avatar_url: "https://api.dicebear.com/9.x/avataaars/svg?seed=Maria",
    bio: "Viajera apasionada, amante de la naturaleza y la fotografía. Siempre buscando la próxima aventura.",
    age: 29,
    country: "Argentina",
    city: "Buenos Aires",
    created_at: ts(90),
    updated_at: ts(2),
  },
  {
    id: "demo-user-2",
    username: "carlosrodriguez",
    full_name: "Carlos Rodríguez",
    avatar_url: "https://api.dicebear.com/9.x/avataaars/svg?seed=Carlos",
    bio: "Mochilero y chef aficionado. Me encanta descubrir sabores nuevos en cada destino.",
    age: 34,
    country: "Colombia",
    city: "Medellín",
    created_at: ts(120),
    updated_at: ts(5),
  },
  {
    id: "demo-user-3",
    username: "luciafernandez",
    full_name: "Lucía Fernández",
    avatar_url: "https://api.dicebear.com/9.x/avataaars/svg?seed=Lucia",
    bio: "Fotógrafa profesional. Recorro el mundo capturando momentos únicos y paisajes increíbles.",
    age: 26,
    country: "Chile",
    city: "Santiago",
    created_at: ts(80),
    updated_at: ts(1),
  },
  {
    id: "demo-user-4",
    username: "pedromartinez",
    full_name: "Pedro Martínez",
    avatar_url: "https://api.dicebear.com/9.x/avataaars/svg?seed=Pedro",
    bio: "Surfista y amante de los deportes al aire libre. Si tiene olas, ahí estoy.",
    age: 31,
    country: "México",
    city: "Puerto Escondido",
    created_at: ts(150),
    updated_at: ts(10),
  },
  {
    id: "demo-user-5",
    username: "anatorres",
    full_name: "Ana Torres",
    avatar_url: "https://api.dicebear.com/9.x/avataaars/svg?seed=Ana",
    bio: "Escritora de viajes y amante de los pueblos pequeños. Colecciono historias locales.",
    age: 27,
    country: "España",
    city: "Barcelona",
    created_at: ts(60),
    updated_at: ts(3),
  },
];

export const demoUser = demoUsers[0]; // María García — the user experiencing the demo

// Helper: quick user lookup by id
const U = Object.fromEntries(demoUsers.map((u) => [u.id, u]));

// ── Interests (5 predefined) ────────────────────────────────────────────────
export const demoInterests: Interest[] = [
  { id: "int-1", name: "Senderismo", icon: "🥾", is_predefined: true, created_at: ts(365) },
  { id: "int-2", name: "Fotografía", icon: "📷", is_predefined: true, created_at: ts(365) },
  { id: "int-3", name: "Gastronomía", icon: "🍴", is_predefined: true, created_at: ts(365) },
  { id: "int-4", name: "Música", icon: "🎵", is_predefined: true, created_at: ts(365) },
  { id: "int-5", name: "Surf", icon: "🏄", is_predefined: true, created_at: ts(365) },
];

// ── User Interests ──────────────────────────────────────────────────────────
export const demoUserInterests: UserInterest[] = [
  { id: "ui-1", user_id: "demo-user-1", interest_id: "int-1", is_custom: false, created_at: ts(80), interest: demoInterests[0] },
  { id: "ui-2", user_id: "demo-user-1", interest_id: "int-2", is_custom: false, created_at: ts(80), interest: demoInterests[1] },
  { id: "ui-3", user_id: "demo-user-2", interest_id: "int-3", is_custom: false, created_at: ts(100), interest: demoInterests[2] },
  { id: "ui-4", user_id: "demo-user-3", interest_id: "int-2", is_custom: false, created_at: ts(70), interest: demoInterests[1] },
  { id: "ui-5", user_id: "demo-user-3", interest_id: "int-4", is_custom: false, created_at: ts(70), interest: demoInterests[3] },
  { id: "ui-6", user_id: "demo-user-4", interest_id: "int-5", is_custom: false, created_at: ts(130), interest: demoInterests[4] },
  { id: "ui-7", user_id: "demo-user-5", interest_id: "int-1", is_custom: false, created_at: ts(50), interest: demoInterests[0] },
];

// ── Travel Plans (4) ───────────────────────────────────────────────────────
// Participants array for each plan — defined separately for readability
const p1Participants: PlanParticipant[] = [
  { id: "part-1-1", plan_id: "plan-1", user_id: "demo-user-1", permission_level: "editar", joined_at: ts(45), user: U["demo-user-1"] },
  { id: "part-1-2", plan_id: "plan-1", user_id: "demo-user-3", permission_level: "solo_ver", joined_at: ts(30), user: U["demo-user-3"] },
  { id: "part-1-3", plan_id: "plan-1", user_id: "demo-user-5", permission_level: "agregar_notas_privadas", joined_at: ts(20), user: U["demo-user-5"] },
];

const p2Participants: PlanParticipant[] = [
  { id: "part-2-1", plan_id: "plan-2", user_id: "demo-user-2", permission_level: "editar", joined_at: ts(60), user: U["demo-user-2"] },
  { id: "part-2-2", plan_id: "plan-2", user_id: "demo-user-1", permission_level: "sugerir_cambios", joined_at: ts(40), user: U["demo-user-1"] },
];

const p3Participants: PlanParticipant[] = [
  { id: "part-3-1", plan_id: "plan-3", user_id: "demo-user-3", permission_level: "editar", joined_at: ts(50), user: U["demo-user-3"] },
  { id: "part-3-2", plan_id: "plan-3", user_id: "demo-user-4", permission_level: "solo_ver", joined_at: ts(35), user: U["demo-user-4"] },
];

const p4Participants: PlanParticipant[] = [
  { id: "part-4-1", plan_id: "plan-4", user_id: "demo-user-4", permission_level: "editar", joined_at: ts(25), user: U["demo-user-4"] },
  { id: "part-4-2", plan_id: "plan-4", user_id: "demo-user-1", permission_level: "sugerir_cambios", joined_at: ts(15), user: U["demo-user-1"] },
];

export const demoPlans: TravelPlan[] = [
  {
    id: "plan-1",
    creator_id: "demo-user-1",
    title: "Viaje a la Patagonia Argentina",
    plan_type: "viaje_completo",
    destinations: ["El Calafate", "El Chaltén", "Ushuaia"],
    start_date: "2026-11-15",
    end_date: "2026-11-30",
    flexible_dates: false,
    status: "buscando_companero",
    description: "Expedición de 15 días por la Patagonia. Trekking en el Fitz Roy, glaciar Perito Moreno y navegación por el Canal Beagle. Busco compañeros para compartir gastos de alojamiento y transporte.",
    max_participants: 4,
    current_participants: 3,
    share_accommodation: true,
    share_transport: true,
    share_tours: false,
    budget_range_min: 1500,
    budget_range_max: 2500,
    currency: "USD",
    is_public: true,
    comments_enabled: true,
    created_at: ts(45),
    updated_at: ts(5),
    creator: U["demo-user-1"],
    participants: p1Participants,
  },
  {
    id: "plan-2",
    creator_id: "demo-user-2",
    title: "Tour de Cafetería en el Eje Cafetero",
    plan_type: "actividad",
    destinations: ["Salento", "Filandia", "Armenia"],
    start_date: "2026-09-05",
    end_date: "2026-09-12",
    flexible_dates: true,
    status: "planeado",
    description: "Recorrido por fincas cafeteras, catas y clases de barismo. Incluye visitas al Valle del Cocora y termales de Santa Rosa.",
    max_participants: 6,
    current_participants: 2,
    share_accommodation: true,
    share_transport: true,
    share_tours: true,
    budget_range_min: 400,
    budget_range_max: 800,
    currency: "USD",
    is_public: true,
    comments_enabled: true,
    created_at: ts(60),
    updated_at: ts(10),
    creator: U["demo-user-2"],
    participants: p2Participants,
  },
  {
    id: "plan-3",
    creator_id: "demo-user-3",
    title: "Aventura en Machu Picchu",
    plan_type: "viaje_completo",
    destinations: ["Cusco", "Aguas Calientes", "Machu Picchu", "Valle Sagrado"],
    start_date: "2026-10-01",
    end_date: "2026-10-10",
    flexible_dates: false,
    status: "buscando_companero",
    description: "Camino Inca de 4 días + exploración de Cusco y el Valle Sagrado. Ideal para viajeros con buena condición física.",
    max_participants: 4,
    current_participants: 2,
    share_accommodation: true,
    share_transport: false,
    share_tours: true,
    budget_range_min: 1200,
    budget_range_max: 1800,
    currency: "USD",
    is_public: true,
    comments_enabled: true,
    created_at: ts(50),
    updated_at: ts(8),
    creator: U["demo-user-3"],
    participants: p3Participants,
  },
  {
    id: "plan-4",
    creator_id: "demo-user-4",
    title: "Fin de Semana en Mendoza — Vino y Montaña",
    plan_type: "salida_local",
    destinations: ["Mendoza", "Luján de Cuyo", "Valle de Uco"],
    start_date: "2026-08-22",
    end_date: "2026-08-24",
    flexible_dates: false,
    status: "buscando_companero",
    description: "Escapada de fin de semana largo. Bodegas, catas, almuerzos gourmet y trekking ligero en la precordillera.",
    max_participants: 4,
    current_participants: 2,
    share_accommodation: true,
    share_transport: true,
    share_tours: false,
    budget_range_min: 300,
    budget_range_max: 600,
    currency: "USD",
    is_public: true,
    comments_enabled: true,
    created_at: ts(25),
    updated_at: ts(3),
    creator: U["demo-user-4"],
    participants: p4Participants,
  },
];

// ── Plan Notes ──────────────────────────────────────────────────────────────
export const demoPlanNotes: PlanNote[] = [
  {
    id: "note-1",
    plan_id: "plan-1",
    author_id: "demo-user-1",
    content: "Reservar los vuelos con al menos 2 meses de anticipación para conseguir mejores precios.",
    is_private: false,
    created_at: ts(40),
    updated_at: ts(40),
    author: U["demo-user-1"],
  },
  {
    id: "note-2",
    plan_id: "plan-1",
    author_id: "demo-user-3",
    content: "Yo puedo conseguir descuento en el hostel de El Chaltén, tengo un contacto.",
    is_private: false,
    created_at: ts(25),
    updated_at: ts(25),
    author: U["demo-user-3"],
  },
];

// ── Plan Comments ───────────────────────────────────────────────────────────
export const demoPlanComments: PlanComment[] = [
  {
    id: "comment-1",
    plan_id: "plan-1",
    author_id: "demo-user-3",
    content: "¡Qué buen plan! Yo hice el Fitz Roy el año pasado, es increíble. ¿Tienen pensado hacer la caminata completa o solo la base?",
    created_at: ts(20),
    updated_at: ts(20),
    author: U["demo-user-3"],
  },
  {
    id: "comment-2",
    plan_id: "plan-1",
    author_id: "demo-user-1",
    content: "Haremos la caminata completa hasta la Laguna de los Tres. Son 10 horas pero la vista lo vale.",
    created_at: ts(19),
    updated_at: ts(19),
    author: U["demo-user-1"],
  },
  {
    id: "comment-3",
    plan_id: "plan-2",
    author_id: "demo-user-1",
    content: "Me encanta el café colombiano, ¿cuántas fincas visitamos?",
    created_at: ts(35),
    updated_at: ts(35),
    author: U["demo-user-1"],
  },
  {
    id: "comment-4",
    plan_id: "plan-2",
    author_id: "demo-user-2",
    content: "Visitamos 4 fincas diferentes, cada una con un proceso distinto. También hay una clase práctica de barismo incluida.",
    created_at: ts(34),
    updated_at: ts(34),
    author: U["demo-user-2"],
  },
];

// ── Plan Join Requests ──────────────────────────────────────────────────────
export const demoJoinRequests: PlanJoinRequest[] = [
  {
    id: "join-1",
    plan_id: "plan-1",
    requester_id: "demo-user-4",
    message: "Hola! Soy surfista pero también me encanta el trekking. Tengo experiencia en alta montaña.",
    status: "pending",
    created_at: ts(10),
    requester: U["demo-user-4"],
  },
  {
    id: "join-2",
    plan_id: "plan-3",
    requester_id: "demo-user-1",
    message: "Me encantaría unirme. Ya hice el Camino Inca en 2024, puedo aportar tips de preparación.",
    status: "accepted",
    created_at: ts(15),
    responded_at: ts(12),
    requester: U["demo-user-1"],
  },
];

// ── Chats (3) ───────────────────────────────────────────────────────────────
export const demoChats: Chat[] = [
  {
    id: "chat-1",
    participant_1_id: "demo-user-1",
    participant_2_id: "demo-user-2",
    created_at: ts(60),
    updated_at: ts(2),
    participant_1: U["demo-user-1"],
    participant_2: U["demo-user-2"],
  },
  {
    id: "chat-2",
    participant_1_id: "demo-user-1",
    participant_2_id: "demo-user-3",
    created_at: ts(40),
    updated_at: ts(4),
    participant_1: U["demo-user-1"],
    participant_2: U["demo-user-3"],
  },
  {
    id: "chat-3",
    participant_1_id: "demo-user-2",
    participant_2_id: "demo-user-4",
    created_at: ts(30),
    updated_at: ts(6),
    participant_1: U["demo-user-2"],
    participant_2: U["demo-user-4"],
  },
];

// ── Messages (10) ───────────────────────────────────────────────────────────
export const demoMessages: Message[] = [
  // Chat 1 (María ↔ Carlos, 4 messages)
  {
    id: "msg-1",
    chat_id: "chat-1",
    sender_id: "demo-user-2",
    content: "Hola María! Vi tu plan de la Patagonia, se ve increíble. ¿Ya tenés todo reservado?",
    is_read: true,
    created_at: ts(7, 2),
    sender: U["demo-user-2"],
  },
  {
    id: "msg-2",
    chat_id: "chat-1",
    sender_id: "demo-user-1",
    content: "Hola Carlos! Solo tengo los vuelos a El Calafate. El resto lo vamos viendo sobre la marcha. ¿Te interesa sumarte?",
    is_read: true,
    created_at: ts(7, 2.5),
    sender: U["demo-user-1"],
  },
  {
    id: "msg-3",
    chat_id: "chat-1",
    sender_id: "demo-user-2",
    content: "Me re interesa. Justo tengo vacaciones en noviembre. Tengo equipo de trekking y experiencia en glaciar.",
    is_read: true,
    created_at: ts(6),
    sender: U["demo-user-2"],
  },
  {
    id: "msg-4",
    chat_id: "chat-1",
    sender_id: "demo-user-2",
    content: "Ah, y conozco un hostel re lindo en El Chaltén que nos puede hacer precio por grupo.",
    is_read: false,
    created_at: ts(2),
    sender: U["demo-user-2"],
  },
  // Chat 2 (María ↔ Lucía, 3 messages)
  {
    id: "msg-5",
    chat_id: "chat-2",
    sender_id: "demo-user-3",
    content: "María! Tus fotos del viaje a Chile del año pasado son increíbles. ¿Qué cámara usaste?",
    is_read: true,
    created_at: ts(5, 1),
    sender: U["demo-user-3"],
  },
  {
    id: "msg-6",
    chat_id: "chat-2",
    sender_id: "demo-user-1",
    content: "Gracias Lucía! Uso una Sony A7III con un 24-70mm. Pero la magia está en la luz patagónica, no en la cámara 😄",
    is_read: true,
    created_at: ts(5, 0.5),
    sender: U["demo-user-1"],
  },
  {
    id: "msg-7",
    chat_id: "chat-2",
    sender_id: "demo-user-3",
    content: "Totalmente de acuerdo. Che, para el plan de la Patagonia, ¿puedo llevar mi dron? Hay unas tomas aéreas del Fitz Roy que son imperdibles.",
    is_read: false,
    created_at: ts(3),
    sender: U["demo-user-3"],
  },
  // Chat 3 (Carlos ↔ Pedro, 3 messages)
  {
    id: "msg-8",
    chat_id: "chat-3",
    sender_id: "demo-user-4",
    content: "Carlos! ¿Viste que hay un spot nuevo de surf en la costa caribeña de Colombia?",
    is_read: true,
    created_at: ts(8),
    sender: U["demo-user-4"],
  },
  {
    id: "msg-9",
    chat_id: "chat-3",
    sender_id: "demo-user-2",
    content: "No lo tenía visto! ¿Dónde exactamente? Así lo combino con mi tour de café por el Eje Cafetero.",
    is_read: true,
    created_at: ts(7, 23),
    sender: U["demo-user-2"],
  },
  {
    id: "msg-10",
    chat_id: "chat-3",
    sender_id: "demo-user-4",
    content: "En Palomino. Hay olas todo el año y queda cerca de Santa Marta. Podemos armar un plan combinado café + surf.",
    is_read: false,
    created_at: ts(5, 12),
    sender: U["demo-user-4"],
  },
];

// ── Friends (6 EnrichedFriend) ──────────────────────────────────────────────
export const demoFriends: EnrichedFriend[] = [
  // María's accepted friends (where María is user_id)
  { id: "friend-1", user_id: "demo-user-1", friend_id: "demo-user-2", status: "accepted", created_at: ts(60), friend: U["demo-user-2"] },
  { id: "friend-2", user_id: "demo-user-1", friend_id: "demo-user-3", status: "accepted", created_at: ts(50), friend: U["demo-user-3"] },
  { id: "friend-3", user_id: "demo-user-1", friend_id: "demo-user-4", status: "accepted", created_at: ts(40), friend: U["demo-user-4"] },
];

export const demoPendingRequests: EnrichedFriend[] = [
  // Requests sent TO María (friend_id = demo-user-1)
  { id: "pend-1", user_id: "demo-user-5", friend_id: "demo-user-1", status: "pending", created_at: ts(5), friend: U["demo-user-5"] },
];

export const demoSentRequests: EnrichedFriend[] = [
  // Requests sent BY María (user_id = demo-user-1)
  { id: "sent-1", user_id: "demo-user-1", friend_id: "demo-user-5", status: "pending", created_at: ts(15), friend: U["demo-user-5"] },
  { id: "sent-2", user_id: "demo-user-1", friend_id: "demo-user-4", status: "accepted", created_at: ts(40), friend: U["demo-user-4"] },
];

// ── Notifications (8, for María) ───────────────────────────────────────────
export const demoNotifications: Notification[] = [
  {
    id: "notif-1",
    user_id: "demo-user-1",
    actor_id: "demo-user-2",
    type: "new_message",
    title: "Nuevo mensaje de Carlos Rodríguez",
    body: "Ah, y conozco un hostel re lindo en El Chaltén que nos puede hacer precio por grupo.",
    link: "/messages/chat-1",
    is_read: false,
    created_at: ts(2),
    actor: { id: "demo-user-2", username: "carlosrodriguez", full_name: "Carlos Rodríguez", avatar_url: U["demo-user-2"].avatar_url },
  },
  {
    id: "notif-2",
    user_id: "demo-user-1",
    actor_id: "demo-user-3",
    type: "new_message",
    title: "Nuevo mensaje de Lucía Fernández",
    body: "Che, para el plan de la Patagonia, ¿puedo llevar mi dron? Hay unas tomas aéreas del Fitz Roy que son imperdibles.",
    link: "/messages/chat-2",
    is_read: false,
    created_at: ts(3),
    actor: { id: "demo-user-3", username: "luciafernandez", full_name: "Lucía Fernández", avatar_url: U["demo-user-3"].avatar_url },
  },
  {
    id: "notif-3",
    user_id: "demo-user-1",
    actor_id: "demo-user-5",
    type: "friend_accepted",
    title: "Ana Torres aceptó tu solicitud de amistad",
    body: "Ahora son amigos en SoloTravelers",
    link: "/profile/anatorres",
    is_read: true,
    created_at: ts(7),
    actor: { id: "demo-user-5", username: "anatorres", full_name: "Ana Torres", avatar_url: U["demo-user-5"].avatar_url },
  },
  {
    id: "notif-4",
    user_id: "demo-user-1",
    actor_id: "demo-user-2",
    type: "friend_accepted",
    title: "Carlos Rodríguez aceptó tu solicitud de amistad",
    body: "Ahora son amigos en SoloTravelers",
    link: "/profile/carlosrodriguez",
    is_read: true,
    created_at: ts(60),
    actor: { id: "demo-user-2", username: "carlosrodriguez", full_name: "Carlos Rodríguez", avatar_url: U["demo-user-2"].avatar_url },
  },
  {
    id: "notif-5",
    user_id: "demo-user-1",
    actor_id: "demo-user-3",
    type: "comment_reply",
    title: "Lucía Fernández respondió a tu comentario",
    body: "Visitamos 4 fincas diferentes, cada una con un proceso distinto. También hay una clase práctica de barismo incluida.",
    link: "/plans/plan-2",
    is_read: true,
    created_at: ts(34),
    actor: { id: "demo-user-3", username: "luciafernandez", full_name: "Lucía Fernández", avatar_url: U["demo-user-3"].avatar_url },
  },
  {
    id: "notif-6",
    user_id: "demo-user-1",
    actor_id: "demo-user-3",
    type: "join_accepted",
    title: "Lucía Fernández aceptó tu solicitud",
    body: "Te has unido al plan Aventura en Machu Picchu",
    link: "/plans/plan-3",
    is_read: true,
    created_at: ts(12),
    actor: { id: "demo-user-3", username: "luciafernandez", full_name: "Lucía Fernández", avatar_url: U["demo-user-3"].avatar_url },
  },
  {
    id: "notif-7",
    user_id: "demo-user-1",
    actor_id: "demo-user-2",
    type: "review_received",
    title: "Carlos Rodríguez te dejó una reseña",
    body: "5 estrellas — Excelente compañera de viaje. Muy organizada y siempre con buena onda.",
    link: "/plans/plan-2",
    is_read: true,
    created_at: ts(15),
    actor: { id: "demo-user-2", username: "carlosrodriguez", full_name: "Carlos Rodríguez", avatar_url: U["demo-user-2"].avatar_url },
  },
  {
    id: "notif-8",
    user_id: "demo-user-1",
    actor_id: "demo-user-3",
    type: "review_received",
    title: "Lucía Fernández te dejó una reseña",
    body: "4 estrellas — Muy buena experiencia viajando con María. Sabe mucho de fotografía.",
    link: "/plans/plan-3",
    is_read: true,
    created_at: ts(20),
    actor: { id: "demo-user-3", username: "luciafernandez", full_name: "Lucía Fernández", avatar_url: U["demo-user-3"].avatar_url },
  },
];

// ── Reviews (5) ─────────────────────────────────────────────────────────────
export const demoReviews: UserReview[] = [
  {
    id: "review-1",
    reviewer_id: "demo-user-1",
    reviewed_id: "demo-user-2",
    plan_id: "plan-2",
    rating: 5,
    comment: "Carlos es un excelente anfitrión. Su conocimiento de café es increíble y siempre estaba atento a que todos estuvieran cómodos.",
    created_at: ts(30),
    reviewer: U["demo-user-1"],
    reviewed: U["demo-user-2"],
    plan: demoPlans[1],
  },
  {
    id: "review-2",
    reviewer_id: "demo-user-2",
    reviewed_id: "demo-user-1",
    plan_id: "plan-2",
    rating: 5,
    comment: "Excelente compañera de viaje. Muy organizada y siempre con buena onda. La recomiendo 100%.",
    created_at: ts(15),
    reviewer: U["demo-user-2"],
    reviewed: U["demo-user-1"],
    plan: demoPlans[1],
  },
  {
    id: "review-3",
    reviewer_id: "demo-user-1",
    reviewed_id: "demo-user-3",
    plan_id: "plan-3",
    rating: 5,
    comment: "Lucía es una fotógrafa talentosa y una gran compañera de trekking. Hizo que el Camino Inca fuera inolvidable.",
    created_at: ts(25),
    reviewer: U["demo-user-1"],
    reviewed: U["demo-user-3"],
    plan: demoPlans[2],
  },
  {
    id: "review-4",
    reviewer_id: "demo-user-3",
    reviewed_id: "demo-user-1",
    plan_id: "plan-3",
    rating: 4,
    comment: "Muy buena experiencia viajando con María. Sabe mucho de fotografía y es excelente organizando logística.",
    created_at: ts(20),
    reviewer: U["demo-user-3"],
    reviewed: U["demo-user-1"],
    plan: demoPlans[2],
  },
  {
    id: "review-5",
    reviewer_id: "demo-user-4",
    reviewed_id: "demo-user-1",
    plan_id: "plan-4",
    rating: 5,
    comment: "María es re buena onda y siempre predispuesta. El finde en Mendoza fue espectacular gracias a su energía.",
    created_at: ts(10),
    reviewer: U["demo-user-4"],
    reviewed: U["demo-user-1"],
    plan: demoPlans[3],
  },
];

// ── Aggregated Dataset ──────────────────────────────────────────────────────
/** Convenience export for the demo provider and pages. */
export const demoDataSet = {
  users: demoUsers,
  demoUser,
  interests: demoInterests,
  userInterests: demoUserInterests,
  plans: demoPlans,
  notes: demoPlanNotes,
  comments: demoPlanComments,
  joinRequests: demoJoinRequests,
  chats: demoChats,
  messages: demoMessages,
  friends: demoFriends,
  pendingRequests: demoPendingRequests,
  sentRequests: demoSentRequests,
  notifications: demoNotifications,
  reviews: demoReviews,
} as const;
