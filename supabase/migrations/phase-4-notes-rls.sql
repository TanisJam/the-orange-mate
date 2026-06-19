-- Phase 4: Fix plan_notes SELECT RLS — restrict private notes to author only
-- The original policy allowed participants/creator to read ALL notes including private ones.
-- This replaces it so only the author can read is_private=true notes.

drop policy if exists "Users can view plan notes" on public.plan_notes;

create policy "Users can view plan notes" on public.plan_notes
  for select using (
    author_id = auth.uid() or
    (not is_private and (
      exists (select 1 from public.travel_plans where id = plan_id and creator_id = auth.uid()) or
      exists (select 1 from public.plan_participants where plan_id = plan_notes.plan_id and user_id = auth.uid())
    ))
  );
