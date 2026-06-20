import { createClient } from "@/lib/supabase/client";
import type { Message, CreateMessageData } from "@/lib/types";
import { createNotification } from "@/lib/notification-client";

export async function getChatMessages(chatId: string): Promise<Message[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      sender:user_profiles!sender_id(id, username, full_name, avatar_url)
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
      sender:user_profiles!sender_id(id, username, full_name, avatar_url)
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

  // Notify the other participant
  if (data) {
    const { data: chat } = await supabase
      .from("chats")
      .select("participant_1_id, participant_2_id")
      .eq("id", messageData.chat_id)
      .maybeSingle();

    if (chat) {
      const otherId =
        chat.participant_1_id === userId
          ? chat.participant_2_id
          : chat.participant_1_id;

      if (otherId) {
        const senderName =
          data.sender?.full_name ||
          data.sender?.username ||
          "Someone";
        await createNotification({
          user_id: otherId,
          actor_id: userId,
          type: "new_message",
          title: `Nuevo mensaje de ${senderName}`,
          body: messageData.content.slice(0, 100),
          link: `/messages/${messageData.chat_id}`,
        });
      }
    }
  }

  return data;
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = createClient();

  // Get user's chat IDs
  const { data: userChats, error: chatsError } = await supabase
    .from("chats")
    .select("id")
    .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`);

  if (chatsError) {
    console.error("Error fetching user chats for unread count:", chatsError);
    return 0;
  }

  const chatIds = userChats?.map((c) => c.id) ?? [];
  if (chatIds.length === 0) return 0;

  const { count, error } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false)
    .neq("sender_id", userId)
    .in("chat_id", chatIds);

  if (error) {
    console.error("Error counting unread messages:", error);
    return 0;
  }

  return count ?? 0;
}

export async function markMessagesAsRead(
  chatId: string,
  userId: string,
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("chat_id", chatId)
    .neq("sender_id", userId);

  if (error) {
    console.error("Error marking messages as read:", error);
    return false;
  }

  return true;
}

export async function createOrGetChat(
  userId1: string,
  userId2: string,
): Promise<string | null> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_or_create_chat", {
    user1_id: userId1,
    user2_id: userId2,
  });

  if (error) {
    console.error("Error creating or getting chat:", error);
    return null;
  }

  return data as string | null;
}
