"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { markMessagesAsRead } from "@/lib/chat-client";
import { useDemo } from "@/components/demo-provider";
import MessageBubble from "@/components/message-bubble";
import MessageInput from "@/components/message-input";
import type { Message } from "@/lib/types";

interface ChatWindowProps {
  chatId: string;
  initialMessages: Message[];
  currentUserId: string;
  otherParticipant: {
    id: string;
    full_name?: string;
    avatar_url?: string;
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

export default function ChatWindow({
  chatId,
  initialMessages,
  currentUserId,
  otherParticipant,
}: ChatWindowProps) {
  const { isDemo } = useDemo();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const profilePath = isDemo
    ? `/demo/profile/${otherParticipant.id}`
    : `/profile/${otherParticipant.id}`;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Auto-scroll on initial load
  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  // Scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Mark messages as read on chat open
  useEffect(() => {
    markMessagesAsRead(chatId, currentUserId);
  }, [chatId, currentUserId]);

  // Mark as read when user returns to this tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        markMessagesAsRead(chatId, currentUserId);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [chatId, currentUserId]);

  // Realtime subscription — replaces polling
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const newMsg = payload.new as Record<string, unknown>;
          // Only append messages from the other participant
          // (own messages are already appended via the send callback)
          if (newMsg && newMsg.sender_id !== currentUserId) {
            setMessages((prev) => {
              // Prevent duplicates
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              // Enrich with otherParticipant as sender — realtime
              // payloads lack the joined sender profile
              return [
                ...prev,
                { ...newMsg, sender: otherParticipant } as unknown as Message,
              ];
            });

            // Mark as read if the window is visible
            if (document.visibilityState === "visible") {
              markMessagesAsRead(chatId, currentUserId);
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, currentUserId]);

  const handleMessageSent = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-0 border-2 border-ink rounded-[var(--radius)] bg-card shadow-[var(--stroke-width)_var(--stroke-width)_0px_0px_hsl(var(--ink))] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-neutral-gray bg-neutral-light dark:bg-background">
        <Link
          href={profilePath}
          className="shrink-0"
        >
          {otherParticipant.avatar_url ? (
            <img
              src={otherParticipant.avatar_url}
              alt={otherParticipant.full_name ?? "Avatar"}
              className="size-9 rounded-full object-cover border border-neutral-gray"
            />
          ) : (
            <div className="size-9 rounded-full bg-primary text-neutral-black font-heading flex items-center justify-center text-xs border border-neutral-gray">
              {getInitials(otherParticipant.full_name)}
            </div>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={profilePath}
            className="font-heading text-sm text-neutral-black dark:text-neutral-white hover:underline"
          >
            {otherParticipant.full_name ?? "Usuario"}
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageCircle className="size-10 mb-2 opacity-50" />
            <p className="font-body text-sm">
              No hay mensajes aún. ¡Di hola!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_id === currentUserId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput chatId={chatId} onMessageSent={handleMessageSent} />
    </div>
  );
}
