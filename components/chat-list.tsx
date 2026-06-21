"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useDemo } from "@/components/demo-provider";
import type { Chat } from "@/lib/types";

function getOtherParticipant(
  chat: Chat,
  currentUserId: string,
): { id: string; full_name?: string; avatar_url?: string } {
  if (chat.participant_1_id === currentUserId) {
    return {
      id: chat.participant_2_id,
      full_name: chat.participant_2?.full_name,
      avatar_url: chat.participant_2?.avatar_url,
    };
  }
  return {
    id: chat.participant_1_id,
    full_name: chat.participant_1?.full_name,
    avatar_url: chat.participant_1?.avatar_url,
  };
}

function getInitials(name?: string): string {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "ahora";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHour < 24) return `${diffHour}h`;
  if (diffDay === 1) return "ayer";
  if (diffDay < 7) return `${diffDay}d`;
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "…";
}

interface ChatListProps {
  chats: Chat[];
  currentUserId: string;
}

export default function ChatList({ chats, currentUserId }: ChatListProps) {
  const { isDemo } = useDemo();
  const chatPath = (chatId: string) =>
    isDemo ? `/demo/messages/${chatId}` : `/messages/${chatId}`;
  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <MessageCircle className="size-12 mb-4 opacity-50" />
        <p className="font-body text-lg">No tienes conversaciones</p>
        <p className="font-body text-sm mt-1">
          Encuentra viajeros y empieza a chatear
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chats.map((chat) => {
        const other = getOtherParticipant(chat, currentUserId);
        // last_message is a one-to-many embedded relation — pick the most recent
        const messagesArr = chat.last_message as unknown as
          | { content: string; created_at: string; sender_id: string }[]
          | undefined;
        const lastMsg =
          messagesArr && messagesArr.length > 0
            ? messagesArr.reduce((a, b) =>
                new Date(a.created_at) > new Date(b.created_at) ? a : b,
              )
            : null;
        const isOwnLast =
          lastMsg && lastMsg.sender_id === currentUserId;
        const preview = lastMsg
          ? `${isOwnLast ? "Tú: " : ""}${truncate(lastMsg.content ?? "", 50)}`
          : null;

        return (
          <Link
            key={chat.id}
            href={chatPath(chat.id)}
            className="flex items-center gap-3 p-3 rounded-[var(--radius)] border-2 border-ink bg-card shadow-[var(--stroke-width)_var(--stroke-width)_0px_0px_hsl(var(--ink))] hover:bg-neutral-light dark:hover:bg-muted transition-colors cursor-pointer"
          >
            {/* Avatar */}
            {other.avatar_url ? (
              <img
                src={other.avatar_url}
                alt={other.full_name ?? "Avatar"}
                className="size-10 rounded-full object-cover border border-neutral-gray shrink-0"
              />
            ) : (
              <div className="size-10 rounded-full bg-primary text-neutral-black font-heading flex items-center justify-center text-sm shrink-0 border border-neutral-gray">
                {getInitials(other.full_name)}
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <span className="font-heading text-sm text-neutral-black dark:text-neutral-white truncate">
                  {other.full_name ?? "Usuario"}
                </span>
                <span className="text-xs text-muted-foreground shrink-0 ml-2">
                  {formatRelativeTime(chat.updated_at)}
                </span>
              </div>
              {preview ? (
                <p className="text-sm text-muted-foreground truncate mt-0.5">
                  {preview}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic mt-0.5">
                  Sin mensajes
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
