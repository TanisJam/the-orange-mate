"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getNotifications, markAsRead } from "@/lib/notification-client";
import { getNotifications as getDemoNotifications } from "@/lib/demo-database";
import { demoStore } from "@/lib/demo-store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import NotificationItem from "@/components/notification-item";
import type { Notification } from "@/lib/types";

interface NotificationListProps {
  /** When provided, the component operates in demo mode:
   *  - Skips Supabase auth check
   *  - Uses demo-database for data fetching
   *  - Uses demoStore for mark-as-read operations */
  demoUserId?: string;
}

export default function NotificationList({ demoUserId }: NotificationListProps) {
  const isDemo = !!demoUserId;
  const [userId, setUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  const fetchPage = useCallback(
    async (pageNum: number) => {
      const uid = isDemo ? demoUserId! : userId;
      if (!uid) return;
      setLoading(true);

      if (isDemo) {
        const { data, count } = await getDemoNotifications(uid, pageNum, limit);
        setNotifications(data);
        setTotalCount(count);
      } else {
        const { data, count } = await getNotifications(uid, pageNum, limit);
        setNotifications(data);
        setTotalCount(count);
      }
      setLoading(false);
    },
    [userId, demoUserId, isDemo, limit]
  );

  // Get userId on mount (or use demoUserId directly)
  useEffect(() => {
    async function init() {
      if (isDemo) {
        setUserId(demoUserId);
        setAuthChecked(true);
        return;
      }
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
      setAuthChecked(true);
    }
    init();
  }, [isDemo, demoUserId]);

  // Fetch when userId or page changes
  useEffect(() => {
    const uid = isDemo ? demoUserId : userId;
    if (uid) {
      fetchPage(page);
    }
  }, [userId, demoUserId, isDemo, page, fetchPage]);

  async function handleToggleRead(notif: Notification) {
    // markAsRead is one-way (only sets is_read=true). Don't toggle
    // visually in the opposite direction — that causes UI/DB mismatch.
    if (notif.is_read) return;

    if (isDemo) {
      demoStore.markNotificationRead(notif.id);
    } else {
      const ok = await markAsRead(notif.id, notif.user_id);
      if (!ok) return;
    }

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notif.id ? { ...n, is_read: true } : n
      )
    );
  }

  if (!authChecked) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Cargando...
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-heading text-muted-foreground dark:text-neutral-white/60">
          Debes iniciar sesión para ver tus notificaciones
        </p>
      </div>
    );
  }

  const isInitialLoad = notifications.length === 0 && loading;

  if (isInitialLoad) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Cargando...
      </div>
    );
  }

  if (notifications.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-heading text-muted-foreground dark:text-neutral-white/60">
          No tienes notificaciones aún
        </p>
        <p className="text-sm text-muted-foreground dark:text-neutral-white/40 mt-1">
          Cuando recibas notificaciones, aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Notification list */}
      <div className={`divide-y divide-neutral-gray/20 border-2 border-ink rounded-[var(--radius)] bg-card shadow-[var(--stroke-width)_var(--stroke-width)_0px_0px_hsl(var(--ink))] ${loading ? "opacity-50 pointer-events-none" : ""}`}>
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className="flex items-center gap-3 p-3"
          >
            <Checkbox
              checked={notif.is_read}
              disabled={notif.is_read}
              onCheckedChange={() => handleToggleRead(notif)}
              className="shrink-0"
              aria-label={notif.is_read ? "Leída" : "Marcar como leída"}
            />
            <NotificationItem notification={notif} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground dark:text-neutral-white/60 font-body">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
