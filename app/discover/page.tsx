import { createClient } from "@/lib/supabase/server";
import { searchTravelPlans } from "@/lib/database";
import type { SearchFilters, PaginationParams } from "@/lib/types";
import { DiscoverFilters } from "@/components/discover-filters";
import { DiscoverResults } from "@/components/discover-results";
import { Search } from "lucide-react";
import { Suspense } from "react";

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const params = await searchParams;

  // Parse URL search params into SearchFilters
  const filters: SearchFilters = {};

  if (typeof params.plan_type === "string" && params.plan_type) {
    filters.plan_type = params.plan_type as SearchFilters["plan_type"];
  }

  if (typeof params.destinations === "string" && params.destinations) {
    filters.destinations = params.destinations
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);
  }

  if (typeof params.start_date === "string" && params.start_date) {
    filters.start_date = params.start_date;
  }

  if (typeof params.end_date === "string" && params.end_date) {
    filters.end_date = params.end_date;
  }

  if (typeof params.budget_min === "string" && params.budget_min) {
    const val = parseInt(params.budget_min, 10);
    if (!isNaN(val)) filters.budget_min = val;
  }

  if (typeof params.budget_max === "string" && params.budget_max) {
    const val = parseInt(params.budget_max, 10);
    if (!isNaN(val)) filters.budget_max = val;
  }

  if (typeof params.share_accommodation === "string") {
    filters.share_accommodation = params.share_accommodation === "true";
  }

  if (typeof params.share_transport === "string") {
    filters.share_transport = params.share_transport === "true";
  }

  if (typeof params.share_tours === "string") {
    filters.share_tours = params.share_tours === "true";
  }

  const page = typeof params.page === "string" ? parseInt(params.page, 10) || 1 : 1;
  const pagination: PaginationParams = { page, limit: 10 };

  const result = await searchTravelPlans(filters, pagination, true);
  const plans = result.data;
  const totalCount = result.count || 0;

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

  const totalPages = Math.max(1, Math.ceil(totalCount / (pagination.limit || 10)));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-heading text-primary dark:text-primary-light">
          Descubrí Planes
        </h1>
        <p className="text-lg font-body text-neutral-gray dark:text-neutral-white max-w-2xl mx-auto">
          Encontrá compañeros de viaje y unite a aventuras increíbles. Todos los planes
          públicos están a un click.
        </p>
      </div>

      {/* Filter Panel — wrapped in Suspense for useSearchParams */}
      <Suspense
        fallback={
          <div className="border-2 border-neutral-black dark:border-neutral-gray rounded-[var(--radius)] p-6 bg-neutral-white dark:bg-neutral-light shadow-[var(--stroke-width)_var(--stroke-width)_0px_0px_rgba(25,25,25,1)]">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-neutral-light dark:bg-neutral-gray rounded" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-10 bg-neutral-light dark:bg-neutral-gray rounded" />
                <div className="h-10 bg-neutral-light dark:bg-neutral-gray rounded" />
                <div className="h-10 bg-neutral-light dark:bg-neutral-gray rounded" />
              </div>
            </div>
          </div>
        }
      >
        <DiscoverFilters />
      </Suspense>

      {/* Introductory message when no filters */}
      {!hasActiveFilters && (
        <div className="text-center py-4">
          <Search className="w-12 h-12 mx-auto text-neutral-gray mb-4" />
          <p className="text-neutral-gray text-lg">
            Mostrando todos los planes públicos disponibles.
          </p>
          <p className="text-neutral-gray text-sm mt-1">
            Usá los filtros para encontrar el plan ideal.
          </p>
        </div>
      )}

      {/* Results */}
      <DiscoverResults
        plans={plans}
        isAuthenticated={!!user}
        currentUserId={user?.id}
        pagination={{ page, totalCount, totalPages }}
      />
    </div>
  );
}
