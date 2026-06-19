import { createClient } from "@/lib/supabase/client";
import type { Message, CreateMessageData } from "@/lib/types";

export async function getChatMessages(chatId: string): Promise<Message[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      sender:user_profiles!sender_id(*)
    `,
    )
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching chat messages:", error);
    return [];
  }

  return data || [];
}

export async function sendMessage(
  userId: string,
  messageData: CreateMessageData,
): Promise<Message | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: userId,
      ...messageData,
    })
    .select(
      `
      *,
      sender:user_profiles!sender_id(*)
    `,
    )
    .maybeSingle();

  if (error) {
    console.error("Error sending message:", error);
    return null;
  }

  // Update chat timestamp
  await supabase
    .from("chats")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", messageData.chat_id);

  return data;
}
