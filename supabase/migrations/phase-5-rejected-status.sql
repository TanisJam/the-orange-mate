-- Phase 5: Add 'rejected' to user_friends.status check constraint
-- The original inline CHECK constraint only allows ('pending', 'accepted', 'blocked').
-- This migration adds 'rejected' so users can reject friend requests without deleting the row.

DO $$
DECLARE
    constraint_name_var text;
BEGIN
    SELECT con.conname INTO constraint_name_var
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'user_friends'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) LIKE '%status%';

    IF constraint_name_var IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.user_friends DROP CONSTRAINT %I', constraint_name_var);
    END IF;
END;
$$;

ALTER TABLE public.user_friends
    ADD CONSTRAINT user_friends_status_check
    CHECK (status IN ('pending', 'accepted', 'blocked', 'rejected'));
