import type { Metadata } from "next";
import NotificationList from "@/components/notification-list";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Notificaciones | The Orange Mate",
  description: "Tus notificaciones en The Orange Mate",
};

export default function NotificationsPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <PageHeader title="Notificaciones" backHref="/dashboard" />
      <NotificationList />
    </div>
  );
}
