"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import type { PlanNote } from "@/lib/types";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface NoteItemProps {
  note: PlanNote;
  currentUserId: string;
}

export default function NoteItem({ note, currentUserId }: NoteItemProps) {
  const isOwn = note.author_id === currentUserId;
  const author = note.author;
  const authorInitial = (author?.full_name || author?.username || "U")[0];

  return (
    <div className="p-4 border-2 border-accent rounded-lg bg-accent/5 dark:bg-accent/10">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Link href={`/profile/${author?.username || note.author_id}`}>
          <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-sm font-bold text-secondary shrink-0">
            {authorInitial}
          </div>
        </Link>

        {/* Body */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${author?.username || note.author_id}`}
              className="font-semibold text-sm hover:underline"
            >
              {author?.full_name || author?.username || "Usuario"}
            </Link>
            {note.is_private && isOwn && (
              <Badge variant="outline" className="text-xs border-error text-error">
                <Lock className="w-3 h-3 mr-1" />
                Privada
              </Badge>
            )}
          </div>

          {/* Content */}
          <p className="text-sm mt-1 whitespace-pre-wrap text-neutral-black dark:text-neutral-white">
            {note.content}
          </p>

          {/* Timestamp */}
          <p className="text-xs text-neutral-gray mt-2">
            {formatDate(note.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}
