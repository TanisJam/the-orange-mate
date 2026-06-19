"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Loader2, Plane } from "lucide-react";
import { getPlanComments, createPlanComment } from "@/lib/database-client";
import CommentItem from "@/components/comment-item";
import type { PlanComment } from "@/lib/types";

function buildCommentTree(comments: PlanComment[]): PlanComment[] {
  const map = new Map<string, PlanComment>();
  const roots: PlanComment[] = [];

  for (const c of comments) {
    map.set(c.id, { ...c, replies: [] });
  }

  for (const c of comments) {
    const node = map.get(c.id)!;
    if (c.parent_comment_id) {
      const parent = map.get(c.parent_comment_id);
      if (parent && !parent.parent_comment_id) {
        parent.replies!.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  return roots;
}

interface CommentListProps {
  planId: string;
  currentUserId: string;
  canComment: boolean;
}

export default function CommentList({
  planId,
  currentUserId,
  canComment,
}: CommentListProps) {
  const [comments, setComments] = useState<PlanComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");
  const [posting, setPosting] = useState(false);

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPlanComments(planId);
      setComments(data);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async () => {
    const trimmed = newContent.trim();
    if (!trimmed) return;

    setPosting(true);
    try {
      const created = await createPlanComment(currentUserId, {
        plan_id: planId,
        content: trimmed,
      });
      if (created) {
        setNewContent("");
        await loadComments();
      }
    } catch {
      // silently handle
    } finally {
      setPosting(false);
    }
  };

  const tree = buildCommentTree(comments);

  return (
    <div className="space-y-4">
      {/* Comment form */}
      {canComment && (
        <div className="flex gap-2 items-start">
          <Textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Escribe un comentario…"
            rows={2}
            className="min-h-[50px] text-sm"
            disabled={posting}
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={!newContent.trim() || posting}
            className="shrink-0"
          >
            {posting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Comentar"
            )}
          </Button>
        </div>
      )}

      {/* Comments thread */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Plane className="w-6 h-6 animate-pulse text-neutral-gray" />
        </div>
      ) : tree.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="w-10 h-10 mx-auto text-neutral-gray mb-2" />
          <p className="text-neutral-gray">
            No hay comentarios aún. ¡Sé el primero!
          </p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-gray/20">
          {tree.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              planId={planId}
              canReply={canComment}
              onCommentChanged={loadComments}
            />
          ))}
        </div>
      )}
    </div>
  );
}
