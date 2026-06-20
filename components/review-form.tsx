"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarSelector } from "@/components/star-selector";
import { submitReview, editReview } from "@/lib/database-client";
import type { UserReview } from "@/lib/types";
import { Loader2 } from "lucide-react";

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
  const isEditing = !!existingReview;
  const [rating, setRating] = useState<number>(
    existingReview?.rating ?? 0,
  );
  const [comment, setComment] = useState<string>(
    existingReview?.comment ?? "",
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Por favor seleccioná una puntuación de al menos 1 estrella");
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        const updated = await editReview(
          existingReview.id,
          currentUserId,
          { rating, comment: comment || undefined },
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
          rating,
          comment: comment || undefined,
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border-2 border-neutral-black rounded-[var(--radius)] bg-neutral-white dark:bg-neutral-light">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-neutral-black dark:text-neutral-white">
          Tu puntuación:
        </span>
        <StarSelector
          value={rating}
          onChange={setRating}
          readonly={loading}
        />
      </div>

      <Textarea
        placeholder="Comentario (opcional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={loading}
        rows={3}
      />

      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEditing ? "Actualizar review" : "Enviar review"}
        </Button>
        {isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSubmitted}
            disabled={loading}
          >
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
}
