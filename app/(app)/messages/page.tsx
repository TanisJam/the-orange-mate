import { createClient } from "@/lib/supabase/server";
import { getUserChats } from "@/lib/database";
import { redirect } from "next/navigation";
import ChatList from "@/components/chat-list";

export default async function InboxPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const chats = await getUserChats(user.id, true);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="font-heading text-2xl text-neutral-black dark:text-neutral-white">
        Mensajes
      </h1>
      <ChatList chats={chats} currentUserId={user.id} />
    </div>
  );
}
