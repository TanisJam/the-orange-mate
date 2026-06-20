import { createClient } from "@/lib/supabase/server";
import { getFriends, getPendingRequests, getSentRequests } from "@/lib/database";
import { redirect } from "next/navigation";
import FriendsPageClient from "@/components/friends-page-client";
import { BackButton } from "@/components/back-button";

export default async function FriendsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [friends, pending, sent] = await Promise.all([
    getFriends(user.id, true),
    getPendingRequests(user.id, true),
    getSentRequests(user.id, true),
  ]);

  return (
    <div className="space-y-6">
      <BackButton fallbackHref="/dashboard" />
      <FriendsPageClient
        initialFriends={friends}
        initialPending={pending}
        initialSent={sent}
        currentUserId={user.id}
      />
    </div>
  );
}
