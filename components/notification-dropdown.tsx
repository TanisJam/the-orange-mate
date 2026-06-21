"use client";

import Link from "next/link";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import NotificationItem from "@/components/notification-item";
import { useDemo } from "@/components/demo-provider";
import type { Notification } from "@/lib/types";

interface NotificationDropdownProps {
  notifications: Notification[];
  onMarkAllRead: () => void;
  onRead: () => void;
}

export default function NotificationDropdown({
  notifications,
  onMarkAllRead,
  onRead,
}: NotificationDropdownProps) {
  const { isDemo } = useDemo();
  const notifPath = isDemo ? "/demo/notifications" : "/notifications";
  if (notifications.length === 0) {
    return (
      <>
        <div className="px-3 py-4 text-center text-sm text-muted-foreground dark:text-neutral-white/60">
          No tienes notificaciones
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={notifPath} className="cursor-pointer">
            Ver todas
          </Link>
        </DropdownMenuItem>
      </>
    );
  }

  return (
    <>
      <DropdownMenuLabel className="font-heading">
        Notificaciones
      </DropdownMenuLabel>
      <DropdownMenuSeparator />

      {notifications.map((notif) => (
        <DropdownMenuItem key={notif.id} asChild className="p-0">
          <NotificationItem notification={notif} onRead={onRead} />
        </DropdownMenuItem>
      ))}


      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link href={notifPath} className="cursor-pointer">
          Ver todas
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem
        onSelect={(e) => {
          e.preventDefault();
          onMarkAllRead();
        }}
        className="cursor-pointer"
      >
        Marcar todas leídas
      </DropdownMenuItem>
    </>
  );
}
