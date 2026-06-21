"use client";

import { useDemo } from "@/components/demo-provider";
import { PlanForm } from "@/components/plan-form";

const demoInitialValues = {
  title: "Aventura en la Patagonia",
  plan_type: "viaje_completo" as const,
  destinations: "Bariloche, El Calafate, Ushuaia",
  start_date: "2026-08-15",
  end_date: "2026-08-30",
  flexible_dates: true,
  description:
    "Recorrido de 15 días por el sur argentino. Trekking, glaciares y la ruta más austral del mundo. Ideal para amantes de la naturaleza y la fotografía.",
  max_participants: "4",
  share_accommodation: true,
  share_transport: true,
  share_tours: false,
  budget_range_min: "800",
  budget_range_max: "2000",
  currency: "USD",
};

/**
 * Demo plan creation page with pre-filled form so users can explore
 * without typing. All fields remain editable.
 */
export default function DemoNewPlanPage() {
  const { demoUser } = useDemo();

  return <PlanForm userId={demoUser.id} initialValues={demoInitialValues} />;
}
