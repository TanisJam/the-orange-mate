import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { DesignSystemDemo } from "@/components/design-system-demo";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href={"/"} className="font-heading text-xl text-primary">
              The Orange Mate
            </Link>
          </div>
          <AuthButton />
        </div>
      </nav>
      
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-4xl w-full text-center space-y-8">
          <h1 className="text-6xl font-heading text-primary">
            Welcome to The Orange Mate
          </h1>
          <p className="text-xl font-body text-neutral-gray max-w-2xl mx-auto">
            A modern Next.js application with Supabase authentication and a beautiful design system.
          </p>
        </div>
      </div>

      <section className="w-full max-w-6xl mx-auto">
        <DesignSystemDemo />
      </section>

      <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-8">
        <p className="font-body text-neutral-gray">
          Built with{" "}
          <a
            href="https://supabase.com"
            target="_blank"
            className="font-bold hover:underline text-primary"
            rel="noreferrer"
          >
            Supabase
          </a>
          {" & "}
          <a
            href="https://nextjs.org"
            target="_blank"
            className="font-bold hover:underline text-primary"
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
