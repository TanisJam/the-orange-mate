"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell } from "lucide-react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  getUnreadCount,
  getNotifications,
  getNotificationById,
  markAllAsRead,
} from "@/lib/notification-client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import UnreadBadge from "@/components/unread-badge";
import NotificationDropdown from "@/components/notification-dropdown";
import type { Notification } from "@/lib/types";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const clientRef = useRef<ReturnType<typeof createClient> | null>(null);

  const refreshUnread = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const count = await getUnreadCount(user.id);
      setUnreadCount(count);
    } catch {
      // Best-effort; silence failures
    }
  }, []);

  // Mount: get unread count
  useEffect(() => {
    refreshUnread();
  }, [refreshUnread]);

  // Window focus: refresh count
  useEffect(() => {
    const handleFocus = () => {
      refreshUnread();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshUnread]);

  // Safety net: cleanup channel on unmount (even if dropdown is open)
  useEffect(() => {
    return () => {
      if (channelRef.current && clientRef.current) {
        clientRef.current.removeChannel(channelRef.current);
        channelRef.current = null;
        clientRef.current = null;
      }
    };
  }, []);

  // Lazy realtime: subscribe when dropdown opens and userId is available
  useEffect(() => {
    if (!open || !userId) return;

    // Fetch latest 5 notifications
    getNotifications(userId, 1, 5).then(({ data }) => {
      setNotifications(data);
    });

    // Create ONE client instance for both channel creation and removal
    const supabase = createClient();
    clientRef.current = supabase;

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          if (payload.new) {
            // Re-fetch with actor join — realtime payload has no join data
            const fullNotification = await getNotificationById(
              payload.new.id,
              userId,
            );
            if (fullNotification) {
              setNotifications((prev) =>
                [fullNotification, ...prev].slice(0, 5),
              );
            }
            setUnreadCount((prev) => prev + 1);
          }
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current && clientRef.current) {
        clientRef.current.removeChannel(channelRef.current);
        channelRef.current = null;
        clientRef.current = null;
      }
    };
  }, [open, userId]);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    if (!userId) return;
    const ok = await markAllAsRead(userId);
    if (ok) {
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
    }
  }, [userId]);

  const handleRead = useCallback(() => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger className="relative flex items-center gap-1.5 text-sm font-body text-neutral-gray hover:text-neutral-black dark:hover:text-neutral-white transition-colors cursor-pointer">
        <Bell className="size-4" />
        Notificaciones
        <UnreadBadge count={unreadCount} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="start" sideOffset={8}>
        <NotificationDropdown
          notifications={notifications}
          onMarkAllRead={handleMarkAllRead}
          onRead={handleRead}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
