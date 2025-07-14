import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-light dark:bg-neutral-gray">
      {/* Header */}
      <nav className="w-full bg-primary dark:bg-primary-dark px-4 py-3">
        <div className="w-full max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex gap-5 items-center">
            <h1 className="font-heading text-2xl text-white font-bold">
              THE ORANGE MATE
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <AuthButton />
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-md mx-auto w-full">
        {/* TOM Logo/Title */}
        <div className="text-center mb-8">
          <h2 className="text-8xl font-heading text-neutral-black dark:text-neutral-white font-bold mb-4">
            TOM
          </h2>
          <p className="text-2xl font-body text-neutral-gray dark:text-neutral-light">
            Conecta, Viaja, Ahorra.
          </p>
        </div>

        {/* Orange Card */}
        <div className="w-full bg-primary dark:bg-primary-light rounded-2xl p-8 mb-8 text-center shadow-lg">
          <h3 className="text-4xl font-heading text-white dark:text-neutral-black font-bold">
            The Orange Mate
          </h3>
        </div>

        {/* Description */}
        <div className="text-center mb-8">
          <p className="text-lg font-body text-neutral-black dark:text-neutral-white leading-relaxed">
            Encuentra compañeros de viaje para compartir alojamiento, transporte y experiencias inolvidables.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="w-full space-y-4 mb-8">
          <Button 
            asChild 
            className="w-full bg-accent hover:bg-accent-dark dark:bg-accent-light dark:hover:bg-accent text-white dark:text-neutral-black font-bold py-4 text-lg rounded-xl transition-colors"
          >
            <Link href="/auth/sign-up">
              ¡Empieza a Viajar!
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant="ghost" 
            className="w-full text-neutral-black dark:text-neutral-white hover:text-primary dark:hover:text-primary-light font-body text-base transition-colors"
          >
            <Link href="/auth/login">
              Ya tengo cuenta
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-gray dark:border-neutral-gray py-6">
        <div className="max-w-md mx-auto px-8">
          <div className="flex justify-center items-center gap-6 text-sm text-neutral-gray dark:text-neutral-light">
            <Link href="/demo" className="hover:text-primary dark:hover:text-primary-light transition-colors">
              Demo
            </Link>
            <span>|</span>
            <Link href="#" className="hover:text-primary dark:hover:text-primary-light transition-colors">
              Privacidad
            </Link>
            <span>|</span>
            <Link href="#" className="hover:text-primary dark:hover:text-primary-light transition-colors">
              Términos
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
