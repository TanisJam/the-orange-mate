import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InfoIcon } from "lucide-react";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-heading text-primary dark:text-primary-light">Panel de Control</h1>
        <p className="text-lg font-body text-neutral-gray dark:text-neutral-white">
          ¡Bienvenido a tu área protegida! Esta página solo es accesible para usuarios autenticados.
        </p>
      </div>
      
      <div className="w-full">
        <div className="bg-success/10 border-2 border-success rounded-[var(--radius)] text-sm p-4 flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} className="text-success" />
          <span className="font-body text-success">
            Esta es una página protegida que solo puedes ver como usuario autenticado
          </span>
        </div>
      </div>
      
      <div className="flex flex-col gap-6 items-start">
        <h2 className="font-heading text-2xl text-neutral-black dark:text-neutral-white">Detalles de tu Usuario</h2>
        <div className="w-full bg-neutral-white dark:bg-neutral-light border-2 border-neutral-black rounded-[var(--radius)] p-4 shadow-[var(--stroke-width)_var(--stroke-width)_0px_0px_rgba(25,25,25,1)]">
          <pre className="text-xs font-body text-neutral-black max-h-32 overflow-auto">
            {JSON.stringify(data.user, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="text-center space-y-4">
        <h2 className="font-heading text-2xl text-neutral-black dark:text-neutral-white">¿Qué sigue?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-neutral-white dark:bg-neutral-light border-2 border-neutral-black rounded-[var(--radius)] p-6 shadow-[var(--stroke-width)_var(--stroke-width)_0px_0px_rgba(25,25,25,1)]">
            <h3 className="font-heading text-lg text-primary dark:text-primary-light mb-2">Construye tu App</h3>
            <p className="font-body text-neutral-gray dark:text-neutral-black">
              Comienza a construir tu aplicación con la autenticación ya configurada.
            </p>
          </div>
          <div className="bg-neutral-white dark:bg-neutral-light border-2 border-neutral-black rounded-[var(--radius)] p-6 shadow-[var(--stroke-width)_var(--stroke-width)_0px_0px_rgba(25,25,25,1)]">
            <h3 className="font-heading text-lg text-secondary dark:text-secondary-light mb-2">Explora Supabase</h3>
            <p className="font-body text-neutral-gray dark:text-neutral-black">
              Añade tablas de base de datos, suscripciones en tiempo real y más características de Supabase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
