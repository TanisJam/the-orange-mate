-- Phase 4: Extend plan_comments INSERT RLS for private plan participants and creators
-- Keeps the existing public-plans INSERT policy (line 346-350 of database-schema.sql)
-- Adds a second policy that allows participants + creator to comment on private plans

create policy "Participants and creator can comment on private plans" on public.plan_comments
  for insert with check (
    auth.uid() = author_id and 
    exists (
      select 1 from public.travel_plans
      where id = plan_id and (
        creator_id = auth.uid() or
        exists (
          select 1 from public.plan_participants
          where plan_id = travel_plans.id and user_id = auth.uid()
        )
      )
    )
  );
