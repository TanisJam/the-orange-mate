import { AppNav } from "@/components/app-nav";
import { AppShellBody } from "@/components/app-shell-body";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-light dark:bg-background">
      <AppNav />
      <AppShellBody>{children}</AppShellBody>
    </main>
  );
}
