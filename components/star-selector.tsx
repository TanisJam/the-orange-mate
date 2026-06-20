"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarSelectorProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md";
}

export function StarSelector({
  value,
  onChange,
  readonly = false,
  size = "md",
}: StarSelectorProps) {
  const [hovered, setHovered] = useState<number>(0);
  const displayRating = readonly ? value : (hovered || value);

  const iconSize = size === "sm" ? "w-4 h-4" : "w-6 h-6";

  return (
    <div
      className="flex items-center gap-0.5"
      onMouseLeave={() => !readonly && setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= displayRating;

        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            className={cn(
              "transition-colors",
              readonly ? "cursor-default" : "cursor-pointer",
            )}
            onMouseEnter={() => !readonly && setHovered(star)}
            onClick={() => {
              if (!readonly && onChange) {
                onChange(star);
              }
            }}
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                iconSize,
                filled
                  ? "fill-primary text-primary"
                  : "text-muted-foreground/40 dark:text-muted-foreground/60",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
