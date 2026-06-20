import type { Metadata } from "next";
import NotificationList from "@/components/notification-list";

export const metadata: Metadata = {
  title: "Notificaciones | The Orange Mate",
  description: "Tus notificaciones en SoloTravelers",
};

export default function NotificationsPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="font-heading text-2xl text-neutral-black dark:text-neutral-white mb-6">
        Notificaciones
      </h1>
      <NotificationList />
    </div>
  );
}
