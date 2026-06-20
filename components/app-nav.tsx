import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import ChatNavLink from "@/components/chat-nav-link";
import NotificationBell from "@/components/notification-bell";
import Link from "next/link";

/**
 * Shared top navigation for all authenticated screens. Used by the (app)
 * route group layout so every screen — including messages — has the same nav.
 */
export function AppNav() {
  return (
    <nav className="w-full flex justify-center border-b border-border h-16 shrink-0">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-5 items-center font-semibold">
          <Link
            href="/dashboard"
            className="font-heading text-xl text-primary dark:text-primary-light"
          >
            The Orange Mate
          </Link>
          <ChatNavLink />
          <NotificationBell />
        </div>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <AuthButton />
        </div>
      </div>
    </nav>
  );
}
