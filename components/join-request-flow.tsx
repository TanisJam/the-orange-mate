"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createJoinRequest, updateJoinRequest } from "@/lib/database-client";
import type { PlanJoinRequest, PermissionLevel } from "@/lib/types";
import { PERMISSION_LEVELS } from "@/lib/types";
import { UserPlus, Check, X, Clock, MessageSquare, Users } from "lucide-react";

interface JoinRequestFlowProps {
  planId: string;
  userId: string;
  isCreator: boolean;
  isParticipant: boolean;
  participantPermission?: PermissionLevel;
  isAtCapacity: boolean;
  pendingRequests: PlanJoinRequest[];
  onRequestUpdate: () => void;
}

export function JoinRequestFlow({
  planId,
  userId,
  isCreator,
  isParticipant,
  participantPermission,
  isAtCapacity,
  pendingRequests,
  onRequestUpdate,
}: JoinRequestFlowProps) {
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [acceptPermission, setAcceptPermission] =
    useState<PermissionLevel>("solo_ver");
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const handleJoinRequest = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await createJoinRequest(userId, {
        plan_id: planId,
        message: message.trim() || undefined,
        status: isAtCapacity ? "waiting_list" : "pending",
      });
      if (result) {
        setSuccess(
          isAtCapacity
            ? "Te has unido a la lista de espera. El creador será notificado cuando haya un lugar."
            : "Solicitud enviada. El creador del plan la revisará pronto."
        );
        setShowJoinForm(false);
        setMessage("");
        onRequestUpdate();
      } else {
        setError("Error al enviar la solicitud. Inténtalo de nuevo.");
      }
    } catch {
      setError("Error inesperado. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    setProcessingIds((prev) => new Set(prev).add(requestId));
    try {
      await updateJoinRequest(requestId, "accepted", acceptPermission, userId);
      setAcceptingId(null);
      setAcceptPermission("solo_ver");
      onRequestUpdate();
    } catch {
      setError("Error al aceptar la solicitud.");
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingIds((prev) => new Set(prev).add(requestId));
    try {
      await updateJoinRequest(requestId, "rejected", "solo_ver", userId);
      onRequestUpdate();
    } catch {
      setError("Error al rechazar la solicitud.");
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  // Creator view: pending requests to manage
  if (isCreator) {
    const pending = pendingRequests.filter((r) => r.status === "pending");

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Solicitudes de Unión ({pending.length})
          </CardTitle>
          <CardDescription>
            Revisa y gestiona las solicitudes para unirse a tu plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 border-2 border-error bg-error/10 rounded-[--radius]">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {pending.length === 0 ? (
            <p className="text-neutral-gray text-center py-4">
              No hay solicitudes pendientes
            </p>
          ) : (
            pending.map((request) => (
              <div
                key={request.id}
                className="p-4 border-2 border-neutral-black rounded-lg dark:border-neutral-gray"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">
                      {request.requester?.full_name ||
                        request.requester?.username ||
                        "Usuario"}
                    </p>
                    {request.message && (
                      <div className="flex items-start gap-1 mt-1 text-sm text-neutral-gray">
                        <MessageSquare className="w-4 h-4 mt-0.5 shrink-0" />
                        <p className="break-words">{request.message}</p>
                      </div>
                    )}
                    <p className="text-xs text-neutral-gray mt-1">
                      {new Date(request.created_at).toLocaleDateString(
                        "es-ES",
                        { dateStyle: "medium" }
                      )}
                    </p>
                  </div>

                  {acceptingId === request.id ? (
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Select
                        value={acceptPermission}
                        onValueChange={(v) =>
                          setAcceptPermission(v as PermissionLevel)
                        }
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PERMISSION_LEVELS.map((pl) => (
                            <SelectItem key={pl.value} value={pl.value}>
                              {pl.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleAccept(request.id)}
                          disabled={processingIds.has(request.id)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAcceptingId(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setAcceptingId(request.id)}
                        disabled={processingIds.has(request.id)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Aceptar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(request.id)}
                        disabled={processingIds.has(request.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Rechazar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    );
  }

  // Participant view
  if (isParticipant) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Badge variant="default" className="text-sm px-3 py-1">
              <Check className="w-4 h-4 mr-1" />
              Eres participante
            </Badge>
            {participantPermission && (
              <span className="text-sm text-neutral-gray">
                —
                {PERMISSION_LEVELS.find(
                  (p) => p.value === participantPermission
                )?.label || participantPermission}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Non-participant view: join request button or status display
  const currentRequest = pendingRequests.find(
    (r) => r.requester_id === userId
  );

  return (
    <Card>
      <CardContent className="p-6">
        {error && (
          <div className="p-3 border-2 border-error bg-error/10 rounded-[--radius] mb-4">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 border-2 border-primary bg-primary/10 rounded-[--radius] mb-4">
            <p className="text-sm text-primary">{success}</p>
          </div>
        )}

        {currentRequest ? (
          <div className="space-y-3">
            {currentRequest.status === "pending" && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent shrink-0" />
                <div>
                  <p className="font-medium">Solicitud pendiente</p>
                  <p className="text-sm text-neutral-gray">
                    El creador revisará tu solicitud pronto
                  </p>
                </div>
              </div>
            )}
            {currentRequest.status === "waiting_list" && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent shrink-0" />
                <div>
                  <p className="font-medium">En lista de espera</p>
                  <p className="text-sm text-neutral-gray">
                    El plan está completo. Recibirás una notificación si hay un
                    lugar disponible.
                  </p>
                </div>
              </div>
            )}
            {currentRequest.status === "rejected" && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <X className="w-5 h-5 text-error shrink-0" />
                  <div>
                    <p className="font-medium">Solicitud rechazada</p>
                    <p className="text-sm text-neutral-gray">
                      Puedes volver a solicitarlo
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowJoinForm(true)}
                >
                  Volver a solicitar
                </Button>
              </div>
            )}
          </div>
        ) : showJoinForm ? (
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Solicitar Unirse
            </h4>

            {isAtCapacity && (
              <div className="flex items-start gap-2 p-3 border-2 border-accent bg-accent/10 rounded-[--radius]">
                <Clock className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <p className="text-sm">
                  Este plan está completo. Tu solicitud entrará en la lista de
                  espera.
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="join-message">Mensaje (opcional)</Label>
              <Textarea
                id="join-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Preséntate brevemente al creador del plan..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowJoinForm(false);
                  setMessage("");
                  setError(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleJoinRequest}
                disabled={submitting}
              >
                {submitting ? "Enviando..." : "Enviar Solicitud"}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="primary"
            className="w-full"
            onClick={() => setShowJoinForm(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Solicitar Unirse
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
