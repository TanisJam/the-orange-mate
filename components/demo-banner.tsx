"use client";

import { useState } from "react";
import { useDemo } from "@/components/demo-provider";
import Link from "next/link";

const STORAGE_KEY = "demo-banner-dismissed";

/**
 * Fixed-position amber banner shown on all `/demo/*` routes.
 *
 * Warns that real-time features are disabled and offers a "Sign up" CTA.
 * Dismissible via localStorage — once dismissed, the banner stays hidden
 * until the user clears their browser storage.
 */
export function DemoBanner() {
  const { isDemo } = useDemo();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  if (!isDemo || dismissed) return null;

  return (
    <div
      role="alert"
      className="sticky top-0 z-40 bg-amber-100 dark:bg-amber-950 border-b border-amber-300 dark:border-amber-800 px-4 py-2.5 flex items-center justify-between"
    >
      <div className="flex items-center gap-2 text-sm text-amber-900 dark:text-amber-200">
        <span aria-hidden="true" className="select-none">⚠️</span>
        <span className="font-body">
          Demo mode: real-time features are disabled.{" "}
          <Link
            href="/auth/sign-up"
            className="underline font-medium hover:text-amber-950 dark:hover:text-amber-50 transition-colors"
          >
            Sign up
          </Link>{" "}
          to connect with real travelers.
        </span>
      </div>
      <button
        type="button"
        onClick={() => {
          setDismissed(true);
          try {
            localStorage.setItem(STORAGE_KEY, "true");
          } catch {
            // localStorage unavailable (private browsing) — fine, just hide for the session
          }
        }}
        className="shrink-0 ml-3 text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
        aria-label="Dismiss demo banner"
      >
        ✕
      </button>
    </div>
  );
}
