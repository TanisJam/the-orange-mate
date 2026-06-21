"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { useDemo } from "@/components/demo-provider";
import { getUserChats, getChatMessages } from "@/lib/demo-database";
import ChatWindow from "@/components/chat-window";
import type { Chat, Message } from "@/lib/types";
import type { UserProfile } from "@/lib/types";
import { MessageCircle } from "lucide-react";

/**
 * Demo chat detail page.
 *
 * Client-rendered equivalent of `app/(app)/messages/[chatId]/page.tsx`.
 * Fetches the mock chat and its messages from the demo-database adapter
 * and passes them as props to `ChatWindow`.  No Supabase calls.
 */
export default function DemoChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = use(params);
  const { demoUser } = useDemo();

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Find the chat from the user's chat list
      const userChats = await getUserChats(demoUser.id);
      const found = userChats.find((c) => c.id === chatId);

      if (!found) {
        setChat(null);
        setLoading(false);
        return;
      }
      setChat(found);

      // Load messages for this chat
      const msgs = await getChatMessages(chatId);
      setMessages(msgs);
      setLoading(false);
    }
    load();
  }, [chatId, demoUser.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 text-primary animate-pulse" />
          <p className="text-muted-foreground">Cargando conversación...</p>
        </div>
      </div>
    );
  }

  if (!chat) {
    return notFound();
  }

  // Determine which participant is "the other"
  const isP1 = chat.participant_1_id === demoUser.id;
  const otherParticipant: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  } = isP1
    ? {
        id: chat.participant_2_id,
        username: (chat.participant_2 as UserProfile)?.username,
        full_name: (chat.participant_2 as UserProfile)?.full_name,
        avatar_url: (chat.participant_2 as UserProfile)?.avatar_url,
      }
    : {
        id: chat.participant_1_id,
        username: (chat.participant_1 as UserProfile)?.username,
        full_name: (chat.participant_1 as UserProfile)?.full_name,
        avatar_url: (chat.participant_1 as UserProfile)?.avatar_url,
      };

  return (
    <ChatWindow
      chatId={chat.id}
      initialMessages={messages}
      currentUserId={demoUser.id}
      otherParticipant={otherParticipant}
    />
  );
}
