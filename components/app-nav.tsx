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
    <nav className="w-full flex justify-center border-b border-border min-h-16 shrink-0">
      <div className="w-full max-w-5xl flex flex-col gap-3 p-3 px-5 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap gap-x-5 gap-y-2 items-center font-semibold">
          <Link
            href="/"
            className="font-heading text-xl text-primary dark:text-primary-light"
          >
            The Orange Mate
          </Link>
          <ChatNavLink />
          <NotificationBell />
        </div>
        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-4">
          <ThemeSwitcher />
          <AuthButton />
        </div>
      </div>
    </nav>
  );
}
