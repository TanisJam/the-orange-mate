"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { JoinRequestFlow } from "@/components/join-request-flow";
import {
  updateTravelPlan,
  getPlanJoinRequests,
  completeTrip,
} from "@/lib/database-client";
import { createOrGetChat } from "@/lib/chat-client";
import type { TravelPlan, PlanJoinRequest, UserReview } from "@/lib/types";
import { ReviewsSection } from "@/components/reviews-section";
import CommentList from "@/components/comment-list";
import NoteList from "@/components/note-list";
import {
  PLAN_TYPES,
  PLAN_STATUSES,
  CURRENCIES,
  PERMISSION_LEVELS,
} from "@/lib/types";
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  FileText,
  MessageSquare,
  Globe,
  Lock,
  Send,
  StickyNote,
  CheckCircle,
  Loader2,
} from "lucide-react";

interface PlanDetailProps {
  plan: TravelPlan;
  currentUserId: string;
  initialRequests: PlanJoinRequest[];
  reviews?: UserReview[];
  averageRating?: { average: number; count: number };
}

export function PlanDetail({
  plan,
  currentUserId,
  initialRequests,
  reviews = [],
  averageRating = { average: 0, count: 0 },
}: PlanDetailProps) {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<TravelPlan>(plan);
  const [joinRequests, setJoinRequests] =
    useState<PlanJoinRequest[]>(initialRequests);
  const [publishing, setPublishing] = useState(false);
  const [completing, setCompleting] = useState(false);

  const isCreator = currentUserId === currentPlan.creator_id;
  const isParticipant =
    currentPlan.participants?.some((p) => p.user_id === currentUserId) ?? false;
  const participantRecord = currentPlan.participants?.find(
    (p) => p.user_id === currentUserId
  );
  const isAtCapacity =
    (currentPlan.current_participants ?? 0) >=
    (currentPlan.max_participants ?? Infinity);

  // Only participants or public plan viewers can see full content
  const canViewFullContent = isParticipant || isCreator || currentPlan.is_public;

  const handleMessageCreator = async () => {
    try {
      const chatId = await createOrGetChat(
        currentUserId,
        currentPlan.creator_id,
      );
      if (chatId) {
        router.push(`/messages/${chatId}`);
      } else {
        toast.error("No se pudo iniciar la conversación");
      }
    } catch {
      toast.error("Error al iniciar la conversación");
    }
  };

  const refreshRequests = async () => {
    try {
      const data = await getPlanJoinRequests(currentPlan.id);
      setJoinRequests(data);
    } catch (error) {
      console.error("Error refreshing requests:", error);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const updated = await updateTravelPlan(currentPlan.id, {
        is_public: true,
      });
      if (updated) {
        setCurrentPlan(updated);
      }
    } catch (error) {
      console.error("Error publishing plan:", error);
    } finally {
      setPublishing(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const updated = await completeTrip(currentPlan.id, currentUserId);
      if (updated) {
        setCurrentPlan(updated);
        toast.success("¡Viaje marcado como completado!");
      } else {
        toast.error("No se pudo completar el viaje");
      }
    } catch (error) {
      console.error("Error completing trip:", error);
      toast.error("Error al completar el viaje");
    } finally {
      setCompleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPlanTypeInfo = (type: string) => {
    return PLAN_TYPES.find((pt) => pt.value === type) || PLAN_TYPES[0];
  };

  const getPlanStatusInfo = (status: string) => {
    return PLAN_STATUSES.find((ps) => ps.value === status) || PLAN_STATUSES[0];
  };

  const getPermissionLabel = (level: string) => {
    return (
      PERMISSION_LEVELS.find((p) => p.value === level)?.label || level
    );
  };

  const typeInfo = getPlanTypeInfo(currentPlan.plan_type);
  const statusInfo = getPlanStatusInfo(currentPlan.status);
  const currencyInfo = CURRENCIES.find((c) => c.value === currentPlan.currency);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-2xl">{typeInfo.icon}</span>
                <h1 className="text-3xl font-heading text-primary dark:text-primary-light">
                  {currentPlan.title}
                </h1>
                <Badge className={statusInfo.color + " text-white"}>
                  {statusInfo.label}
                </Badge>
                {!currentPlan.is_public && (
                  <Badge
                    variant="outline"
                    className="border-error text-error"
                  >
                    <Lock className="w-3 h-3 mr-1" />
                    No publicado
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Creado por{" "}
                <Link
                  href={`/profile/${currentPlan.creator?.username || currentPlan.creator_id}`}
                  className="hover:underline"
                >
                  {currentPlan.creator?.full_name ||
                    currentPlan.creator?.username ||
                    "Usuario"}
                </Link>
                {" · "}
                {formatDate(currentPlan.created_at)}
              </p>
            </div>
            {isCreator && !currentPlan.is_public && currentPlan.status !== 'completado' && (
              <Button
                variant="primary"
                onClick={handlePublish}
                disabled={publishing}
              >
                <Globe className="w-4 h-4 mr-2" />
                {publishing ? "Publicando..." : "Publicar Plan"}
              </Button>
            )}
            {isCreator &&
              currentPlan.status !== "completado" &&
              currentPlan.status !== "cerrado" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleComplete}
                  disabled={completing}
                >
                  {completing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {completing
                    ? "Completando..."
                    : "Marcar viaje como completado"}
                </Button>
              )}
            {currentPlan.status === "completado" && (
              <Badge className="bg-success text-white">
                <CheckCircle className="w-3 h-3 mr-1" />
                Viaje completado
              </Badge>
            )}
            {!isCreator && isParticipant && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleMessageCreator}
              >
                <Send className="w-4 h-4" />
                Enviar mensaje al creador
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 1. Destinations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Destinos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentPlan.destinations.length === 0 ? (
            <p className="text-muted-foreground">No se han definido destinos</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {currentPlan.destinations.map((dest) => (
                <Badge key={dest} variant="default" className="text-sm px-3 py-1">
                  {dest}
                </Badge>
              ))}
            </div>
          )}
          {currentPlan.start_date && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(currentPlan.start_date)}
                {currentPlan.end_date &&
                  ` — ${formatDate(currentPlan.end_date)}`}
              </span>
              {currentPlan.flexible_dates && (
                <Badge variant="outline" className="text-xs">
                  Fechas flexibles
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Budget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Presupuesto
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentPlan.budget_range_min !== undefined ||
          currentPlan.budget_range_max !== undefined ? (
            <div className="space-y-2">
              <p className="text-lg font-semibold">
                {currentPlan.budget_range_min !== undefined
                  ? `${currentPlan.currency} ${currentPlan.budget_range_min.toLocaleString()}`
                  : "Sin mínimo"}
                {currentPlan.budget_range_max !== undefined
                  ? ` — ${currentPlan.currency} ${currentPlan.budget_range_max.toLocaleString()}`
                  : ""}
              </p>
              {currencyInfo && (
                <p className="text-sm text-muted-foreground">
                  Moneda: {currencyInfo.label}
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Presupuesto no especificado</p>
          )}
        </CardContent>
      </Card>

      {/* 3. Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Descripción
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentPlan.description ? (
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{currentPlan.description}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">Sin descripción</p>
          )}
        </CardContent>
      </Card>

      {/* 4. Comments */}
      {canViewFullContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Comentarios
            </CardTitle>
            {!currentPlan.comments_enabled && (
              <CardDescription>
                Los comentarios están deshabilitados para este plan
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <CommentList
              planId={currentPlan.id}
              currentUserId={currentUserId}
              canComment={
                currentPlan.comments_enabled && canViewFullContent
              }
            />
          </CardContent>
        </Card>
      )}

      {/* 5. Notes */}
      {(isParticipant || isCreator) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StickyNote className="w-5 h-5" />
              Notas
            </CardTitle>
            <CardDescription>
              Notas para participantes (podés marcarlas como privadas para que solo las veas vos)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NoteList
              planId={currentPlan.id}
              currentUserId={currentUserId}
            />
          </CardContent>
        </Card>
      )}

      {/* 6. Participants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Participantes ({currentPlan.current_participants ?? 0}/
            {currentPlan.max_participants ?? "∞"})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {canViewFullContent ? (
            currentPlan.participants && currentPlan.participants.length > 0 ? (
              <div className="space-y-3">
                {currentPlan.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-sm font-bold text-secondary shrink-0">
                        {(participant.user?.full_name ||
                          participant.user?.username ||
                          "U")[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {participant.user?.full_name ||
                            participant.user?.username ||
                            "Usuario"}
                          {participant.user_id === currentPlan.creator_id && (
                            <Badge
                              variant="default"
                              className="ml-2 text-xs"
                            >
                              Creador
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getPermissionLabel(participant.permission_level)} ·{" "}
                          {formatDate(participant.joined_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No hay participantes todavía
              </p>
            )
          ) : (
            <div className="text-center py-8">
              <Lock className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                Únete al plan para ver los participantes
              </p>
            </div>
          )}

          {/* Join Request Flow */}
          {!isCreator && (
            <div className="pt-4 border-t-2 border-ink dark:border-neutral-gray">
              <JoinRequestFlow
                planId={currentPlan.id}
                userId={currentUserId}
                isCreator={false}
                isParticipant={isParticipant}
                participantPermission={participantRecord?.permission_level}
                isAtCapacity={isAtCapacity}
                pendingRequests={joinRequests}
                onRequestUpdate={refreshRequests}
              />
            </div>
          )}

          {/* Creator's pending requests */}
          {isCreator && (
            <div className="pt-4 border-t-2 border-ink dark:border-neutral-gray">
              <JoinRequestFlow
                planId={currentPlan.id}
                userId={currentUserId}
                isCreator={true}
                isParticipant={true}
                participantPermission={participantRecord?.permission_level}
                isAtCapacity={isAtCapacity}
                pendingRequests={joinRequests}
                onRequestUpdate={refreshRequests}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 7. Reviews — only on completed plans */}
      {currentPlan.status === "completado" && (
        <Card>
          <CardContent className="p-6">
            <ReviewsSection
              reviews={reviews}
              average={averageRating}
              currentUserId={currentUserId}
              planId={currentPlan.id}
              canReview={isParticipant}
              reviewableParticipants={
                currentPlan.participants
                  ?.filter((p) => p.user_id !== currentUserId)
                  .map((p) => ({
                    id: p.user_id,
                    full_name: p.user?.full_name,
                    username: p.user?.username,
                  })) ?? []
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
