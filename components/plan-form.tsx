"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useDemo } from "@/components/demo-provider";
import { Button } from "@/components/ui/button";
import { useBackNavigation } from "@/components/back-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createTravelPlan } from "@/lib/database-client";
import type { PlanType } from "@/lib/types";
import { PLAN_TYPES, CURRENCIES } from "@/lib/types";
import { MapPin, Calendar, Users, DollarSign, Share2 } from "lucide-react";

const planSchema = z
  .object({
    title: z.string().min(1, "El título es obligatorio"),
    plan_type: z.enum(
      ["alojamiento", "actividad", "viaje_completo", "transporte", "salida_local"],
      { message: "El tipo de plan es obligatorio" }
    ),
    destinations: z
      .string()
      .min(1, "Al menos un destino es obligatorio")
      .refine(
        (val) => val.split(",").map((d) => d.trim()).filter(Boolean).length > 0,
        { message: "Al menos un destino es obligatorio" }
      ),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    flexible_dates: z.boolean(),
    description: z.string().optional(),
    max_participants: z
      .string()
      .min(1, "Debe ser al menos 1")
      .refine((v) => {
        const n = Number(v);
        return Number.isInteger(n) && n >= 1;
      }, "Debe ser un número entero mayor o igual a 1"),
    share_accommodation: z.boolean(),
    share_transport: z.boolean(),
    share_tours: z.boolean(),
    budget_range_min: z
      .string()
      .optional()
      .refine((v) => !v || Number(v) >= 0, "Debe ser mayor o igual a 0"),
    budget_range_max: z
      .string()
      .optional()
      .refine((v) => !v || Number(v) >= 0, "Debe ser mayor o igual a 0"),
    currency: z.string().min(1, "La moneda es obligatoria"),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return new Date(data.end_date) >= new Date(data.start_date);
      }
      return true;
    },
    {
      message: "La fecha de fin debe ser posterior a la de inicio",
      path: ["end_date"],
    }
  )
  .refine(
    (data) => {
      if (data.budget_range_min && data.budget_range_max) {
        return Number(data.budget_range_max) >= Number(data.budget_range_min);
      }
      return true;
    },
    {
      message: "El máximo debe ser mayor o igual al mínimo",
      path: ["budget_range_max"],
    }
  );

type PlanValues = z.infer<typeof planSchema>;

interface PlanFormProps {
  userId: string;
}

export function PlanForm({ userId }: PlanFormProps) {
  const router = useRouter();
  const { isDemo, createPlan } = useDemo();
  const goBack = useBackNavigation(isDemo ? "/demo/dashboard" : "/dashboard");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<PlanValues>({
    resolver: zodResolver(planSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      plan_type: "viaje_completo" as PlanType,
      destinations: "",
      start_date: "",
      end_date: "",
      flexible_dates: false,
      description: "",
      max_participants: "1",
      share_accommodation: false,
      share_transport: false,
      share_tours: false,
      budget_range_min: "",
      budget_range_max: "",
      currency: "USD",
    },
  });

  const onSubmit = async (values: PlanValues) => {
    setSubmitError(null);

    // ── Demo mode: simulate plan creation via in-memory store ────────
    if (isDemo) {
      try {
        const plan = createPlan({
          title: values.title.trim(),
          plan_type: values.plan_type,
          destinations: values.destinations
            .split(",")
            .map((d) => d.trim())
            .filter(Boolean),
          start_date: values.start_date || undefined,
          end_date: values.end_date || undefined,
          flexible_dates: values.flexible_dates,
          description: values.description?.trim() || undefined,
          max_participants: Number(values.max_participants),
          share_accommodation: values.share_accommodation,
          share_transport: values.share_transport,
          share_tours: values.share_tours,
          budget_range_min: values.budget_range_min
            ? Number(values.budget_range_min)
            : undefined,
          budget_range_max: values.budget_range_max
            ? Number(values.budget_range_max)
            : undefined,
          currency: values.currency.trim() || "USD",
          is_public: false,
          comments_enabled: true,
        });
        toast.success("Demo mode: plan created!");
        router.push(`/demo/plans/${plan.id}`);
      } catch {
        setSubmitError("Error al simular la creación del plan.");
      }
      return;
    }

    // ── Real mode: call Supabase ─────────────────────────────────────
    try {
      const plan = await createTravelPlan(userId, {
        title: values.title.trim(),
        plan_type: values.plan_type,
        destinations: values.destinations
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean),
        start_date: values.start_date || undefined,
        end_date: values.end_date || undefined,
        flexible_dates: values.flexible_dates,
        description: values.description?.trim() || undefined,
        max_participants: Number(values.max_participants),
        share_accommodation: values.share_accommodation,
        share_transport: values.share_transport,
        share_tours: values.share_tours,
        budget_range_min: values.budget_range_min
          ? Number(values.budget_range_min)
          : undefined,
        budget_range_max: values.budget_range_max
          ? Number(values.budget_range_max)
          : undefined,
        currency: values.currency.trim() || "USD",
        is_public: false,
        comments_enabled: true,
      });

      if (plan) {
        router.push(`/plans/${plan.id}`);
      } else {
        setSubmitError("Error al crear el plan. Inténtalo de nuevo.");
      }
    } catch {
      setSubmitError("Error inesperado al crear el plan. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-primary dark:text-primary-light">
            <MapPin className="w-5 h-5" />
            Crear Nuevo Plan
          </CardTitle>
          <CardDescription className="font-body text-muted-foreground dark:text-neutral-white">
            Completa los detalles de tu plan de viaje para conectar con otros viajeros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Viaje a la Patagonia"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="plan_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Plan</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el tipo de plan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PLAN_TYPES.map((pt) => (
                            <SelectItem key={pt.value} value={pt.value}>
                              {pt.icon} {pt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="destinations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          Destinos *
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Separados por coma: Bariloche, El Calafate"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Dates */}
              <div className="space-y-4">
                <h3 className="font-heading text-lg flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Fechas
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de inicio</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de fin</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="flexible_dates"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          Fechas flexibles
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe tu plan: qué actividades harás, qué tipo de compañero buscas..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Participants */}
              <div className="space-y-4">
                <h3 className="font-heading text-lg flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Participantes
                </h3>

                <FormField
                  control={form.control}
                  name="max_participants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máximo de participantes</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Sharing Options */}
              <div className="space-y-3">
                <h3 className="font-heading text-lg flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Compartir
                </h3>

                <FormField
                  control={form.control}
                  name="share_accommodation"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          Compartir alojamiento
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="share_transport"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          Compartir transporte
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="share_tours"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          Compartir tours / actividades
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Budget */}
              <div className="space-y-4">
                <h3 className="font-heading text-lg flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Presupuesto
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="budget_range_min"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Presupuesto mínimo</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="budget_range_max"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Presupuesto máximo</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moneda</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona moneda" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CURRENCIES.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Error */}
              {submitError && (
                <div
                  className="p-3 border-2 border-error bg-error/10 rounded-[--radius]"
                  role="alert"
                  aria-live="polite"
                >
                  <p className="text-sm text-error">{submitError}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t-2 border-ink dark:border-neutral-gray">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBack}
                  disabled={form.formState.isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  variant="primary"
                  className="px-8"
                >
                  {form.formState.isSubmitting ? "Creando plan..." : "Crear Plan"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
