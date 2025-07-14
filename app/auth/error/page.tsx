import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-neutral-light dark:bg-neutral-gray">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-heading text-error">
                Lo sentimos, algo salió mal.
              </CardTitle>
            </CardHeader>
            <CardContent>
              {params?.error ? (
                <p className="text-sm font-body text-neutral-gray dark:text-neutral-white">
                  Error: {params.error}
                </p>
              ) : (
                <p className="text-sm font-body text-neutral-gray dark:text-neutral-white">
                  Ocurrió un error no especificado.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
