"use client";

import type { Notification } from "@/lib/types";
import { markAsRead } from "@/lib/notification-client";
import { formatRelativeDate } from "@/lib/format-date";
import { useRouter } from "next/navigation";
import { useDemo } from "@/components/demo-provider";

function getInitials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
}

interface NotificationItemProps {
  notification: Notification;
  onRead?: () => void;
}

export default function NotificationItem({
  notification,
  onRead,
}: NotificationItemProps) {
  const router = useRouter();
  const { isDemo } = useDemo();
  const actorName =
    notification.actor?.full_name ||
    notification.actor?.username ||
    "Usuario";

  async function handleClick() {
    if (!notification.is_read && !isDemo) {
      const ok = await markAsRead(notification.id, notification.user_id);
      if (ok) onRead?.();
    }
    if (
      notification.link?.startsWith("/") &&
      !notification.link.startsWith("//")
    ) {
      router.push(isDemo ? `/demo${notification.link}` : notification.link);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full flex items-start gap-3 px-2 py-2 text-left transition-colors hover:bg-accent/10 rounded-sm ${
        notification.is_read ? "opacity-50" : ""
      }`}
    >
      {/* Actor avatar */}
      {notification.actor?.avatar_url ? (
        <img
          src={notification.actor.avatar_url}
          alt={actorName}
          className="size-8 rounded-full object-cover border border-neutral-gray shrink-0 mt-0.5"
        />
      ) : (
        <div className="size-8 rounded-full bg-primary text-neutral-black font-heading flex items-center justify-center text-[10px] shrink-0 border border-neutral-gray mt-0.5">
          {getInitials(actorName)}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-heading text-sm text-neutral-black dark:text-neutral-white truncate">
            {notification.title}
          </span>
          <span className="text-[11px] text-muted-foreground dark:text-neutral-white/60 shrink-0">
            {formatRelativeDate(notification.created_at)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground dark:text-neutral-white/70 mt-0.5 line-clamp-2">
          {notification.body}
        </p>
      </div>
    </button>
  );
}
