import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PlanForm } from "@/components/plan-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear Plan — The Orange Mate",
};

export default async function NewPlanPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return <PlanForm userId={data.user.id} />;
}
