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

  return <ChatList chats={chats} currentUserId={user.id} />;
}
