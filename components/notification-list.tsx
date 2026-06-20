"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getNotifications, markAsRead } from "@/lib/notification-client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import NotificationItem from "@/components/notification-item";
import type { Notification } from "@/lib/types";

export default function NotificationList() {
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  const fetchPage = useCallback(
    async (pageNum: number) => {
      if (!userId) return;
      setLoading(true);
      const { data, count } = await getNotifications(userId, pageNum, limit);
      setNotifications(data);
      setTotalCount(count);
      setLoading(false);
    },
    [userId]
  );

  // Get userId on mount
  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    }
    init();
  }, []);

  // Fetch when userId or page changes
  useEffect(() => {
    if (userId) {
      fetchPage(page);
    }
  }, [userId, page, fetchPage]);

  async function handleToggleRead(notif: Notification) {
    const ok = await markAsRead(notif.id);
    if (ok) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notif.id ? { ...n, is_read: !n.is_read } : n
        )
      );
    }
  }

  if (!userId) {
    return (
      <div className="text-center py-12 text-neutral-gray">
        Cargando...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-neutral-gray">
        Cargando...
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-heading text-neutral-gray dark:text-neutral-white/60">
          No tienes notificaciones aún
        </p>
        <p className="text-sm text-neutral-gray dark:text-neutral-white/40 mt-1">
          Cuando recibas notificaciones, aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Notification list */}
      <div className="divide-y divide-neutral-gray/20 border-2 border-neutral-black rounded-[var(--radius)] bg-neutral-white dark:bg-neutral-light shadow-[var(--stroke-width)_var(--stroke-width)_0px_0px_rgba(25,25,25,1)]">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`flex items-center gap-3 p-3 ${
              notif.is_read ? "opacity-50" : ""
            }`}
          >
            <Checkbox
              checked={notif.is_read}
              onCheckedChange={() => handleToggleRead(notif)}
              className="shrink-0"
              aria-label={notif.is_read ? "Marcar como no leída" : "Marcar como leída"}
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
          <span className="text-sm text-neutral-gray dark:text-neutral-white/60 font-body">
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
