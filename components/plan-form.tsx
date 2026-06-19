"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { createTravelPlan } from "@/lib/database-client";
import type { PlanType } from "@/lib/types";
import { PLAN_TYPES, CURRENCIES } from "@/lib/types";
import { MapPin, Calendar, Users, DollarSign, Share2 } from "lucide-react";

interface PlanFormProps {
  userId: string;
}

interface FormErrors {
  title?: string;
  plan_type?: string;
  destinations?: string;
  start_date?: string;
  end_date?: string;
  max_participants?: string;
  budget_range_min?: string;
  budget_range_max?: string;
  currency?: string;
}

export function PlanForm({ userId }: PlanFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [planType, setPlanType] = useState<PlanType>("viaje_completo");
  const [destinations, setDestinations] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [flexibleDates, setFlexibleDates] = useState(false);
  const [description, setDescription] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("1");
  const [shareAccommodation, setShareAccommodation] = useState(false);
  const [shareTransport, setShareTransport] = useState(false);
  const [shareTours, setShareTours] = useState(false);
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [currency, setCurrency] = useState("USD");

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = "El título es obligatorio";
    }

    const parsedDestinations = destinations
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);
    if (parsedDestinations.length === 0) {
      newErrors.destinations = "Al menos un destino es obligatorio";
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      newErrors.end_date = "La fecha de fin debe ser posterior a la de inicio";
    }

    const max = parseInt(maxParticipants, 10);
    if (isNaN(max) || max < 1) {
      newErrors.max_participants = "Debe ser al menos 1";
    }

    const bMin = budgetMin ? parseFloat(budgetMin) : null;
    const bMax = budgetMax ? parseFloat(budgetMax) : null;
    if (bMin !== null && isNaN(bMin)) {
      newErrors.budget_range_min = "Debe ser un número válido";
    }
    if (bMax !== null && isNaN(bMax)) {
      newErrors.budget_range_max = "Debe ser un número válido";
    }
    if (bMin !== null && bMax !== null && bMin > bMax) {
      newErrors.budget_range_max = "El máximo debe ser mayor o igual al mínimo";
    }

    if (!currency.trim()) {
      newErrors.currency = "La moneda es obligatoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const plan = await createTravelPlan(userId, {
        title: title.trim(),
        plan_type: planType,
        destinations: destinations
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean),
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        flexible_dates: flexibleDates,
        description: description.trim() || undefined,
        max_participants: parseInt(maxParticipants, 10),
        share_accommodation: shareAccommodation,
        share_transport: shareTransport,
        share_tours: shareTours,
        budget_range_min: budgetMin ? parseFloat(budgetMin) : undefined,
        budget_range_max: budgetMax ? parseFloat(budgetMax) : undefined,
        currency: currency.trim() || "USD",
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
    } finally {
      setLoading(false);
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
          <CardDescription className="font-body text-neutral-gray dark:text-neutral-white">
            Completa los detalles de tu plan de viaje para conectar con otros viajeros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Viaje a la Patagonia"
                />
                {errors.title && (
                  <p className="text-sm text-error mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <Label htmlFor="plan_type">Tipo de Plan</Label>
                <Select value={planType} onValueChange={(v) => setPlanType(v as PlanType)}>
                  <SelectTrigger id="plan_type">
                    <SelectValue placeholder="Selecciona el tipo de plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLAN_TYPES.map((pt) => (
                      <SelectItem key={pt.value} value={pt.value}>
                        {pt.icon} {pt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="destinations">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Destinos *
                  </span>
                </Label>
                <Input
                  id="destinations"
                  value={destinations}
                  onChange={(e) => setDestinations(e.target.value)}
                  placeholder="Separados por coma: Bariloche, El Calafate"
                />
                {errors.destinations && (
                  <p className="text-sm text-error mt-1">{errors.destinations}</p>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-4">
              <h3 className="font-heading text-lg flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fechas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Fecha de inicio</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">Fecha de fin</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  {errors.end_date && (
                    <p className="text-sm text-error mt-1">{errors.end_date}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="flexible_dates"
                  checked={flexibleDates}
                  onCheckedChange={(checked) => setFlexibleDates(checked === true)}
                />
                <Label
                  htmlFor="flexible_dates"
                  className="text-sm font-normal cursor-pointer"
                >
                  Fechas flexibles
                </Label>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe tu plan: qué actividades harás, qué tipo de compañero buscas..."
                rows={4}
              />
            </div>

            {/* Participants */}
            <div className="space-y-4">
              <h3 className="font-heading text-lg flex items-center gap-2">
                <Users className="w-4 h-4" />
                Participantes
              </h3>

              <div>
                <Label htmlFor="max_participants">Máximo de participantes</Label>
                <Input
                  id="max_participants"
                  type="number"
                  min="1"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                />
                {errors.max_participants && (
                  <p className="text-sm text-error mt-1">{errors.max_participants}</p>
                )}
              </div>
            </div>

            {/* Sharing Options */}
            <div className="space-y-3">
              <h3 className="font-heading text-lg flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Compartir
              </h3>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="share_accommodation"
                  checked={shareAccommodation}
                  onCheckedChange={(checked) => setShareAccommodation(checked === true)}
                />
                <Label
                  htmlFor="share_accommodation"
                  className="text-sm font-normal cursor-pointer"
                >
                  Compartir alojamiento
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="share_transport"
                  checked={shareTransport}
                  onCheckedChange={(checked) => setShareTransport(checked === true)}
                />
                <Label
                  htmlFor="share_transport"
                  className="text-sm font-normal cursor-pointer"
                >
                  Compartir transporte
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="share_tours"
                  checked={shareTours}
                  onCheckedChange={(checked) => setShareTours(checked === true)}
                />
                <Label
                  htmlFor="share_tours"
                  className="text-sm font-normal cursor-pointer"
                >
                  Compartir tours / actividades
                </Label>
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-4">
              <h3 className="font-heading text-lg flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Presupuesto
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget_min">Presupuesto mínimo</Label>
                  <Input
                    id="budget_min"
                    type="number"
                    min="0"
                    step="0.01"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    placeholder="0"
                  />
                  {errors.budget_range_min && (
                    <p className="text-sm text-error mt-1">{errors.budget_range_min}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="budget_max">Presupuesto máximo</Label>
                  <Input
                    id="budget_max"
                    type="number"
                    min="0"
                    step="0.01"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    placeholder="0"
                  />
                  {errors.budget_range_max && (
                    <p className="text-sm text-error mt-1">{errors.budget_range_max}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="currency">Moneda</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Selecciona moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.currency && (
                  <p className="text-sm text-error mt-1">{errors.currency}</p>
                )}
              </div>
            </div>

            {/* Submit Error */}
            {submitError && (
              <div className="p-3 border-2 border-error bg-error/10 rounded-[--radius]">
                <p className="text-sm text-error">{submitError}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t-2 border-neutral-black dark:border-neutral-gray">
              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                className="px-8"
              >
                {loading ? "Creando plan..." : "Crear Plan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
