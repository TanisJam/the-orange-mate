"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PLAN_TYPES } from "@/lib/types";
import { Search, X } from "lucide-react";

export function DiscoverFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read current values from URL
  const currentValues = useMemo(() => {
    const planType = searchParams.get("plan_type") || "";
    const destinations = searchParams.get("destinations") || "";
    const startDate = searchParams.get("start_date") || "";
    const endDate = searchParams.get("end_date") || "";
    const budgetMin = searchParams.get("budget_min") || "";
    const budgetMax = searchParams.get("budget_max") || "";
    const shareAccommodation = searchParams.get("share_accommodation") === "true";
    const shareTransport = searchParams.get("share_transport") === "true";
    const shareTours = searchParams.get("share_tours") === "true";
    return {
      planType,
      destinations,
      startDate,
      endDate,
      budgetMin,
      budgetMax,
      shareAccommodation,
      shareTransport,
      shareTours,
    };
  }, [searchParams]);

  const hasAnyFilter =
    !!currentValues.planType ||
    !!currentValues.destinations ||
    !!currentValues.startDate ||
    !!currentValues.endDate ||
    !!currentValues.budgetMin ||
    !!currentValues.budgetMax ||
    currentValues.shareAccommodation ||
    currentValues.shareTransport ||
    currentValues.shareTours;

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const params = new URLSearchParams();

      const planType = formData.get("plan_type") as string;
      if (planType && planType !== "all") params.set("plan_type", planType);

      const destinations = formData.get("destinations") as string;
      if (destinations) params.set("destinations", destinations);

      const startDate = formData.get("start_date") as string;
      if (startDate) params.set("start_date", startDate);

      const endDate = formData.get("end_date") as string;
      if (endDate) params.set("end_date", endDate);

      const budgetMin = formData.get("budget_min") as string;
      if (budgetMin) params.set("budget_min", budgetMin);

      const budgetMax = formData.get("budget_max") as string;
      if (budgetMax) params.set("budget_max", budgetMax);

      if (formData.get("share_accommodation") === "on") params.set("share_accommodation", "true");
      if (formData.get("share_transport") === "on") params.set("share_transport", "true");
      if (formData.get("share_tours") === "on") params.set("share_tours", "true");

      router.push(`/discover?${params.toString()}`);
    },
    [router]
  );

  const handleClear = useCallback(() => {
    router.push("/discover");
  }, [router]);

  return (
    <form
      onSubmit={handleSearch}
      className="border-2 border-neutral-black dark:border-neutral-gray rounded-[var(--radius)] bg-neutral-white dark:bg-neutral-light p-6 shadow-[var(--stroke-width)_var(--stroke-width)_0px_0px_rgba(25,25,25,1)]"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Plan Type */}
        <div className="space-y-2">
          <Label htmlFor="plan_type">Tipo de plan</Label>
          <Select name="plan_type" defaultValue={currentValues.planType || "all"}>
            <SelectTrigger id="plan_type" className="w-full">
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {PLAN_TYPES.map((pt) => (
                <SelectItem key={pt.value} value={pt.value}>
                  {pt.icon} {pt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Destinations */}
        <div className="space-y-2">
          <Label htmlFor="destinations">Destinos</Label>
          <Input
            id="destinations"
            name="destinations"
            type="text"
            placeholder="ej: Buenos Aires, Bariloche"
            defaultValue={currentValues.destinations}
          />
          <p className="text-xs text-neutral-gray">Separados por coma</p>
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <Label htmlFor="start_date">Desde</Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            defaultValue={currentValues.startDate}
          />
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <Label htmlFor="end_date">Hasta</Label>
          <Input
            id="end_date"
            name="end_date"
            type="date"
            defaultValue={currentValues.endDate}
          />
        </div>

        {/* Budget Min */}
        <div className="space-y-2">
          <Label htmlFor="budget_min">Presupuesto mínimo</Label>
          <Input
            id="budget_min"
            name="budget_min"
            type="number"
            placeholder="0"
            defaultValue={currentValues.budgetMin}
          />
        </div>

        {/* Budget Max */}
        <div className="space-y-2">
          <Label htmlFor="budget_max">Presupuesto máximo</Label>
          <Input
            id="budget_max"
            name="budget_max"
            type="number"
            placeholder="10000"
            defaultValue={currentValues.budgetMax}
          />
        </div>
      </div>

      {/* Share options */}
      <div className="mt-4 space-y-2">
        <Label>Opciones para compartir</Label>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <Checkbox
              id="share_accommodation"
              name="share_accommodation"
              defaultChecked={currentValues.shareAccommodation}
            />
            <Label htmlFor="share_accommodation" className="cursor-pointer font-normal">
              Compartir alojamiento
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="share_transport"
              name="share_transport"
              defaultChecked={currentValues.shareTransport}
            />
            <Label htmlFor="share_transport" className="cursor-pointer font-normal">
              Compartir transporte
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="share_tours"
              name="share_tours"
              defaultChecked={currentValues.shareTours}
            />
            <Label htmlFor="share_tours" className="cursor-pointer font-normal">
              Compartir excursiones
            </Label>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-6">
        <Button type="submit" variant="primary">
          <Search className="w-4 h-4" />
          Buscar
        </Button>
        {hasAnyFilter && (
          <Button type="button" variant="outline" onClick={handleClear}>
            <X className="w-4 h-4" />
            Limpiar filtros
          </Button>
        )}
      </div>
    </form>
  );
}
