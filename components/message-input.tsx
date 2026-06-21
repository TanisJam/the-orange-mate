"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, X } from "lucide-react";
import { sendMessage } from "@/lib/chat-client";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useDemo } from "@/components/demo-provider";
import type { Message } from "@/lib/types";

interface MessageInputProps {
  chatId: string;
  onMessageSent: (message: Message) => void;
}

export default function MessageInput({
  chatId,
  onMessageSent,
}: MessageInputProps) {
  const { isDemo, sendMessage: demoSimulateSend } = useDemo();
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    setSending(true);
    try {
      // ── Demo mode: simulate message send ────────────────────────────
      if (isDemo) {
        const message = demoSimulateSend({
          chat_id: chatId,
          content: trimmed,
        });
        if (message) {
          toast.success("Demo mode: mensaje enviado");
          onMessageSent(message);
          setContent("");
          textareaRef.current?.focus();
        } else {
          toast.error("No se pudo enviar el mensaje. Intenta de nuevo.");
        }
        setSending(false);
        return;
      }

      // ── Real mode: send via Supabase ────────────────────────────────
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Debes iniciar sesión para enviar mensajes");
        setSending(false);
        return;
      }

      const message = await sendMessage(user.id, {
        chat_id: chatId,
        content: trimmed,
      });

      if (!message) {
        toast.error("No se pudo enviar el mensaje. Intenta de nuevo.");
        setSending(false);
        return;
      }

      onMessageSent(message);
      setContent("");
      textareaRef.current?.focus();
    } catch {
      toast.error("Error al enviar el mensaje");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSend = content.trim().length > 0 && !sending;

  return (
    <div className="flex gap-2 items-end p-3 border-t border-neutral-gray bg-card">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escribe un mensaje…"
        rows={1}
        className="min-h-10 max-h-32 resize-none"
        disabled={sending}
      />
      {content.trim().length > 0 && !sending && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setContent("")}
          aria-label="Descartar mensaje"
        >
          <X className="size-4" />
        </Button>
      )}
      <Button
        variant="primary"
        size="icon"
        onClick={handleSubmit}
        disabled={!canSend}
        aria-label="Enviar mensaje"
      >
        {sending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
      </Button>
    </div>
  );
}
