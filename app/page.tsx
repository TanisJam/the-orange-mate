import { AuthButton } from "@/components/auth-button";
import { Footer } from "@/components/footer";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-light dark:bg-background">
      {/* Header */}
      <nav className="w-full bg-primary dark:bg-primary-dark px-4 py-3">
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 gap-5 items-center">
            <h1 className="font-heading text-xl sm:text-2xl text-white font-bold leading-none">
              THE ORANGE MATE
            </h1>
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-4">
            <ThemeSwitcher />
            <AuthButton />
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-md mx-auto w-full">
        {/* The Orange Mate Logo/Title */}
        <div className="text-center mb-8">
          <h2 className="text-6xl font-heading text-neutral-black dark:text-neutral-white font-bold mb-4">
            The Orange Mate
          </h2>
          <p className="text-2xl font-body text-muted-foreground dark:text-neutral-light">
            Conecta, Viaja, Comparte.
          </p>
        </div>

        {/* Orange Card — brutalist surface: black border + hard offset shadow */}
        <div className="w-full bg-primary dark:bg-primary-light rounded-[var(--radius)] border-2 border-ink shadow-[var(--stroke-width)_var(--stroke-width)_0px_0px_hsl(var(--ink))] p-8 mb-8 text-center">
          <h3 className="text-2xl font-heading text-white dark:text-neutral-black font-bold flex items-center justify-center gap-2">
            <Globe className="size-6 shrink-0" aria-hidden="true" />
            Tu compañero de viajes ideal te está esperando
          </h3>
        </div>

        {/* Description */}
        <div className="text-center mb-8">
          <p className="text-lg font-body text-neutral-black dark:text-neutral-white leading-relaxed">
            Descubre compañeros de viaje, comparte gastos de alojamiento y transporte, y vive experiencias increíbles junto a personas que comparten tu pasión por explorar el mundo.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="w-full space-y-4 mb-8">
          <Button asChild variant="accent" size="lg" className="w-full font-bold">
            <Link href="/dashboard">
              ¡Empieza a Viajar!
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant="ghost" 
            className="w-full text-neutral-black dark:text-neutral-white hover:text-primary dark:hover:text-primary-light font-body text-base transition-colors"
          >
            <Link href="/dashboard">
              Explorar Planes
            </Link>
          </Button>
        </div>
      </div>

      <Footer showLinks showAuthor />
    </main>
  );
}
