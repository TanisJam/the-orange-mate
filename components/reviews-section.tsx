"use client";

import { useState, useCallback } from "react";
import { StarSelector } from "@/components/star-selector";
import { ReviewForm } from "@/components/review-form";
import { ReviewCard } from "@/components/review-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star } from "lucide-react";
import type { UserReview } from "@/lib/types";
import { getPlanReviews, getUserReviews } from "@/lib/database-client";

interface ReviewableParticipant {
  id: string;
  full_name?: string;
  username?: string;
}

interface ReviewsSectionProps {
  reviews: UserReview[];
  average: { average: number; count: number };
  currentUserId: string;
  planId?: string;
  reviewedId?: string;
  canReview: boolean;
  reviewableParticipants?: ReviewableParticipant[];
}

export function ReviewsSection({
  reviews: initialReviews,
  average,
  currentUserId,
  planId,
  reviewedId,
  canReview,
  reviewableParticipants,
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<UserReview[]>(initialReviews);
  const [currentAverage, setCurrentAverage] = useState(average);
  const [selectedReviewTarget, setSelectedReviewTarget] = useState<string>("");

  const refreshReviews = useCallback(async () => {
    if (planId) {
      const updated = await getPlanReviews(planId);
      setReviews(updated);
      if (updated.length > 0) {
        const sum = updated.reduce((acc, r) => acc + r.rating, 0);
        setCurrentAverage({
          average: Math.round((sum / updated.length) * 10) / 10,
          count: updated.length,
        });
      } else {
        setCurrentAverage({ average: 0, count: 0 });
      }
    } else if (reviewedId) {
      const updated = await getUserReviews(reviewedId);
      setReviews(updated);
      if (updated.length > 0) {
        const sum = updated.reduce((acc, r) => acc + r.rating, 0);
        setCurrentAverage({
          average: Math.round((sum / updated.length) * 10) / 10,
          count: updated.length,
        });
      } else {
        setCurrentAverage({ average: 0, count: 0 });
      }
    }
  }, [planId, reviewedId]);

  const effectiveReviewedId = reviewedId || selectedReviewTarget;
  const showReviewForm = canReview && planId && effectiveReviewedId;
  const showParticipantSelector = canReview && planId && !reviewedId && reviewableParticipants && reviewableParticipants.length > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Star className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-neutral-black dark:text-neutral-white">
          Reviews
        </h3>
        <div className="flex items-center gap-2">
          <StarSelector value={Math.min(5, Math.max(0, Math.floor(currentAverage.average)))} readonly size="sm" />
          <span className="text-sm font-semibold text-neutral-black dark:text-neutral-white">
            {currentAverage.average}
          </span>
          <span className="text-sm text-muted-foreground">
            — {currentAverage.count} review{currentAverage.count !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Participant selector (plan detail: choose who to review) */}
      {showParticipantSelector && (
        <div className="max-w-xs">
          <Select value={selectedReviewTarget} onValueChange={setSelectedReviewTarget}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccioná un participante para evaluar" />
            </SelectTrigger>
            <SelectContent>
              {reviewableParticipants!.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.full_name || p.username || p.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Review form */}
      {showReviewForm && (
        <ReviewForm
          planId={planId!}
          reviewedId={effectiveReviewedId!}
          currentUserId={currentUserId}
          onSubmitted={refreshReviews}
        />
      )}

      {/* Review list */}
      {reviews.length === 0 ? (
        <p className="text-muted-foreground text-center py-6">
          No hay reviews todavía
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              onEdited={refreshReviews}
            />
          ))}
        </div>
      )}
    </div>
  );
}
