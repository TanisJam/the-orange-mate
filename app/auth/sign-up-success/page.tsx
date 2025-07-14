import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-neutral-light dark:bg-neutral-gray">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-heading text-primary dark:text-primary-light">
                ¡Gracias por registrarte!
              </CardTitle>
              <CardDescription className="font-body text-neutral-gray dark:text-neutral-white">
                Revisa tu email para confirmar tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-body text-neutral-gray dark:text-neutral-white">
                Te has registrado exitosamente. Por favor revisa tu email para confirmar tu cuenta antes de iniciar sesión.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
