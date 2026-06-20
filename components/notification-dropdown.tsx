"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import NotificationItem from "@/components/notification-item";
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
  const router = useRouter();

  if (notifications.length === 0) {
    return (
      <>
        <div className="px-3 py-4 text-center text-sm text-neutral-gray dark:text-neutral-white/60">
          No tienes notificaciones
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="cursor-pointer">
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
        <DropdownMenuItem
          key={notif.id}
          className="p-0 cursor-default"
          onSelect={(e) => e.preventDefault()}
        >
          <NotificationItem notification={notif} onRead={onRead} />
        </DropdownMenuItem>
      ))}

      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link href="/notifications" className="cursor-pointer">
          Ver todas
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={onMarkAllRead}
        className="cursor-pointer"
      >
        Marcar todas leídas
      </DropdownMenuItem>
    </>
  );
}
