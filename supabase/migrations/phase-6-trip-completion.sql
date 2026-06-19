-- Phase 6: Trip completion and reviews
-- Adds 'completado' to plan_status_enum, completed_at to travel_plans,
-- edited_at to user_reviews, and updates RLS to require auth for viewing reviews.

-- 1. Add 'completado' value to plan_status_enum
ALTER TYPE plan_status_enum ADD VALUE 'completado';

-- 2. Add completed_at column to travel_plans
ALTER TABLE public.travel_plans
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- 3. Add edited_at column to user_reviews
ALTER TABLE public.user_reviews
    ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE;

-- 4. Update RLS select policy on user_reviews to require authentication
DROP POLICY IF EXISTS "Users can view all reviews" ON public.user_reviews;

CREATE POLICY "Users can view all reviews" ON public.user_reviews
    FOR SELECT USING (auth.uid() IS NOT NULL);
