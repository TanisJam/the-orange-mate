import { DesignSystemDemo } from "@/components/design-system-demo";
import { ButtonDemo } from "@/components/button-demo";
import { AuthButton } from "@/components/auth-button";
import { Footer } from "@/components/footer";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";

export default function DemoPage() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-light dark:bg-background">
      <nav className="w-full flex justify-center border-b border-neutral-gray dark:border-neutral-gray min-h-16">
        <div className="w-full max-w-5xl flex flex-col gap-3 p-3 px-5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap gap-x-5 gap-y-1 items-center font-semibold">
            <Link href={"/"} className="font-heading text-xl text-primary dark:text-primary-light">
              The Orange Mate
            </Link>
            <span className="text-muted-foreground dark:text-neutral-white">/ Demo</span>
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-4">
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
          <p className="text-lg font-body text-muted-foreground dark:text-neutral-white max-w-2xl mx-auto">
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

      <Footer showThemeSwitcher />
    </main>
  );
} 
