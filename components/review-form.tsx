"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { StarSelector } from "@/components/star-selector";
import { submitReview, editReview } from "@/lib/database-client";
import { useDemo } from "@/components/demo-provider";
import type { UserReview } from "@/lib/types";
import { Loader2 } from "lucide-react";

const reviewSchema = z.object({
  rating: z.number().min(1, "Selecciona una calificación de al menos 1 estrella"),
  comment: z.string().optional(),
});

type ReviewValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  planId: string;
  reviewedId: string;
  currentUserId: string;
  onSubmitted: () => void;
  existingReview?: UserReview;
}

export function ReviewForm({
  planId,
  reviewedId,
  currentUserId,
  onSubmitted,
  existingReview,
}: ReviewFormProps) {
  const { isDemo, submitReview: demoSimSubmit } = useDemo();
  const isEditing = !!existingReview;
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    mode: "onTouched",
    defaultValues: {
      rating: existingReview?.rating ?? 0,
      comment: existingReview?.comment ?? "",
    },
  });

  const onSubmit = async (values: ReviewValues) => {
    setError(null);
    try {
      // ── Demo mode: simulate via demoStore ───────────────────────────
      if (isDemo) {
        if (isEditing) {
          // Demo mode doesn't support editing — show toast instead
          toast.success("Demo mode: review actualizada (simulado)");
          onSubmitted();
        } else {
          const created = demoSimSubmit({
            plan_id: planId,
            reviewed_id: reviewedId,
            rating: values.rating,
            comment: values.comment || undefined,
          });
          if (created) {
            toast.success("Demo mode: review enviada");
            onSubmitted();
          } else {
            toast.error("No se pudo enviar la review");
          }
        }
        return;
      }

      // ── Real mode: call Supabase ────────────────────────────────────
      if (isEditing) {
        const updated = await editReview(
          existingReview.id,
          currentUserId,
          { rating: values.rating, comment: values.comment || undefined },
        );
        if (updated) {
          toast.success("Review actualizada");
          onSubmitted();
        } else {
          toast.error("No se pudo actualizar la review");
        }
      } else {
        const created = await submitReview(currentUserId, {
          plan_id: planId,
          reviewed_id: reviewedId,
          rating: values.rating,
          comment: values.comment || undefined,
        });
        if (created) {
          toast.success("Review enviada");
          onSubmitted();
        } else {
          toast.error("No se pudo enviar la review");
        }
      }
    } catch {
      toast.error("Error al procesar la review");
    }
  };

  return (
    <div className="space-y-4 p-4 border-2 border-ink rounded-[var(--radius)] bg-card">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-neutral-black dark:text-neutral-white">
                    Tu puntuación:
                  </span>
                  <FormControl>
                    <StarSelector
                      value={field.value}
                      onChange={field.onChange}
                      readonly={form.formState.isSubmitting}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Comentario (opcional)"
                    disabled={form.formState.isSubmitting}
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <p
              className="text-sm font-body text-error"
              role="alert"
              aria-live="polite"
            >
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditing ? "Actualizar review" : "Enviar review"}
            </Button>
            {isEditing && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onSubmitted}
                disabled={form.formState.isSubmitting}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
