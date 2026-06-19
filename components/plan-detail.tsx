"use client";

import { useState, useEffect } from "react";
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
  getPlanNotes,
  getPlanJoinRequests,
} from "@/lib/database-client";
import type { TravelPlan, PlanJoinRequest, PlanNote } from "@/lib/types";
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
  Plane,
} from "lucide-react";

interface PlanDetailProps {
  plan: TravelPlan;
  currentUserId: string;
  initialRequests: PlanJoinRequest[];
}

export function PlanDetail({
  plan,
  currentUserId,
  initialRequests,
}: PlanDetailProps) {
  const [currentPlan, setCurrentPlan] = useState<TravelPlan>(plan);
  const [notes, setNotes] = useState<PlanNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [joinRequests, setJoinRequests] =
    useState<PlanJoinRequest[]>(initialRequests);
  const [publishing, setPublishing] = useState(false);

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

  useEffect(() => {
    if (!canViewFullContent) {
      setNotes([]);
      setNotesLoading(false);
      return;
    }
    loadNotes();
  }, [currentPlan.id, canViewFullContent]);

  const loadNotes = async () => {
    setNotesLoading(true);
    try {
      const data = await getPlanNotes(currentPlan.id);
      setNotes(data);
    } catch (error) {
      console.error("Error loading notes:", error);
    } finally {
      setNotesLoading(false);
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
              <p className="text-sm text-neutral-gray">
                Creado por{" "}
                {currentPlan.creator?.full_name ||
                  currentPlan.creator?.username ||
                  "Usuario"}
                {" · "}
                {formatDate(currentPlan.created_at)}
              </p>
            </div>
            {isCreator && !currentPlan.is_public && (
              <Button
                variant="primary"
                onClick={handlePublish}
                disabled={publishing}
              >
                <Globe className="w-4 h-4 mr-2" />
                {publishing ? "Publicando..." : "Publicar Plan"}
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
            <p className="text-neutral-gray">No se han definido destinos</p>
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
            <div className="flex items-center gap-4 text-sm text-neutral-gray">
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
                <p className="text-sm text-neutral-gray">
                  Moneda: {currencyInfo.label}
                </p>
              )}
            </div>
          ) : (
            <p className="text-neutral-gray">Presupuesto no especificado</p>
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
            <p className="text-neutral-gray">Sin descripción</p>
          )}
        </CardContent>
      </Card>

      {/* 4. Comments / Notes */}
      {canViewFullContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Notas y Comentarios
            </CardTitle>
            <CardDescription>
              Notas compartidas entre los participantes del plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Plane className="w-6 h-6 animate-pulse text-neutral-gray" />
              </div>
            ) : notes.length === 0 ? (
              <p className="text-neutral-gray text-center py-8">
                No hay notas todavía. ¡Sé el primero en comentar!
              </p>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 border-2 border-neutral-black rounded-lg dark:border-neutral-gray"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {(note.author?.full_name || note.author?.username || "U")[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {note.author?.full_name ||
                              note.author?.username ||
                              "Usuario"}
                          </span>
                          {note.is_private && (
                            <Badge variant="outline" className="text-xs">
                              <Lock className="w-3 h-3 mr-1" />
                              Privada
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm mt-1 whitespace-pre-wrap">
                          {note.content}
                        </p>
                        <p className="text-xs text-neutral-gray mt-2">
                          {formatDate(note.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 5. Participants */}
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
                        <p className="text-xs text-neutral-gray">
                          {getPermissionLabel(participant.permission_level)} ·{" "}
                          {formatDate(participant.joined_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-gray text-center py-8">
                No hay participantes todavía
              </p>
            )
          ) : (
            <div className="text-center py-8">
              <Lock className="w-8 h-8 mx-auto text-neutral-gray mb-2" />
              <p className="text-neutral-gray">
                Únete al plan para ver los participantes
              </p>
            </div>
          )}

          {/* Join Request Flow */}
          {!isCreator && (
            <div className="pt-4 border-t-2 border-neutral-black dark:border-neutral-gray">
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
            <div className="pt-4 border-t-2 border-neutral-black dark:border-neutral-gray">
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
    </div>
  );
}
