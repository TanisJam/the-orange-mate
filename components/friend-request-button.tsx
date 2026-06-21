"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
} from "@/lib/database-client";
import { useDemo } from "@/components/demo-provider";
import type { FriendStatus } from "@/lib/types";

interface FriendStatusResult {
  id: string;
  status: FriendStatus;
  isSender: boolean;
}

interface FriendRequestButtonProps {
  currentUserId: string;
  profileUserId: string;
  isOwnProfile: boolean;
  initialStatus: FriendStatusResult | null;
}

export default function FriendRequestButton({
  currentUserId,
  profileUserId,
  isOwnProfile,
  initialStatus,
}: FriendRequestButtonProps) {
  const { isDemo, sendFriendRequest: demoSimSend, acceptFriendRequest: demoSimAccept } = useDemo();
  const [status, setStatus] = useState<FriendStatusResult | null>(
    initialStatus
  );
  const [loading, setLoading] = useState(false);

  if (isOwnProfile) return null;

  const handleSendRequest = async () => {
    setLoading(true);

    // ── Demo mode: simulate via demoStore ─────────────────────────────
    if (isDemo) {
      const result = demoSimSend(profileUserId);
      setLoading(false);
      if (result) {
        setStatus({
          id: result.id,
          status: "pending",
          isSender: true,
        });
        toast.success("Demo mode: solicitud enviada", { duration: 3000 });
      } else {
        toast.error("No se pudo enviar la solicitud");
      }
      return;
    }

    // ── Real mode: call Supabase ──────────────────────────────────────
    const result = await sendFriendRequest(currentUserId, profileUserId);
    setLoading(false);
    if (result) {
      setStatus({
        id: result.id,
        status: "pending",
        isSender: true,
      });
    } else {
      toast.error("No se pudo enviar la solicitud");
    }
  };

  const handleAccept = async () => {
    if (!status?.id) return;
    setLoading(true);

    // ── Demo mode: simulate via demoStore ─────────────────────────────
    if (isDemo) {
      const result = demoSimAccept(status.id);
      setLoading(false);
      if (result) {
        setStatus({
          id: status.id,
          status: "accepted",
          isSender: false,
        });
        toast.success("Demo mode: solicitud aceptada", { duration: 3000 });
      } else {
        toast.error("No se pudo aceptar la solicitud");
      }
      return;
    }

    // ── Real mode ─────────────────────────────────────────────────────
    const result = await acceptFriendRequest(status.id, currentUserId);
    setLoading(false);
    if (result) {
      setStatus({
        id: status.id,
        status: "accepted",
        isSender: false,
      });
      toast.success("Solicitud de amistad aceptada", { duration: 3000 });
    } else {
      toast.error("No se pudo aceptar la solicitud");
    }
  };

  const handleReject = async () => {
    if (!status?.id) return;
    setLoading(true);

    if (isDemo) {
      // Demo reject: just transition state locally
      setStatus({
        id: status.id,
        status: "rejected",
        isSender: false,
      });
      toast.success("Demo mode: solicitud rechazada", { duration: 3000 });
      setLoading(false);
      return;
    }

    await rejectFriendRequest(status.id, currentUserId);
    setLoading(false);
    // Transition to rejected — re-apply is allowed
    setStatus({
      id: status.id,
      status: "rejected",
      isSender: false,
    });
  };

  // No relationship → "Enviar solicitud"
  if (!status) {
    return (
      <Button
        variant="primary"
        size="sm"
        onClick={handleSendRequest}
        disabled={loading}
      >
        Enviar solicitud
      </Button>
    );
  }

  // Pending, viewer is sender → disabled "Solicitud enviada"
  if (status.status === "pending" && status.isSender) {
    return (
      <Button variant="outline" size="sm" disabled>
        Solicitud enviada
      </Button>
    );
  }

  // Pending, viewer is recipient → "Aceptar" + "Rechazar"
  if (status.status === "pending" && !status.isSender) {
    return (
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={handleAccept}
          disabled={loading}
        >
          Aceptar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReject}
          disabled={loading}
        >
          Rechazar
        </Button>
      </div>
    );
  }

  // Accepted → non-interactive "Amigos"
  if (status.status === "accepted") {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="border-accent text-accent opacity-100"
      >
        Amigos
      </Button>
    );
  }

  // Rejected → "Enviar solicitud" (can re-apply)
  if (status.status === "rejected") {
    return (
      <Button
        variant="primary"
        size="sm"
        onClick={handleSendRequest}
        disabled={loading}
      >
        Enviar solicitud
      </Button>
    );
  }

  // Blocked → hidden
  return null;
}
