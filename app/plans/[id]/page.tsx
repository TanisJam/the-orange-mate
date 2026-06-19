import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PlanDetail } from "@/components/plan-detail";
import { getTravelPlan, getPlanJoinRequests } from "@/lib/database";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Plan — The Orange Mate`,
    description: `Detalles del plan de viaje ${id}`,
  };
}

export default async function PlanDetailPage({ params }: Props) {
  const { id: planId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/auth/login");
  }

  // Load plan and join requests server-side
  const [plan, requests] = await Promise.all([
    getTravelPlan(planId, true),
    getPlanJoinRequests(planId, true),
  ]);

  if (!plan) {
    notFound();
  }

  return (
    <PlanDetail
      plan={plan}
      currentUserId={user.id}
      initialRequests={requests}
    />
  );
}
