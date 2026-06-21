import type { Metadata } from "next";
import { DemoLayoutClient } from "./layout-client";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Route-group layout for every `/demo/*` page.
 *
 * - Injects `<meta name="robots" content="noindex, nofollow">` via Next.js
 *   Metadata API (inherited by all child pages).
 * - Delegates rendering to the client shell which wraps children in
 *   `DemoProvider`, the demo nav, the warning banner, and the footer.
 */
export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DemoLayoutClient>{children}</DemoLayoutClient>;
}
