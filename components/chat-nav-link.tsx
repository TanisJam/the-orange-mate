"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getUnreadCount } from "@/lib/chat-client";
import UnreadBadge from "@/components/unread-badge";

export default function ChatNavLink() {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const count = await getUnreadCount(user.id);
      setUnreadCount(count);
    } catch {
      // Best-effort; silence failures
    }
  }, []);

  // Fetch initial unread count and subscribe to realtime
  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function setup() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Initial count
      const count = await getUnreadCount(user.id);
      setUnreadCount(count);

      // Get user's chat IDs for channel filter
      const { data: chats } = await supabase
        .from("chats")
        .select("id")
        .or(
          `participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`,
        );

      const chatIds = chats?.map((c) => c.id) ?? [];
      if (chatIds.length === 0) return;

      // Subscribe to new messages in user's chats
      channel = supabase
        .channel("messages-unread-badge")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `chat_id=in.(${chatIds.join(",")})`,
          },
          (payload) => {
            if (
              payload.new &&
              payload.new.sender_id !== user.id
            ) {
              setUnreadCount((prev) => prev + 1);
            }
          },
        )
        .subscribe();
    }

    setup();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Refresh on window focus
  useEffect(() => {
    const handleFocus = () => {
      refreshUnread();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshUnread]);

  return (
    <Link
      href="/messages"
      className="relative flex items-center gap-1.5 text-sm font-body text-muted-foreground hover:text-neutral-black dark:hover:text-neutral-white transition-colors"
    >
      <MessagesSquare className="size-4" />
      Mensajes
      <UnreadBadge count={unreadCount} />
    </Link>
  );
}
