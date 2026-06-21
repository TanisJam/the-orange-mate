import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/database";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profileUsername: string | undefined;
  if (user) {
    const profile = await getUserProfile(user.id, true);
    profileUsername = profile?.username || undefined;
  }

  return user ? (
    <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-4">
      <span className="max-w-full break-all font-body text-sm text-muted-foreground dark:text-neutral-white">
        ¡Hola, {user.email?.split('@')[0]}!
      </span>
      {profileUsername && (
        <Button asChild variant="ghost" size="sm">
          <Link href={`/profile/${profileUsername}`}>Mi Perfil</Link>
        </Button>
      )}
      <LogoutButton />
    </div>
  ) : (
    <div className="flex flex-wrap justify-end gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href="/auth/login">Iniciar Sesión</Link>
      </Button>
      <Button asChild size="sm" variant="primary">
        <Link href="/auth/sign-up">Registrarse</Link>
      </Button>
    </div>
  );
}
