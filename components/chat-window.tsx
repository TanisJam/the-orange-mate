"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { getChatMessages } from "@/lib/chat-client";
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
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTimestampRef = useRef<string | null>(
    initialMessages.length > 0
      ? initialMessages[initialMessages.length - 1].created_at
      : null,
  );

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

  // Polling every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const newMessages = await getChatMessages(chatId);
        const lastKnown = lastTimestampRef.current;

        if (lastKnown) {
          const later = newMessages.filter(
            (m) => m.created_at > lastKnown,
          );
          if (later.length > 0) {
            setMessages((prev) => {
              // Deduplicate by id
              const existingIds = new Set(prev.map((m) => m.id));
              const unique = later.filter((m) => !existingIds.has(m.id));
              return [...prev, ...unique];
            });
            lastTimestampRef.current =
              later[later.length - 1].created_at;
          }
        } else if (newMessages.length > 0) {
          setMessages(newMessages);
          lastTimestampRef.current =
            newMessages[newMessages.length - 1].created_at;
        }
      } catch {
        // Polling is best-effort; silent failure
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [chatId]);

  const handleMessageSent = useCallback(
    (message: Message) => {
      setMessages((prev) => [...prev, message]);
      lastTimestampRef.current = message.created_at;
    },
    [],
  );

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] border-2 border-neutral-black rounded-[var(--radius)] bg-neutral-white dark:bg-neutral-light shadow-[var(--stroke-width)_var(--stroke-width)_0px_0px_rgba(25,25,25,1)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-neutral-gray bg-neutral-light dark:bg-neutral-gray">
        <Link
          href={`/profile/${otherParticipant.id}`}
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
            href={`/profile/${otherParticipant.id}`}
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
          <div className="flex flex-col items-center justify-center h-full text-neutral-gray">
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
