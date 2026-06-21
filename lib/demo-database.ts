import type {
  UserProfile,
  TravelPlan,
  PlanJoinRequest,
  PlanComment,
  PlanNote,
  EnrichedFriend,
  Chat,
  Message,
  Notification,
  UserInterest,
  UserReview,
  SearchFilters,
  PaginationParams,
  ApiResponse,
} from "./types";
import { demoDataSet } from "./demo-data";
import { demoStore } from "./demo-store";

/**
 * Demo database adapter.
 *
 * Mirrors the API surface of `lib/database-client.ts` (plus `getUserChats`,
 * `getChatMessages` from `lib/database.ts`, and `getNotifications` from
 * `lib/notification-client.ts`). All reads come from static mock data or
 * the in-memory `demoStore`; writes go through `demoStore`.
 */

// ── User Profile ────────────────────────────────────────────────────────────

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  return demoDataSet.users.find((u) => u.id === userId) ?? null;
}

export async function getUserProfileByUsername(username: string): Promise<UserProfile | null> {
  return demoDataSet.users.find((u) => u.username === username) ?? null;
}

export async function getUserPlanStats(userId: string): Promise<{ created: number; participating: number }> {
  const created = demoStore.plans.filter((p) => p.creator_id === userId).length;
  const participating = demoStore.plans.filter(
    (p) => p.participants?.some((pt) => pt.user_id === userId),
  ).length;
  return { created, participating };
}

export async function getUserInterests(userId: string): Promise<UserInterest[]> {
  return demoDataSet.userInterests.filter((ui) => ui.user_id === userId);
}

// ── Travel Plans ────────────────────────────────────────────────────────────

export async function getUserTravelPlans(userId: string): Promise<TravelPlan[]> {
  return demoStore.plans.filter((p) => p.creator_id === userId);
}

export async function getParticipatingPlans(userId: string): Promise<TravelPlan[]> {
  return demoStore.plans.filter(
    (p) => p.participants?.some((pt) => pt.user_id === userId),
  );
}

export async function getTravelPlan(planId: string): Promise<TravelPlan | null> {
  return demoStore.plans.find((p) => p.id === planId) ?? null;
}

export async function searchTravelPlans(
  filters: SearchFilters,
  pagination: PaginationParams = { page: 1, limit: 10 },
): Promise<ApiResponse<TravelPlan[]>> {
  let results = demoStore.plans.filter((p) => p.is_public);

  if (filters.plan_type) {
    results = results.filter((p) => p.plan_type === filters.plan_type);
  }
  if (filters.destinations && filters.destinations.length > 0) {
    results = results.filter((p) =>
      p.destinations.some((d) => filters.destinations!.includes(d)),
    );
  }
  if (filters.start_date) {
    results = results.filter((p) => p.start_date && p.start_date >= filters.start_date!);
  }
  if (filters.end_date) {
    results = results.filter((p) => p.end_date && p.end_date <= filters.end_date!);
  }
  if (filters.max_participants) {
    results = results.filter((p) => p.max_participants <= filters.max_participants!);
  }
  if (filters.share_accommodation !== undefined) {
    results = results.filter((p) => p.share_accommodation === filters.share_accommodation);
  }
  if (filters.share_transport !== undefined) {
    results = results.filter((p) => p.share_transport === filters.share_transport);
  }
  if (filters.share_tours !== undefined) {
    results = results.filter((p) => p.share_tours === filters.share_tours);
  }
  if (filters.budget_min !== undefined) {
    results = results.filter(
      (p) => p.budget_range_min !== undefined && p.budget_range_min >= filters.budget_min!,
    );
  }
  if (filters.budget_max !== undefined) {
    results = results.filter(
      (p) => p.budget_range_max !== undefined && p.budget_range_max <= filters.budget_max!,
    );
  }
  if (filters.currency) {
    results = results.filter((p) => p.currency === filters.currency);
  }

  // Sort by created_at desc (matches real behaviour)
  results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const total = results.length;
  const page = pagination.page ?? 1;
  const limit = pagination.limit ?? 10;
  const from = (page - 1) * limit;
  const paginated = results.slice(from, from + limit);

  return { data: paginated, count: total };
}

// ── Plan Comments / Notes / Join Requests ───────────────────────────────────

export async function getPlanComments(planId: string): Promise<PlanComment[]> {
  return demoDataSet.comments
    .filter((c) => c.plan_id === planId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export async function getPlanNotes(planId: string): Promise<PlanNote[]> {
  return demoDataSet.notes
    .filter((n) => n.plan_id === planId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getPlanJoinRequests(planId: string): Promise<PlanJoinRequest[]> {
  return demoStore.joinRequests
    .filter((j) => j.plan_id === planId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// ── Friends ─────────────────────────────────────────────────────────────────

export async function getFriends(userId: string): Promise<EnrichedFriend[]> {
  return demoStore.friends
    .filter((f) => f.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getPendingRequests(userId: string): Promise<EnrichedFriend[]> {
  return demoStore.pendingRequests
    .filter((f) => f.friend_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getSentRequests(userId: string): Promise<EnrichedFriend[]> {
  return demoStore.sentRequests
    .filter((f) => f.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// ── Chats ───────────────────────────────────────────────────────────────────

export async function getUserChats(userId: string, _isServer = false): Promise<Chat[]> {
  return demoDataSet.chats
    .filter(
      (c) => c.participant_1_id === userId || c.participant_2_id === userId,
    )
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

export async function getChatMessages(chatId: string, _isServer = false): Promise<Message[]> {
  return demoStore.messages
    .filter((m) => m.chat_id === chatId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

// ── Notifications ───────────────────────────────────────────────────────────

export async function getNotifications(
  userId: string,
  page: number = 1,
  limit: number = 20,
): Promise<{ data: Notification[]; count: number }> {
  const userNotifications = demoStore.notifications
    .filter((n) => n.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const total = userNotifications.length;
  const from = (page - 1) * limit;

  return {
    data: userNotifications.slice(from, from + limit),
    count: total,
  };
}

// ── Reviews ─────────────────────────────────────────────────────────────────

export async function getPlanReviews(planId: string): Promise<UserReview[]> {
  return demoStore.reviews
    .filter((r) => r.plan_id === planId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getUserReviews(userId: string): Promise<UserReview[]> {
  return demoStore.reviews
    .filter((r) => r.reviewed_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
