"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useDemo } from "@/components/demo-provider";
import { DiscoverResults } from "@/components/discover-results";
import { DiscoverFilters } from "@/components/discover-filters";
import { searchTravelPlans } from "@/lib/demo-database";
import { BackButton } from "@/components/back-button";
import type { TravelPlan, SearchFilters } from "@/lib/types";
import { Search } from "lucide-react";

/**
 * Demo discover page.
 *
 * Client-rendered equivalent of `app/(app)/discover/page.tsx`.  Fetches
 * mock plans from the demo-database adapter and passes them as props to
 * the same `DiscoverResults` component used by the real route.
 *
 * Note: `DiscoverFilters` uses URL search params which point to
 * `/discover?...` in production.  On the demo page the filter redirects
 * still go to `/discover` — full demo filter support is a follow-up.
 */
function DemoDiscoverInner() {
  const { isDemo, demoUser } = useDemo();
  const searchParams = useSearchParams();
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Parse URL search params into SearchFilters (mirrors real discover page)
  const filters: SearchFilters = {};
  const planType = searchParams.get("plan_type");
  if (planType) filters.plan_type = planType as SearchFilters["plan_type"];
  const dest = searchParams.get("destinations");
  if (dest) filters.destinations = dest.split(",").map((d) => d.trim()).filter(Boolean);
  const startDate = searchParams.get("start_date");
  if (startDate) filters.start_date = startDate;
  const endDate = searchParams.get("end_date");
  if (endDate) filters.end_date = endDate;
  const budgetMin = searchParams.get("budget_min");
  if (budgetMin) { const v = parseInt(budgetMin, 10); if (!isNaN(v)) filters.budget_min = v; }
  const budgetMax = searchParams.get("budget_max");
  if (budgetMax) { const v = parseInt(budgetMax, 10); if (!isNaN(v)) filters.budget_max = v; }
  if (searchParams.get("share_accommodation") === "true") filters.share_accommodation = true;
  if (searchParams.get("share_transport") === "true") filters.share_transport = true;
  if (searchParams.get("share_tours") === "true") filters.share_tours = true;

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  const searchKey = searchParams.toString();

  useEffect(() => {
    if (!isDemo) return;
    setLoading(true);
    searchTravelPlans(filters, { page, limit: 10 }).then((result) => {
      setPlans(result.data);
      setTotalCount(result.count ?? 0);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo, searchKey, page]);

  const hasActiveFilters =
    !!filters.plan_type ||
    (filters.destinations && filters.destinations.length > 0) ||
    !!filters.start_date ||
    !!filters.end_date ||
    filters.budget_min !== undefined ||
    filters.budget_max !== undefined ||
    filters.share_accommodation !== undefined ||
    filters.share_transport !== undefined ||
    filters.share_tours !== undefined;

  const totalPages = Math.max(1, Math.ceil(totalCount / 10));

  if (loading) {
    return (
      <div className="space-y-6">
        <BackButton fallbackHref="/demo/dashboard" />
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-heading text-primary dark:text-primary-light">
            Descubrí Planes
          </h1>
          <p className="text-lg font-body text-muted-foreground dark:text-neutral-white max-w-2xl mx-auto">
            Explorá planes de viaje públicos — datos de demostración.
          </p>
        </div>
        <div className="text-center py-16">
          <Search className="w-8 h-8 mx-auto text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground mt-2">Cargando planes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton fallbackHref="/demo/dashboard" />

      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-heading text-primary dark:text-primary-light">
          Descubrí Planes
        </h1>
        <p className="text-lg font-body text-muted-foreground dark:text-neutral-white max-w-2xl mx-auto">
          Explorá planes de viaje públicos — datos de demostración.
        </p>
      </div>

      {/* Filters */}
      <DiscoverFilters />

      {/* Introductory message when no filters */}
      {!hasActiveFilters && (
        <div className="text-center py-4">
          <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">
            Mostrando todos los planes públicos disponibles.
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            Usá los filtros para encontrar el plan ideal.
          </p>
        </div>
      )}

      {/* Results */}
      <DiscoverResults
        plans={plans}
        isAuthenticated={true}
        currentUserId={demoUser.id}
        pagination={{ page, totalCount, totalPages }}
      />
    </div>
  );
}

export default function DemoDiscoverPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <BackButton fallbackHref="/demo/dashboard" />
          <div className="text-center py-16">
            <Search className="w-8 h-8 mx-auto text-muted-foreground animate-pulse" />
          </div>
        </div>
      }
    >
      <DemoDiscoverInner />
    </Suspense>
  );
}
