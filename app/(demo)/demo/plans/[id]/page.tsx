"use client";

import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { useDemo } from "@/components/demo-provider";
import { PlanDetail } from "@/components/plan-detail";
import {
  getTravelPlan,
  getPlanJoinRequests,
  getPlanReviews,
} from "@/lib/demo-database";
import type {
  TravelPlan,
  PlanJoinRequest,
  UserReview,
} from "@/lib/types";
import { Plane } from "lucide-react";

/**
 * Demo plan detail page.
 *
 * Client-rendered equivalent of `app/(app)/plans/[id]/page.tsx`.  Fetches
 * mock plan data from the demo-database adapter and passes it as props to
 * `PlanDetail`.  No Supabase calls, no auth checks.
 */
export default function DemoPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: planId } = use(params);
  const { demoUser } = useDemo();

  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [requests, setRequests] = useState<PlanJoinRequest[]>([]);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [averageRating, setAverageRating] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [p, r, revs] = await Promise.all([
        getTravelPlan(planId),
        getPlanJoinRequests(planId),
        getPlanReviews(planId),
      ]);
      setPlan(p);
      setRequests(r);
      setReviews(revs);

      if (revs.length > 0) {
        const sum = revs.reduce((acc, rv) => acc + rv.rating, 0);
        setAverageRating({
          average: Math.round((sum / revs.length) * 10) / 10,
          count: revs.length,
        });
      }
      setLoading(false);
    }
    load();
  }, [planId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Plane className="w-8 h-8 mx-auto mb-2 text-primary animate-pulse" />
          <p className="text-muted-foreground">Cargando plan...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return notFound();
  }

  return (
    <PlanDetail
      plan={plan}
      currentUserId={demoUser.id}
      initialRequests={requests}
      reviews={reviews}
      averageRating={averageRating}
    />
  );
}
