"use client";

import { useState } from "react";
import Link from "next/link";
import { StarSelector } from "@/components/star-selector";
import { ReviewForm } from "@/components/review-form";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/components/demo-provider";
import type { UserReview } from "@/lib/types";
import { Pencil } from "lucide-react";

interface ReviewCardProps {
  review: UserReview;
  currentUserId: string;
  onEdited: () => void;
}

export function ReviewCard({
  review,
  currentUserId,
  onEdited,
}: ReviewCardProps) {
  const { isDemo } = useDemo();
  const [editing, setEditing] = useState(false);
  const isOwnReview = review.reviewer_id === currentUserId;

  const reviewerName =
    review.reviewer?.full_name ||
    review.reviewer?.username ||
    "Usuario";
  const reviewerUsername =
    review.reviewer?.username || review.reviewer_id;
  const profilePath = isDemo
    ? `/demo/profile/${reviewerUsername}`
    : `/profile/${reviewerUsername}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (editing) {
    return (
      <div className="p-4 rounded-[var(--radius)] border-2 border-ink bg-card">
        <ReviewForm
          planId={review.plan_id}
          reviewedId={review.reviewed_id}
          currentUserId={currentUserId}
          existingReview={review}
          onSubmitted={() => {
            setEditing(false);
            onEdited();
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex gap-4 p-4 rounded-[var(--radius)] border-2 border-ink bg-card shadow-[2px_2px_0px_0px_hsl(var(--ink))]">
      {/* Avatar */}
      <div className="shrink-0">
        <div className="w-10 h-10 rounded-full border-2 border-ink bg-secondary/20 flex items-center justify-center overflow-hidden">
          {review.reviewer?.avatar_url ? (
            <img
              src={review.reviewer.avatar_url}
              alt={reviewerName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-bold text-secondary">
              {reviewerName[0]}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href={profilePath}
              className="font-semibold text-sm text-neutral-black dark:text-neutral-white hover:underline truncate"
            >
              {reviewerName}
            </Link>
            <StarSelector value={review.rating} readonly size="sm" />
          </div>

          {isOwnReview && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(true)}
              className="shrink-0"
              aria-label="Editar review"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          )}
        </div>

        {review.comment && (
          <p className="text-sm text-muted-foreground dark:text-neutral-white whitespace-pre-wrap">
            {review.comment}
          </p>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatDate(review.created_at)}</span>
          {review.edited_at && (
            <span className="italic text-muted-foreground/70">
              (editado)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
