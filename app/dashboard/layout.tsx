import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-light dark:bg-neutral-gray">
      <nav className="w-full flex justify-center border-b border-neutral-gray dark:border-neutral-gray h-16">
        <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href={"/"} className="font-heading text-xl text-primary dark:text-primary-light">
              SoloTravelers
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <AuthButton />
          </div>
        </div>
      </nav>
      
      <div className="flex-1 flex flex-col items-center p-8">
        <div className="w-full max-w-6xl">
          {children}
        </div>
      </div>

      <footer className="w-full flex items-center justify-center border-t border-neutral-gray dark:border-neutral-gray mx-auto text-center text-xs gap-8 py-8">
        <p className="font-body text-neutral-gray dark:text-neutral-white">
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
    </main>
  );
} 