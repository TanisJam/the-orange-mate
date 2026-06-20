"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { INTERNAL_NAV_KEY } from "@/components/back-button";

/**
 * Conditional content area for the (app) shell.
 * - /messages*: full-height, no footer, no max-width wrapper (chat is a
 *   full-screen experience).
 * - everything else: centered max-w-6xl content + marketing footer.
 */
export function AppShellBody({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullscreen = pathname?.startsWith("/messages") ?? false;

  // Mark that an in-app client navigation has happened this session, so
  // BackButton knows router.back() will land on an in-app page (not leave the
  // app). The initial mount is skipped — only subsequent route changes count.
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    try {
      sessionStorage.setItem(INTERNAL_NAV_KEY, "1");
    } catch {
      // sessionStorage unavailable (privacy mode) — fall back to explicit href
    }
  }, [pathname]);

  if (isFullscreen) {
    return <div className="flex-1 flex flex-col min-h-0">{children}</div>;
  }

  return (
    <>
      <div className="flex-1 flex flex-col items-center p-8">
        <div className="w-full max-w-6xl">{children}</div>
      </div>
      <footer className="w-full flex items-center justify-center border-t border-border mx-auto text-center text-xs gap-8 py-8">
        <p className="font-body text-muted-foreground">
          Built with{" "}
          <a
            href="https://supabase.com"
            target="_blank"
            className="font-bold hover:underline text-primary dark:text-primary-light"
            rel="noreferrer"
          >
            Supabase
          </a>
          {" & "}
          <a
            href="https://nextjs.org"
            target="_blank"
            className="font-bold hover:underline text-primary dark:text-primary-light"
            rel="noreferrer"
          >
            Next.js
          </a>
        </p>
        <ThemeSwitcher />
      </footer>
    </>
  );
}
