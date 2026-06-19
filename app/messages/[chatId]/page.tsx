import { createClient } from "@/lib/supabase/server";
import { getChatMessages, getUserChats } from "@/lib/database";
import { redirect, notFound } from "next/navigation";
import ChatWindow from "@/components/chat-window";

type Props = {
  params: Promise<{ chatId: string }>;
};

export default async function ChatPage({ params }: Props) {
  const { chatId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch user's chats to verify participation
  const chats = await getUserChats(user.id, true);
  const chat = chats.find((c) => c.id === chatId);

  if (!chat) {
    notFound();
  }

  // Determine other participant
  const otherParticipant =
    chat.participant_1_id === user.id
      ? chat.participant_2
      : chat.participant_1;

  if (!otherParticipant) {
    notFound();
  }

  const initialMessages = await getChatMessages(chatId, true);

  return (
    <ChatWindow
      chatId={chatId}
      initialMessages={initialMessages}
      currentUserId={user.id}
      otherParticipant={{
        id: otherParticipant.id,
        full_name: otherParticipant.full_name,
        avatar_url: otherParticipant.avatar_url,
      }}
    />
  );
}
