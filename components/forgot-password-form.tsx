"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocurrió un error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-heading text-success">
              ¡Email enviado!
            </CardTitle>
            <CardDescription className="font-body text-neutral-gray dark:text-neutral-white">
              Revisa tu email para restablecer tu contraseña
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-body text-neutral-gray dark:text-neutral-white">
              Te hemos enviado un enlace para restablecer tu contraseña. Por favor revisa tu bandeja de entrada y sigue las instrucciones.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-heading text-primary dark:text-primary-light">
              Restablecer Contraseña
            </CardTitle>
            <CardDescription className="font-body text-neutral-gray dark:text-neutral-white">
              Ingresa tu email para recibir un enlace de restablecimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm font-body text-error">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading} variant="primary">
                  {isLoading ? "Enviando..." : "Enviar enlace de restablecimiento"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                <span className="font-body text-neutral-gray dark:text-neutral-white">
                  ¿Ya tienes cuenta?{" "}
                  <Link
                    href="/auth/login"
                    className="font-body text-primary dark:text-primary-light underline underline-offset-4 hover:text-primary-dark dark:hover:text-primary"
                  >
                    Inicia sesión
                  </Link>
                </span>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
