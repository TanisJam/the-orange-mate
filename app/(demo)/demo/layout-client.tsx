"use client";

import Link from "next/link";
import { DemoProvider } from "@/components/demo-provider";
import { DemoBanner } from "@/components/demo-banner";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Footer } from "@/components/footer";

/**
 * Client-side demo shell that mirrors the (app) route group layout but
 * without auth.  Wraps every `/demo/*` page in DemoProvider, shows the
 * demobar, and provides a demo-specific nav where all links stay within
 * the `/demo/*` zone.
 */
export function DemoLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider>
      <main className="min-h-screen flex flex-col bg-neutral-light dark:bg-background">
        {/* ── Nav bar (same visual style as AppNav) ────────────────────── */}
        <nav className="w-full flex justify-center border-b border-border min-h-16 shrink-0">
          <div className="w-full max-w-5xl flex flex-col gap-3 p-3 px-5 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-wrap gap-x-5 gap-y-2 items-center font-semibold">
              <Link
                href="/"
                className="font-heading text-xl text-primary dark:text-primary-light"
              >
                The Orange Mate
              </Link>
              <span className="text-muted-foreground dark:text-neutral-white select-none">
                / Demo
              </span>
            </div>
            <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-4">
              <ThemeSwitcher />
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium bg-primary text-white hover:bg-primary/90 dark:bg-primary-light dark:text-background dark:hover:bg-primary-light/90 transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>
        </nav>

        {/* ── Warning banner ───────────────────────────────────────────── */}
        <DemoBanner />

        {/* ── Content area ──────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col items-center p-8">
          <div className="w-full max-w-6xl">{children}</div>
        </div>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <Footer showAuthor showThemeSwitcher />
      </main>
    </DemoProvider>
  );
}
