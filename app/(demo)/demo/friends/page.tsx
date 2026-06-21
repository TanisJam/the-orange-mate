"use client";

import { useEffect, useState } from "react";
import { useDemo } from "@/components/demo-provider";
import {
  getFriends,
  getPendingRequests,
  getSentRequests,
} from "@/lib/demo-database";
import FriendsPageClient from "@/components/friends-page-client";
import type { EnrichedFriend } from "@/lib/types";
import { Users } from "lucide-react";

/**
 * Demo friends page.
 *
 * Client-rendered equivalent of `app/(app)/friends/page.tsx`.  Fetches
 * mock friends data from the demo-database adapter and passes it as
 * props to `FriendsPageClient`.  No Supabase calls, no auth checks.
 */
export default function DemoFriendsPage() {
  const { demoUser } = useDemo();
  const [friends, setFriends] = useState<EnrichedFriend[]>([]);
  const [pending, setPending] = useState<EnrichedFriend[]>([]);
  const [sent, setSent] = useState<EnrichedFriend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [f, p, s] = await Promise.all([
        getFriends(demoUser.id),
        getPendingRequests(demoUser.id),
        getSentRequests(demoUser.id),
      ]);
      setFriends(f);
      setPending(p);
      setSent(s);
      setLoading(false);
    }
    load();
  }, [demoUser.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Users className="w-8 h-8 mx-auto mb-2 text-primary animate-pulse" />
          <p className="text-muted-foreground">Cargando amigos...</p>
        </div>
      </div>
    );
  }

  return (
    <FriendsPageClient
      initialFriends={friends}
      initialPending={pending}
      initialSent={sent}
      currentUserId={demoUser.id}
    />
  );
}
