"use client";

import { useDemo } from "@/components/demo-provider";
import { PlanForm } from "@/components/plan-form";

/**
 * Demo plan creation page.
 *
 * Renders the same `PlanForm` component used by the real `/plans/new`
 * route.  `PlanForm` detects demo mode via `useDemo()` and simulates
 * plan creation through the in-memory store instead of calling Supabase.
 */
export default function DemoNewPlanPage() {
  const { demoUser } = useDemo();

  return <PlanForm userId={demoUser.id} />;
}
