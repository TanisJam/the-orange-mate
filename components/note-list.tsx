"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { StickyNote, Loader2, Plane } from "lucide-react";
import { getPlanNotes, createPlanNote } from "@/lib/database-client";
import { getPlanNotes as getPlanNotesDemo } from "@/lib/demo-database";
import { useDemo } from "@/components/demo-provider";
import { toast } from "sonner";
import NoteItem from "@/components/note-item";
import type { PlanNote } from "@/lib/types";

interface NoteListProps {
  planId: string;
  currentUserId: string;
  initialNotes?: PlanNote[];
}

export default function NoteList({ planId, currentUserId, initialNotes }: NoteListProps) {
  const { isDemo, demoUser } = useDemo();
  const [notes, setNotes] = useState<PlanNote[]>(initialNotes || []);
  const [loading, setLoading] = useState(!initialNotes);
  const [newContent, setNewContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [posting, setPosting] = useState(false);

  const loadNotes = useCallback(async () => {
    if (isDemo) {
      if (initialNotes) {
        setNotes(initialNotes);
      } else {
        const data = await getPlanNotesDemo(planId);
        setNotes(data);
      }
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getPlanNotes(planId);
      setNotes(data);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [planId, isDemo, initialNotes]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleSubmit = async () => {
    const trimmed = newContent.trim();
    if (!trimmed) return;

    setPosting(true);

    if (isDemo) {
      const newNote: PlanNote = {
        id: `note-${Date.now()}`,
        plan_id: planId,
        author_id: currentUserId,
        content: trimmed,
        is_private: isPrivate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: demoUser,
      };
      setNotes((prev) => [newNote, ...prev]);
      setNewContent("");
      setIsPrivate(false);
      setPosting(false);
      toast.success("Demo mode: note added");
      return;
    }

    try {
      const created = await createPlanNote(currentUserId, {
        plan_id: planId,
        content: trimmed,
        is_private: isPrivate,
      });
      if (created) {
        setNewContent("");
        setIsPrivate(false);
        await loadNotes();
      }
    } catch {
      // silently handle
    } finally {
      setPosting(false);
    }
  };

  // Filter: hide private notes from other users
  const visibleNotes = notes.filter(
    (n) => !n.is_private || n.author_id === currentUserId
  );

  return (
    <div className="space-y-4">
      {/* Note creation form */}
      <div className="space-y-3 p-4 border-2 border-dashed border-accent rounded-lg bg-accent/5 dark:bg-accent/10">
        <Textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Escribe una nota para los participantes…"
          rows={3}
          className="min-h-[80px] text-sm"
          disabled={posting}
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
            <Checkbox
              checked={isPrivate}
              onCheckedChange={(checked) => setIsPrivate(checked === true)}
              disabled={posting}
            />
            Nota privada (solo visible para ti)
          </label>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={!newContent.trim() || posting}
          >
            {posting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : null}
            Agregar nota
          </Button>
        </div>
      </div>

      {/* Notes list */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Plane className="w-6 h-6 animate-pulse text-muted-foreground" />
        </div>
      ) : visibleNotes.length === 0 ? (
        <div className="text-center py-8">
          <StickyNote className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No hay notas. ¡Agrega una!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleNotes.map((note) => (
            <NoteItem key={note.id} note={note} currentUserId={currentUserId} />
          ))}
        </div>
      )}
    </div>
  );
}
