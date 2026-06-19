// Database types for SoloTravelers application

export type PlanType = 'alojamiento' | 'actividad' | 'viaje_completo' | 'transporte' | 'salida_local';

export type PlanStatus = 'buscando_companero' | 'planeado' | 'flexible' | 'tentativo' | 'cerrado';

export type PermissionLevel = 'solo_ver' | 'agregar_notas_privadas' | 'sugerir_cambios' | 'editar';

export type FriendStatus = 'pending' | 'accepted' | 'blocked';

export type JoinRequestStatus = 'pending' | 'accepted' | 'rejected' | 'waiting_list';

export interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  age?: number;
  country?: string;
  city?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Interest {
  id: string;
  name: string;
  icon?: string;
  is_predefined: boolean;
  created_at: string;
}

export interface UserInterest {
  id: string;
  user_id: string;
  interest_id: string;
  is_custom: boolean;
  custom_name?: string;
  created_at: string;
  interest?: Interest; // for joined queries
}

export interface UserPhoto {
  id: string;
  user_id: string;
  photo_url: string;
  caption?: string;
  is_profile_photo: boolean;
  display_order: number;
  created_at: string;
}

export interface TravelPlan {
  id: string;
  creator_id: string;
  title: string;
  plan_type: PlanType;
  destinations: string[];
  start_date?: string;
  end_date?: string;
  flexible_dates: boolean;
  status: PlanStatus;
  description?: string;
  max_participants: number;
  current_participants: number;
  share_accommodation: boolean;
  share_transport: boolean;
  share_tours: boolean;
  budget_range_min?: number;
  budget_range_max?: number;
  currency: string;
  is_public: boolean;
  comments_enabled: boolean;
  created_at: string;
  updated_at: string;
  creator?: UserProfile; // for joined queries
  participants?: PlanParticipant[]; // for joined queries
}

export interface PlanParticipant {
  id: string;
  plan_id: string;
  user_id: string;
  permission_level: PermissionLevel;
  joined_at: string;
  invited_by?: string;
  user?: UserProfile; // for joined queries
}

export interface PlanNote {
  id: string;
  plan_id: string;
  author_id: string;
  content: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  author?: UserProfile; // for joined queries
}

export interface PlanComment {
  id: string;
  plan_id: string;
  author_id: string;
  content: string;
  parent_comment_id?: string;
  created_at: string;
  updated_at: string;
  author?: UserProfile; // for joined queries
  replies?: PlanComment[]; // for nested comments
}

export interface PlanJoinRequest {
  id: string;
  plan_id: string;
  requester_id: string;
  message?: string;
  status: JoinRequestStatus;
  created_at: string;
  responded_at?: string;
  requester?: UserProfile; // for joined queries
  plan?: TravelPlan; // for joined queries
}

export interface UserFriend {
  id: string;
  user_id: string;
  friend_id: string;
  status: FriendStatus;
  created_at: string;
  friend?: UserProfile; // for joined queries
}

export interface Chat {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  created_at: string;
  updated_at: string;
  participant_1?: UserProfile; // for joined queries
  participant_2?: UserProfile; // for joined queries
  last_message?: Message; // for joined queries
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: UserProfile; // for joined queries
}

export interface UserReview {
  id: string;
  reviewer_id: string;
  reviewed_id: string;
  plan_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer?: UserProfile; // for joined queries
  reviewed?: UserProfile; // for joined queries
  plan?: TravelPlan; // for joined queries
}

// Form types for creating/updating
export interface CreateUserProfileData {
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  age?: number;
  country?: string;
  city?: string;
  phone?: string;
}

export interface CreateTravelPlanData {
  title: string;
  plan_type: PlanType;
  destinations: string[];
  start_date?: string;
  end_date?: string;
  flexible_dates?: boolean;
  status?: PlanStatus;
  description?: string;
  max_participants?: number;
  share_accommodation?: boolean;
  share_transport?: boolean;
  share_tours?: boolean;
  budget_range_min?: number;
  budget_range_max?: number;
  currency?: string;
  is_public?: boolean;
  comments_enabled?: boolean;
}

export interface CreatePlanNoteData {
  plan_id: string;
  content: string;
  is_private?: boolean;
}

export interface CreatePlanCommentData {
  plan_id: string;
  content: string;
  parent_comment_id?: string;
}

export interface CreateMessageData {
  chat_id: string;
  content: string;
}

export interface CreateJoinRequestData {
  plan_id: string;
  message?: string;
  status?: 'pending' | 'waiting_list';
}

// Utility types
export interface SearchFilters {
  plan_type?: PlanType;
  destinations?: string[];
  start_date?: string;
  end_date?: string;
  interests?: string[];
  max_participants?: number;
  share_accommodation?: boolean;
  share_transport?: boolean;
  share_tours?: boolean;
  budget_min?: number;
  budget_max?: number;
  currency?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  count?: number;
}

// Constants
export const PLAN_TYPES: { value: PlanType; label: string; icon: string }[] = [
  { value: 'alojamiento', label: 'Alojamiento', icon: '🏨' },
  { value: 'actividad', label: 'Actividad', icon: '🎯' },
  { value: 'viaje_completo', label: 'Viaje Completo', icon: '✈️' },
  { value: 'transporte', label: 'Transporte', icon: '🚗' },
  { value: 'salida_local', label: 'Salida Local', icon: '🚶‍♂️' },
];

export const PLAN_STATUSES: { value: PlanStatus; label: string; color: string }[] = [
  { value: 'buscando_companero', label: 'Buscando Compañero', color: 'bg-primary' },
  { value: 'planeado', label: 'Planeado', color: 'bg-secondary' },
  { value: 'flexible', label: 'Flexible', color: 'bg-accent' },
  { value: 'tentativo', label: 'Tentativo', color: 'bg-neutral-gray' },
  { value: 'cerrado', label: 'Cerrado', color: 'bg-error' },
];

export const PERMISSION_LEVELS: { value: PermissionLevel; label: string }[] = [
  { value: 'solo_ver', label: 'Solo Ver' },
  { value: 'agregar_notas_privadas', label: 'Agregar Notas Privadas' },
  { value: 'sugerir_cambios', label: 'Sugerir Cambios' },
  { value: 'editar', label: 'Editar' },
];

export const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'ARS', label: 'ARS ($)' },
  { value: 'MXN', label: 'MXN ($)' },
  { value: 'COP', label: 'COP ($)' },
];

export const COUNTRIES = [
  'Argentina', 'México', 'Colombia', 'España', 'Estados Unidos', 'Brasil',
  'Chile', 'Perú', 'Uruguay', 'Ecuador', 'Venezuela', 'Bolivia',
  'Paraguay', 'Costa Rica', 'Guatemala', 'Panamá', 'Nicaragua',
  'Honduras', 'El Salvador', 'República Dominicana', 'Cuba', 'Puerto Rico'
]; 