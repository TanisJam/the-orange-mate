"use client";

import { useEffect, useState } from "react";
import { useDemo } from "@/components/demo-provider";
import { getUserChats } from "@/lib/demo-database";
import ChatList from "@/components/chat-list";
import { MessageCircle } from "lucide-react";
import type { Chat } from "@/lib/types";

/**
 * Demo messages list page.
 *
 * Client-rendered equivalent of `app/(app)/messages/page.tsx`.  Fetches
 * mock chat data from the demo-database adapter and passes it as props
 * to `ChatList`.  No Supabase calls, no auth checks.
 */
export default function DemoMessagesPage() {
  const { demoUser } = useDemo();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const c = await getUserChats(demoUser.id);
      setChats(c);
      setLoading(false);
    }
    load();
  }, [demoUser.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 text-primary animate-pulse" />
          <p className="text-muted-foreground">Cargando mensajes...</p>
        </div>
      </div>
    );
  }

  return <ChatList chats={chats} currentUserId={demoUser.id} />;
}
