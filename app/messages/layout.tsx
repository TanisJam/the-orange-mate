import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <main className="min-h-screen bg-neutral-light dark:bg-background">
      <header className="w-full border-b border-neutral-gray dark:border-neutral-gray h-16 flex items-center">
        <div className="w-full max-w-4xl mx-auto flex items-center gap-4 px-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-sm font-body text-muted-foreground hover:text-neutral-black dark:hover:text-neutral-white transition-colors"
          >
            <ArrowLeft className="size-4" />
            Volver
          </Link>
          <h1 className="font-heading text-xl text-neutral-black dark:text-neutral-white">
            Mensajes
          </h1>
        </div>
      </header>
      <div className="w-full max-w-4xl mx-auto p-4">{children}</div>
    </main>
  );
}
