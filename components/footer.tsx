import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";

interface FooterProps {
  /** "by TanisJam" author line */
  showAuthor?: boolean;
  /** Demo / Privacidad / Términos navigation links */
  showLinks?: boolean;
  /** ThemeSwitcher toggle */
  showThemeSwitcher?: boolean;
}

export function Footer({
  showAuthor = false,
  showLinks = false,
  showThemeSwitcher = false,
}: FooterProps) {
  return (
    <footer className="w-full border-t border-border py-6 px-4">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-muted-foreground">
        {showLinks && (
          <>
            <Link
              href="/demo"
              className="font-body hover:text-primary dark:hover:text-primary-light transition-colors"
            >
              Demo
            </Link>
            <span aria-hidden="true">|</span>
            <Link
              href="#"
              className="font-body hover:text-primary dark:hover:text-primary-light transition-colors"
            >
              Privacidad
            </Link>
            <span aria-hidden="true">|</span>
            <Link
              href="#"
              className="font-body hover:text-primary dark:hover:text-primary-light transition-colors"
            >
              Términos
            </Link>
          </>
        )}

        {showAuthor && (
          <span className="font-body">
            by{" "}
            <a
              href="https://github.com/TanisJam"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline text-primary dark:text-primary-light"
            >
              TanisJam
            </a>
          </span>
        )}

        {showThemeSwitcher && <ThemeSwitcher />}
      </div>
    </footer>
  );
}
