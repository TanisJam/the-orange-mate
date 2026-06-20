"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Hybrid back navigation: if there is in-app history, go back so the user
 * returns exactly where they came from; otherwise (deep link / fresh tab)
 * fall back to an explicit, predictable destination.
 */
export function useBackNavigation(fallbackHref: string = "/dashboard") {
  const router = useRouter();
  return useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }, [router, fallbackHref]);
}

interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
  className?: string;
}

export function BackButton({
  fallbackHref = "/dashboard",
  label = "Volver",
  className,
}: BackButtonProps) {
  const goBack = useBackNavigation(fallbackHref);

  return (
    <button
      type="button"
      onClick={goBack}
      className={cn(
        "inline-flex items-center gap-1 text-sm font-body text-muted-foreground hover:text-neutral-black dark:hover:text-neutral-white transition-colors cursor-pointer",
        className,
      )}
    >
      <ArrowLeft className="size-4" />
      {label}
    </button>
  );
}
