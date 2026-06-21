"use client";

import { useDemo } from "@/components/demo-provider";
import { DashboardContent } from "@/components/dashboard-content";

/**
 * Demo dashboard page.
 *
 * Filters plans directly from the in-memory demo store (available via
 * `useDemo()`) and passes the results as `initial*` props to
 * `DashboardContent`.  When these props are provided, `DashboardContent`
 * skips all Supabase fetch calls and renders the mock data inline.
 */
export default function DemoDashboardPage() {
  const { demoUser, plans } = useDemo();
  const userId = demoUser.id;

  const userPlans = plans.filter((p) => p.creator_id === userId);
  const participatingPlans = plans.filter(
    (p) => p.participants?.some((pt) => pt.user_id === userId),
  );
  const discoverPlans = plans
    .filter((p) => p.is_public)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 6);

  return (
    <DashboardContent
      userId={userId}
      initialUserProfile={demoUser}
      initialUserPlans={userPlans}
      initialParticipatingPlans={participatingPlans}
      initialDiscoverPlans={discoverPlans}
    />
  );
}
