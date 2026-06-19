"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import FriendCard from "@/components/friend-card";
import Link from "next/link";
import { Users } from "lucide-react";
import type { EnrichedFriend } from "@/lib/types";
import { acceptFriendRequest, rejectFriendRequest } from "@/lib/database-client";

interface FriendsPageClientProps {
  initialFriends: EnrichedFriend[];
  initialPending: EnrichedFriend[];
  initialSent: EnrichedFriend[];
  currentUserId: string;
}

export default function FriendsPageClient({
  initialFriends,
  initialPending,
  initialSent,
  currentUserId,
}: FriendsPageClientProps) {
  const [friends, setFriends] = useState<EnrichedFriend[]>(initialFriends);
  const [pending, setPending] = useState<EnrichedFriend[]>(initialPending);
  const [sent] = useState<EnrichedFriend[]>(initialSent);

  const handleAccept = async (requestId: string) => {
    const result = await acceptFriendRequest(requestId);
    if (result) {
      const accepted = pending.find((r) => r.id === requestId);
      if (accepted) {
        setPending((prev) => prev.filter((r) => r.id !== requestId));
        setFriends((prev) => [
          { ...accepted, status: "accepted" as const } as EnrichedFriend,
          ...prev,
        ]);
      }
      toast.success("Solicitud aceptada");
    }
  };

  const handleReject = async (requestId: string) => {
    await rejectFriendRequest(requestId);
    setPending((prev) => prev.filter((r) => r.id !== requestId));
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Tabs defaultValue="amigos" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="amigos" className="flex-1">
            Amigos
          </TabsTrigger>
          <TabsTrigger value="pendientes" className="flex-1">
            Pendientes
          </TabsTrigger>
          <TabsTrigger value="enviadas" className="flex-1">
            Enviadas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="amigos">
          {friends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-gray">
              <Users className="size-12 mb-4 opacity-50" />
              <p className="font-body text-lg">
                No tenés amigos todavía.
              </p>
              <p className="font-body text-sm mt-1">
                <Link
                  href="/discover"
                  className="text-primary font-semibold hover:underline"
                >
                  Encontrá viajeros en Discover
                </Link>
              </p>
            </div>
          ) : (
            <div className="space-y-2 mt-4">
              {friends.map((f) => (
                <FriendCard
                  key={f.id}
                  friendship={f}
                  currentUserId={currentUserId}
                  variant="friend"
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pendientes">
          {pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-gray">
              <Users className="size-12 mb-4 opacity-50" />
              <p className="font-body text-lg">
                No hay solicitudes pendientes
              </p>
            </div>
          ) : (
            <div className="space-y-2 mt-4">
              {pending.map((r) => (
                <FriendCard
                  key={r.id}
                  friendship={r}
                  currentUserId={currentUserId}
                  variant="pending"
                  onAccept={() => handleAccept(r.id)}
                  onReject={() => handleReject(r.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="enviadas">
          {sent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-gray">
              <Users className="size-12 mb-4 opacity-50" />
              <p className="font-body text-lg">
                No has enviado solicitudes
              </p>
            </div>
          ) : (
            <div className="space-y-2 mt-4">
              {sent.map((r) => (
                <FriendCard
                  key={r.id}
                  friendship={r}
                  currentUserId={currentUserId}
                  variant="sent"
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
