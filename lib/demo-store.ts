import type {
  TravelPlan,
  CreateTravelPlanData,
  Message,
  CreateMessageData,
  EnrichedFriend,
  UserReview,
  CreateReviewData,
  Notification,
  PlanJoinRequest,
} from "./types";
import { demoDataSet } from "./demo-data";
import { demoUser } from "./demo-data";

// ── ID Generator ────────────────────────────────────────────────────────────
let _counter = 100;

/** Generates a unique demo-scoped ID. Resets on page refresh (session scope). */
function genId(prefix: string): string {
  return `demo-${prefix}-${++_counter}-${Date.now()}`;
}

// ── Store ───────────────────────────────────────────────────────────────────

/**
 * In-memory mutable store for demo mode.
 * All mutations append to arrays and return the new entity.
 * Never throws — always returns a value or gracefully handles edge cases.
 */
class DemoStore {
  plans: TravelPlan[];
  messages: Message[];
  friends: EnrichedFriend[];
  pendingRequests: EnrichedFriend[];
  sentRequests: EnrichedFriend[];
  notifications: Notification[];
  reviews: UserReview[];
  joinRequests: PlanJoinRequest[];

  constructor() {
    // Clone the static dataset so mutations don't affect the source
    this.plans = [...demoDataSet.plans];
    this.messages = [...demoDataSet.messages];
    this.friends = [...demoDataSet.friends];
    this.pendingRequests = [...demoDataSet.pendingRequests];
    this.sentRequests = [...demoDataSet.sentRequests];
    this.notifications = [...demoDataSet.notifications];
    this.reviews = [...demoDataSet.reviews];
    this.joinRequests = [...demoDataSet.joinRequests];
  }

  // ── Plans ───────────────────────────────────────────────────────────────

  createPlan(data: CreateTravelPlanData): TravelPlan {
    const now = new Date().toISOString();
    const plan: TravelPlan = {
      id: genId("plan"),
      creator_id: demoUser.id,
      title: data.title,
      plan_type: data.plan_type,
      destinations: data.destinations,
      start_date: data.start_date,
      end_date: data.end_date,
      flexible_dates: data.flexible_dates ?? false,
      status: data.status ?? "buscando_companero",
      description: data.description,
      max_participants: data.max_participants ?? 4,
      current_participants: 1,
      share_accommodation: data.share_accommodation ?? false,
      share_transport: data.share_transport ?? false,
      share_tours: data.share_tours ?? false,
      budget_range_min: data.budget_range_min,
      budget_range_max: data.budget_range_max,
      currency: data.currency ?? "USD",
      is_public: data.is_public ?? true,
      comments_enabled: data.comments_enabled ?? true,
      created_at: now,
      updated_at: now,
      creator: demoUser,
      participants: [
        {
          id: genId("part"),
          plan_id: "will-be-set", // placeholder — overwritten after
          user_id: demoUser.id,
          permission_level: "editar",
          joined_at: now,
          user: demoUser,
        },
      ],
    };
    // Fix the participant plan_id reference
    plan.participants![0].plan_id = plan.id;
    this.plans.unshift(plan);
    return plan;
  }

  deletePlan(planId: string): boolean {
    const idx = this.plans.findIndex((p) => p.id === planId);
    if (idx === -1) return false;
    this.plans.splice(idx, 1);
    return true;
  }

  // ── Messages ────────────────────────────────────────────────────────────

  sendMessage(data: CreateMessageData): Message | null {
    const now = new Date().toISOString();
    const msg: Message = {
      id: genId("msg"),
      chat_id: data.chat_id,
      sender_id: demoUser.id,
      content: data.content,
      is_read: false,
      created_at: now,
      sender: demoUser,
    };
    this.messages.push(msg);
    return msg;
  }

  // ── Friends ─────────────────────────────────────────────────────────────

  sendFriendRequest(friendId: string): EnrichedFriend | null {
    if (friendId === demoUser.id) return null;

    // Check for existing relationship
    const exists = [...this.friends, ...this.pendingRequests, ...this.sentRequests].find(
      (f) =>
        (f.user_id === demoUser.id && f.friend_id === friendId) ||
        (f.user_id === friendId && f.friend_id === demoUser.id),
    );
    if (exists) return null;

    // Find the friend's profile
    const friendProfile = demoDataSet.users.find((u) => u.id === friendId);
    if (!friendProfile) return null;

    const now = new Date().toISOString();
    const request: EnrichedFriend = {
      id: genId("friend"),
      user_id: demoUser.id,
      friend_id: friendId,
      status: "pending",
      created_at: now,
      friend: friendProfile,
    };
    this.sentRequests.unshift(request);
    return request;
  }

  acceptFriendRequest(requestId: string): EnrichedFriend | null {
    const idx = this.pendingRequests.findIndex((r) => r.id === requestId);
    if (idx === -1) return null;

    const request = this.pendingRequests[idx];
    this.pendingRequests.splice(idx, 1);

    const accepted: EnrichedFriend = { ...request, status: "accepted" };
    this.friends.unshift(accepted);
    return accepted;
  }

  rejectFriendRequest(requestId: string): boolean {
    const idx = this.pendingRequests.findIndex((r) => r.id === requestId);
    if (idx === -1) return false;
    this.pendingRequests.splice(idx, 1);
    return true;
  }

  // ── Reviews ─────────────────────────────────────────────────────────────

  submitReview(data: CreateReviewData): UserReview | null {
    if (data.rating < 1 || data.rating > 5) return null;

    const now = new Date().toISOString();
    const reviewer = demoUser;
    const reviewed = demoDataSet.users.find((u) => u.id === data.reviewed_id);
    const plan = this.plans.find((p) => p.id === data.plan_id);

    const review: UserReview = {
      id: genId("review"),
      reviewer_id: demoUser.id,
      reviewed_id: data.reviewed_id,
      plan_id: data.plan_id,
      rating: data.rating,
      comment: data.comment,
      created_at: now,
      reviewer,
      reviewed,
      plan,
    };
    this.reviews.unshift(review);
    return review;
  }

  // ── Join Requests ───────────────────────────────────────────────────────

  submitJoinRequest(planId: string): PlanJoinRequest | null {
    const plan = this.plans.find((p) => p.id === planId);
    if (!plan) return null;

    const now = new Date().toISOString();
    const request: PlanJoinRequest = {
      id: genId("join"),
      plan_id: planId,
      requester_id: demoUser.id,
      status: "pending",
      created_at: now,
      requester: demoUser,
    };
    this.joinRequests.unshift(request);
    return request;
  }

  // ── Notifications ───────────────────────────────────────────────────────

  markNotificationRead(notificationId: string): boolean {
    const notif = this.notifications.find((n) => n.id === notificationId);
    if (!notif) return false;
    notif.is_read = true;
    return true;
  }

  markAllNotificationsRead(): void {
    this.notifications.forEach((n) => {
      n.is_read = true;
    });
  }

  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.is_read).length;
  }

  // ── Reset ───────────────────────────────────────────────────────────────

  /** Resets the store to its initial state. */
  reset(): void {
    this.plans = [...demoDataSet.plans];
    this.messages = [...demoDataSet.messages];
    this.friends = [...demoDataSet.friends];
    this.pendingRequests = [...demoDataSet.pendingRequests];
    this.sentRequests = [...demoDataSet.sentRequests];
    this.notifications = [...demoDataSet.notifications];
    this.reviews = [...demoDataSet.reviews];
    this.joinRequests = [...demoDataSet.joinRequests];
  }
}

/** Singleton store instance. Created once per page load (session scope). */
export const demoStore = new DemoStore();
