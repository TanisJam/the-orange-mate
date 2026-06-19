"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, CornerDownRight, Loader2 } from "lucide-react";
import { createPlanComment, deletePlanComment } from "@/lib/database-client";
import type { PlanComment } from "@/lib/types";

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHour < 24) return `Hace ${diffHour}h`;
  if (diffDay < 7) return `Hace ${diffDay}d`;

  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface CommentItemProps {
  comment: PlanComment & { replies?: PlanComment[] };
  currentUserId: string;
  planId: string;
  canReply?: boolean;
  isReply?: boolean;
  onCommentChanged: () => void;
}

export default function CommentItem({
  comment,
  currentUserId,
  planId,
  canReply = true,
  isReply = false,
  onCommentChanged,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const isOwn = comment.author_id === currentUserId;
  const author = comment.author;
  const authorInitial = (author?.full_name || author?.username || "U")[0];

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "¿Eliminar este comentario? Esta acción también eliminará sus respuestas.",
    );
    if (!confirmed) return;
    setDeleting(true);
    try {
      const ok = await deletePlanComment(comment.id);
      if (ok) {
        setIsDeleted(true);
        onCommentChanged();
      }
    } catch {
      // silently handle
    } finally {
      setDeleting(false);
    }
  };

  const handleReplySubmit = async () => {
    const trimmed = replyContent.trim();
    if (!trimmed) return;

    setPosting(true);
    try {
      const created = await createPlanComment(currentUserId, {
        plan_id: planId,
        content: trimmed,
        parent_comment_id: comment.id,
      });
      if (created) {
        setReplyContent("");
        setShowReplyForm(false);
        onCommentChanged();
      }
    } catch {
      // silently handle
    } finally {
      setPosting(false);
    }
  };

  if (isDeleted) return null;

  return (
    <div className={isReply ? "ml-8 border-l-2 border-neutral-gray pl-4" : ""}>
      <div className="flex items-start gap-3 py-3">
        {/* Avatar */}
        <Link href={`/profile/${author?.username || comment.author_id}`}>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
            {authorInitial}
          </div>
        </Link>

        {/* Body */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${author?.username || comment.author_id}`}
              className="font-semibold text-sm hover:underline"
            >
              {author?.full_name || author?.username || "Usuario"}
            </Link>
            <span className="text-xs text-neutral-gray">
              {formatRelativeDate(comment.created_at)}
            </span>
          </div>

          {/* Content */}
          <p
            className={`text-sm mt-1 whitespace-pre-wrap ${
              isReply ? "text-neutral-gray" : "text-neutral-black dark:text-neutral-white"
            }`}
          >
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-1.5">
            {/* Reply button — only for top-level comments (cap at 2 levels) */}
            {!isReply && canReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-neutral-gray hover:text-primary"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <CornerDownRight className="w-3.5 h-3.5 mr-1" />
                Responder
              </Button>
            )}

            {/* Delete button — only for own comments */}
            {isOwn && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-error hover:text-error/80"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                )}
                Eliminar
              </Button>
            )}
          </div>

          {/* Reply form */}
          {showReplyForm && canReply && (
            <div className="mt-2 flex gap-2 items-start">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Escribe una respuesta…"
                rows={2}
                className="min-h-[40px] text-sm"
                disabled={posting}
              />
              <div className="flex flex-col gap-1 shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleReplySubmit}
                  disabled={!replyContent.trim() || posting}
                >
                  {posting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    "Enviar"
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setShowReplyForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-0">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              planId={planId}
              isReply
              onCommentChanged={onCommentChanged}
            />
          ))}
        </div>
      )}
    </div>
  );
}
