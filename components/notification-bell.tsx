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
import { useDemo } from "@/components/demo-provider";
import { demoStore } from "@/lib/demo-store";
import type { Notification } from "@/lib/types";

export default function NotificationBell() {
  const { isDemo } = useDemo();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const clientRef = useRef<ReturnType<typeof createClient> | null>(null);

  const refreshUnread = useCallback(async () => {
    if (isDemo) return;
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
  }, [isDemo]);

  // Mount: get unread count / demo count from demoStore
  useEffect(() => {
    if (isDemo) {
      setUnreadCount(demoStore.getUnreadCount());
      return;
    }
    refreshUnread();
  }, [isDemo, refreshUnread]);

  // Window focus: refresh count (skip in demo)
  useEffect(() => {
    if (isDemo) return;
    const handleFocus = () => {
      refreshUnread();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshUnread, isDemo]);

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
  // In demo mode: load demo notifications from store, skip Supabase channel
  useEffect(() => {
    // Demo mode: load from in-memory store, no Supabase subscription
    if (isDemo) {
      if (open) {
        setNotifications(demoStore.notifications.slice(0, 5));
      }
      return;
    }

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
  }, [open, userId, isDemo]);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    if (!userId && !isDemo) return;
    if (isDemo) {
      demoStore.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      return;
    }
    const ok = await markAllAsRead(userId!);
    if (ok) {
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
    }
  }, [userId, isDemo]);

  const handleRead = useCallback(() => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger className="relative flex items-center gap-1.5 text-sm font-body text-muted-foreground hover:text-neutral-black dark:hover:text-neutral-white transition-colors cursor-pointer">
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
