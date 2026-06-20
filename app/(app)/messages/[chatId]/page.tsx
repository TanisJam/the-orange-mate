import { createClient } from "@/lib/supabase/server";
import { getChatMessages } from "@/lib/database";
import { redirect, notFound } from "next/navigation";
import ChatWindow from "@/components/chat-window";
import { BackButton } from "@/components/back-button";

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

  // Verify participation — query chat directly by id + participant filter
  const { data: chat } = await supabase
    .from("chats")
    .select(
      `*,
      participant_1:user_profiles!participant_1_id(id, username, full_name, avatar_url),
      participant_2:user_profiles!participant_2_id(id, username, full_name, avatar_url)`,
    )
    .eq("id", chatId)
    .or(
      `participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`,
    )
    .maybeSingle();

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
    <div className="flex flex-col h-[calc(100dvh-4rem)] w-full max-w-4xl mx-auto px-4 py-3 gap-3">
      <BackButton fallbackHref="/messages" label="Volver a Mensajes" />
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
    </div>
  );
}
