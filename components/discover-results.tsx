"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TravelPlan } from "@/lib/types";
import { PLAN_TYPES } from "@/lib/types";
import {
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  LogIn,
  ArrowRight,
  Search,
} from "lucide-react";

interface DiscoverResultsProps {
  plans: TravelPlan[];
  isAuthenticated: boolean;
  currentUserId?: string;
  pagination: {
    page: number;
    totalCount: number;
    totalPages: number;
  };
}

function formatApproxDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", { year: "numeric", month: "short" });
}

function formatApproxDateRange(startDate?: string, endDate?: string): string {
  if (startDate && endDate) {
    return `${formatApproxDate(startDate)} – ${formatApproxDate(endDate)}`;
  }
  if (startDate) {
    return `Desde ${formatApproxDate(startDate)}`;
  }
  if (endDate) {
    return `Hasta ${formatApproxDate(endDate)}`;
  }
  return "Fechas flexibles";
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getPlanTypeInfo(type: string) {
  return PLAN_TYPES.find((pt) => pt.value === type) || PLAN_TYPES[0];
}

function PaginationControls({
  page,
  totalPages,
  totalCount,
}: {
  page: number;
  totalPages: number;
  totalCount: number;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const buildPageUrl = useCallback(
    (targetPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (targetPage <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(targetPage));
      }
      return `/discover?${params.toString()}`;
    },
    [searchParams]
  );

  const goToPage = useCallback(
    (targetPage: number) => {
      router.push(buildPageUrl(targetPage));
    },
    [router, buildPageUrl]
  );

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
      <p className="text-sm text-muted-foreground">
        {totalCount} {totalCount === 1 ? "plan encontrado" : "planes encontrados"}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => goToPage(page - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>
        <span className="text-sm font-medium px-3">
          {page} de {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => goToPage(page + 1)}
        >
          Siguiente
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function DiscoverResults({
  plans,
  isAuthenticated,
  currentUserId,
  pagination,
}: DiscoverResultsProps) {
  if (plans.length === 0) {
    return (
      <div className="text-center py-16">
        <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-heading text-neutral-black dark:text-neutral-white mb-2">
          No se encontraron planes con estos filtros
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Intentá con otros filtros o volvé más tarde para ver nuevos planes
          disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isAuthenticated={isAuthenticated}
            currentUserId={currentUserId}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <PaginationControls
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
        />
      )}
    </div>
  );
}

/* ───── Plan Card ───── */

function PlanCard({
  plan,
  isAuthenticated,
}: {
  plan: TravelPlan;
  isAuthenticated: boolean;
  currentUserId?: string;
}) {
  const typeInfo = getPlanTypeInfo(plan.plan_type);

  if (!isAuthenticated) {
    return <UnauthenticatedCard plan={plan} />;
  }

  return <AuthenticatedCard plan={plan} typeInfo={typeInfo} />;
}

/* ───── Unauthenticated Card ───── */

function UnauthenticatedCard({
  plan,
}: {
  plan: TravelPlan;
}) {
  return (
    <div className="p-4 border-2 border-ink rounded-lg bg-card text-card-foreground shadow-[var(--stroke-width)_var(--stroke-width)_0px_0px_hsl(var(--ink))] flex flex-col">
      {/* Type badge intentionally hidden for anonymous users per spec */}

      {/* Destinations */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {plan.destinations.map((dest) => (
          <Badge key={dest} variant="secondary" className="text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            {dest}
          </Badge>
        ))}
      </div>

      {/* Dates (always show — dates or flexible message) */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
        <Calendar className="w-4 h-4" />
        <span>{formatApproxDateRange(plan.start_date, plan.end_date)}</span>
      </div>

      {/* Login prompt */}
      <div className="mt-auto pt-3 border-t border-neutral-gray/30">
        <Button asChild variant="link" size="sm" className="p-0 h-auto">
          <Link href="/auth/login" className="flex items-center gap-1">
            <LogIn className="w-3.5 h-3.5" />
            Inicia sesión para ver detalles
          </Link>
        </Button>
      </div>
    </div>
  );
}

/* ───── Authenticated Card ───── */

function AuthenticatedCard({
  plan,
  typeInfo,
}: {
  plan: TravelPlan;
  typeInfo: { value: string; label: string; icon: string };
}) {
  return (
    <div className="p-4 border-2 border-ink rounded-lg bg-card shadow-[var(--stroke-width)_var(--stroke-width)_0px_0px_hsl(var(--ink))] dark:border-neutral-gray hover:shadow-lg transition-shadow flex flex-col cursor-pointer">
      {/* Header: type + title */}
      <div className="flex items-start gap-2 mb-3">
        <span className="text-xl">{typeInfo.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-neutral-black dark:text-neutral-white line-clamp-1">
              {plan.title}
            </h3>
            <Badge variant="outline" className="text-xs shrink-0">
              {typeInfo.label}
            </Badge>
          </div>
          {/* Creator */}
          <p className="text-sm text-muted-foreground mt-0.5">
            por{" "}
            <Link
              href={`/profile/${plan.creator?.username || plan.creator_id}`}
              className="hover:underline font-medium"
            >
              {plan.creator?.full_name || plan.creator?.username || "Usuario"}
            </Link>
          </p>
        </div>
      </div>

      {/* Destinations */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {plan.destinations.map((dest) => (
          <Badge key={dest} variant="secondary" className="text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            {dest}
          </Badge>
        ))}
      </div>

      {/* Dates */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
        <Calendar className="w-4 h-4" />
        <span>
          {plan.start_date
            ? formatFullDate(plan.start_date) +
              (plan.end_date ? ` – ${formatFullDate(plan.end_date)}` : "")
            : "Fechas flexibles"}
        </span>
      </div>

      {/* Budget */}
      {(plan.budget_range_min !== undefined ||
        plan.budget_range_max !== undefined) && (
        <p className="text-sm font-medium text-neutral-black dark:text-neutral-white mb-3">
          {plan.budget_range_min !== undefined
            ? `${plan.currency} ${plan.budget_range_min.toLocaleString("es-ES")}`
            : "Sin mínimo"}
          {plan.budget_range_max !== undefined
            ? ` – ${plan.currency} ${plan.budget_range_max.toLocaleString("es-ES")}`
            : ""}
        </p>
      )}

      {/* Description */}
      {plan.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {plan.description}
        </p>
      )}

      {/* CTA */}
      <div className="mt-auto pt-3 border-t border-neutral-gray/30">
        <Button asChild variant="primary" size="sm" className="w-full">
          <Link href={`/plans/${plan.id}`}>
            Ver plan
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
