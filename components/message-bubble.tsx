"use client";

import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div
      className={cn("flex flex-col gap-0.5 max-w-[75%]", isOwn ? "ml-auto items-end" : "mr-auto items-start")}
    >
      {/* Sender name (only for other's messages) */}
      {!isOwn && message.sender?.full_name && (
        <span className="text-xs font-body text-muted-foreground px-1">
          {message.sender.full_name}
        </span>
      )}

      {/* Bubble */}
      <div
        className={cn(
          "px-3 py-2 rounded-2xl text-sm font-body",
          isOwn
            ? "bg-primary text-neutral-black rounded-br-md"
            : "bg-card text-card-foreground rounded-bl-md border border-neutral-gray",
        )}
      >
        {message.content}
      </div>

      {/* Timestamp */}
      <span className="text-[10px] text-muted-foreground px-1">
        {formatTime(message.created_at)}
      </span>
    </div>
  );
}
