"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import type { UserProfile, UserInterest, FriendStatus, UserReview } from "@/lib/types";
import { createOrGetChat } from "@/lib/chat-client";
import FriendRequestButton from "@/components/friend-request-button";
import { ReviewsSection } from "@/components/reviews-section";
import {
  User,
  MapPin,
  Calendar,
  Flag,
  Globe,
  Pencil,
  Send,
} from "lucide-react";

interface FriendStatusResult {
  id: string;
  status: FriendStatus;
  isSender: boolean;
}

interface PublicProfileDisplayProps {
  profile: UserProfile;
  interests: UserInterest[];
  stats: { created: number; participating: number };
  isOwner: boolean;
  currentUserId?: string | null;
  friendStatus?: FriendStatusResult | null;
  reviews?: UserReview[];
  averageRating?: { average: number; count: number };
}

export function PublicProfileDisplay({
  profile,
  interests,
  stats,
  isOwner,
  currentUserId,
  friendStatus,
  reviews = [],
  averageRating = { average: 0, count: 0 },
}: PublicProfileDisplayProps) {
  const router = useRouter();

  const interestLabel = (ui: UserInterest): string => {
    if (ui.is_custom && ui.custom_name) return ui.custom_name;
    if (ui.interest?.name) return ui.interest.name;
    return ui.interest_id;
  };

  const interestIcon = (ui: UserInterest): string | undefined => {
    return ui.interest?.icon;
  };

  const handleSendMessage = async () => {
    if (!currentUserId) return;
    try {
      const chatId = await createOrGetChat(currentUserId, profile.id);
      if (chatId) {
        router.push(`/messages/${chatId}`);
      } else {
        toast.error("No se pudo iniciar la conversación");
      }
    } catch {
      toast.error("Error al iniciar la conversación");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header — Avatar + Name + Username */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full border-2 border-neutral-black bg-secondary/20 flex items-center justify-center overflow-hidden shrink-0 dark:border-neutral-gray">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || profile.username || "Avatar"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-neutral-gray" />
              )}
            </div>

            {/* Name + Username + Bio */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              {profile.full_name && (
                <h1 className="text-3xl font-heading text-primary dark:text-primary-light">
                  {profile.full_name}
                </h1>
              )}
              <p className="text-lg text-neutral-gray">
                @{profile.username ?? profile.id}
              </p>
              {profile.bio && (
                <p className="text-sm text-neutral-black dark:text-neutral-white whitespace-pre-wrap">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Edit button — only for owner */}
            {isOwner && (
              <div className="sm:self-start">
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard?tab=profile">
                    <Pencil className="w-4 h-4" />
                    Editar perfil
                  </Link>
                </Button>
              </div>
            )}

            {/* Send message button — only for authenticated non-owners */}
            {!isOwner && currentUserId && (
              <div className="sm:self-start">
                <Button variant="primary" size="sm" onClick={handleSendMessage}>
                  <Send className="w-4 h-4" />
                  Enviar mensaje
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Metadata row — age, country, city */}
      {(profile.age || profile.country || profile.city) && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-gray">
              {profile.age && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {profile.age} años
                </span>
              )}
              {profile.country && (
                <span className="flex items-center gap-1.5">
                  <Flag className="w-4 h-4" />
                  {profile.country}
                </span>
              )}
              {profile.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {profile.city}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interests */}
      {interests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="w-5 h-5" />
              Intereses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {interests.map((ui) => (
                <Badge
                  key={ui.id}
                  variant="default"
                  className="text-sm px-3 py-1"
                >
                  {interestIcon(ui)} {interestLabel(ui)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Stats */}
      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-semibold text-neutral-black dark:text-neutral-white">
            Planes creados: {stats.created}
            {" · "}
            Participando: {stats.participating}
          </p>
        </CardContent>
      </Card>

      {/* Reviews — authenticated users only */}
      {currentUserId && (
        <Card>
          <CardContent className="p-6">
            <ReviewsSection
              reviews={reviews}
              average={averageRating}
              currentUserId={currentUserId}
              reviewedId={profile.id}
              canReview={false}
            />
          </CardContent>
        </Card>
      )}

      {/* Friend interaction — authenticated non-owners only */}
      {!isOwner && currentUserId && (
        <div className="flex justify-end">
          <FriendRequestButton
            currentUserId={currentUserId}
            profileUserId={profile.id}
            isOwnProfile={isOwner}
            initialStatus={friendStatus ?? null}
          />
        </div>
      )}
    </div>
  );
}
