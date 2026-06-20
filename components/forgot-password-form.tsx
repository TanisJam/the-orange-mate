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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Ingresa un email válido"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    const supabase = createClient();
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocurrió un error");
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
            <CardDescription className="font-body text-muted-foreground dark:text-neutral-white">
              Revisa tu email para restablecer tu contraseña
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-body text-muted-foreground dark:text-neutral-white">
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
            <CardDescription className="font-body text-muted-foreground dark:text-neutral-white">
              Ingresa tu email para recibir un enlace de restablecimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="tu@email.com"
                            autoComplete="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {error && (
                    <p
                      className="text-sm font-body text-error"
                      role="alert"
                      aria-live="polite"
                    >
                      {error}
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={form.formState.isSubmitting}
                    variant="primary"
                  >
                    {form.formState.isSubmitting ? "Enviando..." : "Enviar enlace de restablecimiento"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  <span className="font-body text-muted-foreground dark:text-neutral-white">
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
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
