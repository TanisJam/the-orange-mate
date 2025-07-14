import { DesignSystemDemo } from "@/components/design-system-demo";
import { ButtonDemo } from "@/components/button-demo";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";

export default function DemoPage() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-light dark:bg-neutral-gray">
      <nav className="w-full flex justify-center border-b border-neutral-gray dark:border-neutral-gray h-16">
        <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href={"/"} className="font-heading text-xl text-primary dark:text-primary-light">
              The Orange Mate
            </Link>
            <span className="text-neutral-gray dark:text-neutral-white">/ Demo</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <AuthButton />
          </div>
        </div>
      </nav>
      
      <div className="flex-1 flex flex-col items-center p-8">
        <div className="max-w-4xl w-full text-center space-y-8 mb-12">
          <h1 className="text-4xl font-heading text-primary dark:text-primary-light">
            Design System Demo
          </h1>
          <p className="text-lg font-body text-neutral-gray dark:text-neutral-white max-w-2xl mx-auto">
            Explora los componentes y elementos del sistema de diseño de The Orange Mate.
          </p>
        </div>

        <div className="w-full max-w-6xl space-y-12">
          <section>
            <DesignSystemDemo />
          </section>

          <section>
            <ButtonDemo />
          </section>
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