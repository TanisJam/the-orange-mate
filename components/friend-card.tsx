"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { EnrichedFriend } from "@/lib/types";

interface FriendCardProps {
  friendship: EnrichedFriend;
  currentUserId: string;
  variant: "friend" | "pending" | "sent";
  onAccept?: () => void;
  onReject?: () => void;
}

function getInitials(name?: string): string {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function FriendCard({
  friendship,
  variant,
  onAccept,
  onReject,
}: FriendCardProps) {
  const friendProfile = friendship.friend;
  const displayName =
    friendProfile?.full_name || friendProfile?.username || "Usuario";
  const avatarUrl = friendProfile?.avatar_url;
  const profileId = friendProfile?.id;

  const statusLabel = () => {
    switch (variant) {
      case "friend":
        return `Amigos desde ${formatDate(friendship.created_at)}`;
      case "pending":
        return "Te envió una solicitud";
      case "sent":
        return "Solicitud enviada";
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-[var(--radius)] border-2 border-ink bg-card shadow-[var(--stroke-width)_var(--stroke-width)_0px_0px_hsl(var(--ink))]">
      {/* Avatar */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName}
          className="size-10 rounded-full object-cover border border-neutral-gray shrink-0"
        />
      ) : (
        <div className="size-10 rounded-full bg-primary text-neutral-black font-heading flex items-center justify-center text-sm shrink-0 border border-neutral-gray">
          {getInitials(friendProfile?.full_name)}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        {profileId ? (
          <Link
            href={`/profile/${friendProfile?.username || profileId}`}
            className="font-heading text-sm text-neutral-black dark:text-neutral-white hover:underline truncate block"
          >
            {displayName}
          </Link>
        ) : (
          <span className="font-heading text-sm text-neutral-black dark:text-neutral-white truncate block">
            {displayName}
          </span>
        )}
        <p className="text-xs text-muted-foreground mt-0.5">{statusLabel()}</p>
      </div>

      {/* Actions */}
      {variant === "pending" && (
        <div className="flex gap-1.5 shrink-0">
          <Button variant="primary" size="sm" onClick={onAccept}>
            Aceptar
          </Button>
          <Button variant="outline" size="sm" onClick={onReject}>
            Rechazar
          </Button>
        </div>
      )}

      {variant === "sent" && (
        <span className="text-xs text-muted-foreground font-medium shrink-0 bg-neutral-light dark:bg-background px-2 py-1 rounded-[var(--radius)]">
          Pendiente
        </span>
      )}
    </div>
  );
}
