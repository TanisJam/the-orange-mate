"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * sessionStorage flag set by AppShellBody after the first in-app client
 * navigation. Its presence means the previous history entry is an in-app page,
 * so router.back() is safe and won't leave the app.
 */
export const INTERNAL_NAV_KEY = "app:internalNav";

/**
 * Hybrid back navigation:
 * - If the user has navigated within the app this session (so the previous
 *   history entry is an in-app page), go back to return exactly where they
 *   came from.
 * - Otherwise (deep link, fresh tab, or arriving from another origin), go to
 *   an explicit, predictable fallback instead of risking leaving the app.
 */
export function useBackNavigation(fallbackHref: string = "/dashboard") {
  const router = useRouter();
  return useCallback(() => {
    let hasInternalHistory = false;
    try {
      hasInternalHistory = sessionStorage.getItem(INTERNAL_NAV_KEY) === "1";
    } catch {
      hasInternalHistory = false;
    }

    if (hasInternalHistory && window.history.length > 1) {
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
