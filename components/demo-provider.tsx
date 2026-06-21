"use client";

import { createContext, useContext, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type {
  UserProfile,
  TravelPlan,
  Chat,
  Message,
  Notification,
  EnrichedFriend,
  UserReview,
  CreateTravelPlanData,
  CreateMessageData,
  CreateReviewData,
  PlanJoinRequest,
} from "@/lib/types";
import { demoDataSet } from "@/lib/demo-data";
import { demoStore } from "@/lib/demo-store";

// ── Context Shape ────────────────────────────────────────────────────────────

export interface DemoContextValue {
  isDemo: boolean;
  demoUser: UserProfile;
  users: UserProfile[];
  plans: TravelPlan[];
  chats: Chat[];
  messages: Message[];
  notifications: Notification[];
  friends: EnrichedFriend[];
  reviews: UserReview[];
  /** Simulated mutations — each shows toast "Demo mode: …" on success */
  createPlan: (data: CreateTravelPlanData) => TravelPlan;
  deletePlan: (planId: string) => boolean;
  sendMessage: (data: CreateMessageData) => Message | null;
  sendFriendRequest: (friendId: string) => EnrichedFriend | null;
  acceptFriendRequest: (requestId: string) => EnrichedFriend | null;
  submitReview: (data: CreateReviewData) => UserReview | null;
  submitJoinRequest: (planId: string) => PlanJoinRequest | null;
}

// ── Safe fallback when useDemo() is called outside DemoProvider ──────────────

const stub: DemoContextValue = {
  isDemo: false,
  demoUser: null as unknown as UserProfile,
  users: [],
  plans: [],
  chats: [],
  messages: [],
  notifications: [],
  friends: [],
  reviews: [],
  createPlan: () => {
    throw new Error("useDemo: createPlan called outside demo mode");
  },
  deletePlan: () => false,
  sendMessage: () => null,
  sendFriendRequest: () => null,
  acceptFriendRequest: () => null,
  submitReview: () => null,
  submitJoinRequest: () => null,
};

const DemoContext = createContext<DemoContextValue>(stub);

// ── Provider ─────────────────────────────────────────────────────────────────

export function DemoProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDemo = pathname?.startsWith("/demo") ?? false;

  if (!isDemo) {
    // Outside /demo — render children bare (no context wrapping).
    return <>{children}</>;
  }

  const value: DemoContextValue = {
    isDemo: true,
    demoUser: demoDataSet.demoUser,
    users: demoDataSet.users,
    plans: demoStore.plans,
    chats: demoDataSet.chats,
    messages: demoStore.messages,
    notifications: demoStore.notifications,
    friends: demoStore.friends,
    reviews: demoStore.reviews,
    createPlan: (data) => demoStore.createPlan(data),
    deletePlan: (id) => demoStore.deletePlan(id),
    sendMessage: (data) => demoStore.sendMessage(data),
    sendFriendRequest: (id) => demoStore.sendFriendRequest(id),
    acceptFriendRequest: (id) => demoStore.acceptFriendRequest(id),
    submitReview: (data) => demoStore.submitReview(data),
    submitJoinRequest: (id) => demoStore.submitJoinRequest(id),
  };

  return (
    <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Access demo mode state and mutation helpers from any component.
 *
 * When called outside a `DemoProvider` (or on any route other than `/demo/*`),
 * returns `{ isDemo: false }` with no-op stubs — safe to call unconditionally
 * in shared components that render on both real and demo routes.
 */
export function useDemo(): DemoContextValue {
  return useContext(DemoContext);
}
