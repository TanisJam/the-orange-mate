-- SoloTravelers Database Schema
-- Execute this in your Supabase SQL Editor

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Enums for better type safety
create type plan_type_enum as enum (
  'alojamiento',
  'actividad', 
  'viaje_completo',
  'transporte',
  'salida_local'
);

create type plan_status_enum as enum (
  'buscando_companero',
  'planeado',
  'flexible',
  'tentativo',
  'cerrado',
  'completado'
);

create type permission_level_enum as enum (
  'solo_ver',
  'agregar_notas_privadas',
  'sugerir_cambios',
  'editar'
);

create type notification_event_type_enum as enum (
  'friend_accepted',
  'new_message',
  'comment_reply',
  'join_accepted',
  'review_received'
);

-- User profiles table
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  age integer check (age >= 18 and age <= 100),
  country text,
  city text,
  phone text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Predefined interests/badges
create table public.interests (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  icon text, -- for icon class/emoji
  is_predefined boolean default true,
  created_at timestamp with time zone default now()
);

-- User interests (many-to-many relationship)
create table public.user_interests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.user_profiles(id) on delete cascade,
  interest_id uuid references public.interests(id) on delete cascade,
  is_custom boolean default false,
  custom_name text, -- for custom badges
  created_at timestamp with time zone default now(),
  unique(user_id, interest_id)
);

-- User photo gallery
create table public.user_photos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.user_profiles(id) on delete cascade,
  photo_url text not null,
  caption text,
  is_profile_photo boolean default false,
  display_order integer default 0,
  created_at timestamp with time zone default now()
);

-- Travel plans
create table public.travel_plans (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid references public.user_profiles(id) on delete cascade,
  title text not null,
  plan_type plan_type_enum not null,
  destinations text[] not null, -- array of destinations
  start_date date,
  end_date date,
  flexible_dates boolean default false,
  status plan_status_enum default 'buscando_companero',
  description text,
  max_participants integer default 1,
  current_participants integer default 1,
  share_accommodation boolean default false,
  share_transport boolean default false,
  share_tours boolean default false,
  budget_range_min decimal(10,2),
  budget_range_max decimal(10,2),
  currency text default 'USD',
  is_public boolean default true,
  comments_enabled boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

-- Plan participants (who joined the plan)
create table public.plan_participants (
  id uuid primary key default uuid_generate_v4(),
  plan_id uuid references public.travel_plans(id) on delete cascade,
  user_id uuid references public.user_profiles(id) on delete cascade,
  permission_level permission_level_enum default 'solo_ver',
  joined_at timestamp with time zone default now(),
  invited_by uuid references public.user_profiles(id),
  unique(plan_id, user_id)
);

-- Plan notes (private/public notes for each plan)
create table public.plan_notes (
  id uuid primary key default uuid_generate_v4(),
  plan_id uuid references public.travel_plans(id) on delete cascade,
  author_id uuid references public.user_profiles(id) on delete cascade,
  content text not null,
  is_private boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Plan comments (public comments on plans)
create table public.plan_comments (
  id uuid primary key default uuid_generate_v4(),
  plan_id uuid references public.travel_plans(id) on delete cascade,
  author_id uuid references public.user_profiles(id) on delete cascade,
  content text not null,
  parent_comment_id uuid references public.plan_comments(id) on delete cascade, -- for replies
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Plan join requests
create table public.plan_join_requests (
  id uuid primary key default uuid_generate_v4(),
  plan_id uuid references public.travel_plans(id) on delete cascade,
  requester_id uuid references public.user_profiles(id) on delete cascade,
  message text,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected', 'waiting_list')),
  created_at timestamp with time zone default now(),
  responded_at timestamp with time zone,
  unique(plan_id, requester_id)
);

-- Friends/contacts system
create table public.user_friends (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.user_profiles(id) on delete cascade,
  friend_id uuid references public.user_profiles(id) on delete cascade,
  status text default 'pending' check (status in ('pending', 'accepted', 'blocked')),
  created_at timestamp with time zone default now(),
  unique(user_id, friend_id),
  check (user_id != friend_id)
);

-- Chat system
create table public.chats (
  id uuid primary key default uuid_generate_v4(),
  participant_1_id uuid references public.user_profiles(id) on delete cascade,
  participant_2_id uuid references public.user_profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(participant_1_id, participant_2_id),
  check (participant_1_id != participant_2_id)
);

-- Messages
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  chat_id uuid references public.chats(id) on delete cascade,
  sender_id uuid references public.user_profiles(id) on delete cascade,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- User reviews (for future implementation)
create table public.user_reviews (
  id uuid primary key default uuid_generate_v4(),
  reviewer_id uuid references public.user_profiles(id) on delete cascade,
  reviewed_id uuid references public.user_profiles(id) on delete cascade,
  plan_id uuid references public.travel_plans(id) on delete cascade,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default now(),
  edited_at timestamp with time zone,
  unique(reviewer_id, reviewed_id, plan_id),
  check (reviewer_id != reviewed_id)
);

-- Notifications
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  actor_id uuid not null references public.user_profiles(id) on delete cascade,
  type notification_event_type_enum not null,
  title text not null,
  body text not null,
  link text,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- Indexes for better performance
create index idx_user_profiles_username on public.user_profiles(username);
create index idx_user_profiles_country on public.user_profiles(country);
create index idx_travel_plans_creator on public.travel_plans(creator_id);
create index idx_travel_plans_status on public.travel_plans(status);
create index idx_travel_plans_dates on public.travel_plans(start_date, end_date);
create index idx_travel_plans_destinations on public.travel_plans using gin(destinations);
create index idx_plan_participants_plan on public.plan_participants(plan_id);
create index idx_plan_participants_user on public.plan_participants(user_id);
create index idx_messages_chat on public.messages(chat_id);
create index idx_messages_created on public.messages(created_at);
create index idx_notif_user_unread on public.notifications(user_id, is_read)
  where is_read = false;
create index idx_notif_user_created on public.notifications(user_id, created_at desc);

-- Insert predefined interests
insert into public.interests (name, icon) values
  ('Aventura', '🏔️'),
  ('Cultura', '🏛️'),
  ('Gastronomía', '🍽️'),
  ('Naturaleza', '🌲'),
  ('Fotografía', '📸'),
  ('Historia', '📚'),
  ('Deportes', '⚽'),
  ('Playa', '🏖️'),
  ('Montaña', '⛰️'),
  ('Ciudad', '🏙️'),
  ('Mochilero', '🎒'),
  ('Lujo', '💎'),
  ('Económico', '💰'),
  ('Vida nocturna', '🌙'),
  ('Arte', '🎨'),
  ('Música', '🎵'),
  ('Arquitectura', '🏗️'),
  ('Religión', '⛪'),
  ('Compras', '🛍️'),
  ('Spa/Relax', '🧘');

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
alter table public.user_profiles enable row level security;
alter table public.interests enable row level security;
alter table public.user_interests enable row level security;
alter table public.user_photos enable row level security;
alter table public.travel_plans enable row level security;
alter table public.plan_participants enable row level security;
alter table public.plan_notes enable row level security;
alter table public.plan_comments enable row level security;
alter table public.plan_join_requests enable row level security;
alter table public.user_friends enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;
alter table public.user_reviews enable row level security;
alter table public.notifications enable row level security;

-- Replica identity and realtime publication for notifications
alter table public.notifications replica identity full;
alter publication supabase_realtime add table public.notifications;

-- User profiles policies
create policy "Users can view all profiles" on public.user_profiles
  for select using (true);

create policy "Users can update own profile" on public.user_profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.user_profiles
  for insert with check (auth.uid() = id);

-- Interests policies (read-only for most users)
create policy "Anyone can view interests" on public.interests
  for select using (true);

-- User interests policies
create policy "Users can view all user interests" on public.user_interests
  for select using (true);

create policy "Users can manage own interests" on public.user_interests
  for all using (auth.uid() = user_id);

-- User photos policies
create policy "Users can view all photos" on public.user_photos
  for select using (true);

create policy "Users can manage own photos" on public.user_photos
  for all using (auth.uid() = user_id);

-- Travel plans policies
create policy "Users can view public plans" on public.travel_plans
  for select using (
    is_public = true
    or creator_id = auth.uid() or 
    exists (
      select 1 from public.plan_participants pp
      where pp.plan_id = travel_plans.id and pp.user_id = auth.uid()
    )
  );

create policy "Users can create plans" on public.travel_plans
  for insert with check (auth.uid() = creator_id);

create policy "Creators can update own plans" on public.travel_plans
  for update using (auth.uid() = creator_id);

create policy "Creators can delete own plans" on public.travel_plans
  for delete using (auth.uid() = creator_id);

-- Plan participants policies
create policy "Users can view plan participants" on public.plan_participants
  for select using (
    exists (
      select 1 from public.travel_plans tp
      where tp.id = plan_participants.plan_id and (
        tp.is_public = true or tp.creator_id = auth.uid() or
        exists (
          select 1 from public.plan_participants pp
          where pp.plan_id = tp.id and pp.user_id = auth.uid()
        )
      )
    )
  );

create policy "Plan creators can manage participants" on public.plan_participants
  for all using (exists (select 1 from public.travel_plans where id = plan_id and creator_id = auth.uid()));

-- Plan notes policies
create policy "Users can view plan notes" on public.plan_notes
  for select using (
    (not is_private) or 
    (author_id = auth.uid()) or 
    exists (select 1 from public.travel_plans where id = plan_id and creator_id = auth.uid()) or
    exists (select 1 from public.plan_participants where plan_id = plan_notes.plan_id and user_id = auth.uid())
  );

create policy "Users can create notes in accessible plans" on public.plan_notes
  for insert with check (
    auth.uid() = author_id and 
    (exists (select 1 from public.travel_plans where id = plan_id and creator_id = auth.uid()) or
     exists (select 1 from public.plan_participants where plan_id = plan_notes.plan_id and user_id = auth.uid()))
  );

create policy "Authors can update own notes" on public.plan_notes
  for update using (auth.uid() = author_id);

create policy "Authors can delete own notes" on public.plan_notes
  for delete using (auth.uid() = author_id);

-- Plan comments policies
create policy "Users can view comments on accessible plans" on public.plan_comments
  for select using (
    exists (
      select 1 from public.travel_plans
      where id = plan_id and (
        is_public = true or
        creator_id = auth.uid() or
        exists (select 1 from public.plan_participants where plan_id = travel_plans.id and user_id = auth.uid())
      )
    )
  );

create policy "Users can create comments on public plans" on public.plan_comments
  for insert with check (
    auth.uid() = author_id and 
    exists (select 1 from public.travel_plans where id = plan_id and is_public = true and comments_enabled = true)
  );

create policy "Authors can update own comments" on public.plan_comments
  for update using (auth.uid() = author_id);

create policy "Authors can delete own comments" on public.plan_comments
  for delete using (auth.uid() = author_id);

-- Plan join requests policies
create policy "Users can view requests for their plans" on public.plan_join_requests
  for select using (
    requester_id = auth.uid() or 
    exists (select 1 from public.travel_plans where id = plan_id and creator_id = auth.uid())
  );

create policy "Users can create join requests" on public.plan_join_requests
  for insert with check (auth.uid() = requester_id);

create policy "Plan creators can update requests" on public.plan_join_requests
  for update using (exists (select 1 from public.travel_plans where id = plan_id and creator_id = auth.uid()));

-- Friends policies
create policy "Users can view their friendships" on public.user_friends
  for select using (user_id = auth.uid() or friend_id = auth.uid());

create policy "Users can create friendships" on public.user_friends
  for insert with check (auth.uid() = user_id);

create policy "Users can update their friendships" on public.user_friends
  for update using (user_id = auth.uid() or friend_id = auth.uid());

-- Chat policies
create policy "Users can view their chats" on public.chats
  for select using (participant_1_id = auth.uid() or participant_2_id = auth.uid());

create policy "Users can create chats" on public.chats
  for insert with check (participant_1_id = auth.uid() or participant_2_id = auth.uid());

-- Messages policies
create policy "Users can view messages in their chats" on public.messages
  for select using (
    exists (select 1 from public.chats where id = chat_id and 
      (participant_1_id = auth.uid() or participant_2_id = auth.uid()))
  );

create policy "Users can send messages in their chats" on public.messages
  for insert with check (
    auth.uid() = sender_id and 
    exists (select 1 from public.chats where id = chat_id and 
      (participant_1_id = auth.uid() or participant_2_id = auth.uid()))
  );

-- User reviews policies
create policy "Users can view all reviews" on public.user_reviews
  for select using (auth.uid() IS NOT NULL);

create policy "Users can create reviews" on public.user_reviews
  for insert with check (
    auth.uid() = reviewer_id
    and exists (
      select 1 from public.travel_plans
      where id = plan_id and status = 'completado'
    )
    and exists (
      select 1 from public.plan_participants
      where plan_id = user_reviews.plan_id and user_id = reviewer_id
    )
    and exists (
      select 1 from public.plan_participants
      where plan_id = user_reviews.plan_id and user_id = reviewed_id
    )
  );

create policy "Users can update own reviews" on public.user_reviews
  for update using (auth.uid() = reviewer_id)
  with check (auth.uid() = reviewer_id);

-- Notifications policies
create policy "Users can view own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can insert notifications as themselves" on public.notifications
  for insert with check (auth.uid() = actor_id and is_read = false);

create policy "Users can update own notification read status" on public.notifications
  for update using (auth.uid() = user_id);

-- Functions for automatic profile creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to get chat between two users
create or replace function public.get_or_create_chat(user1_id uuid, user2_id uuid)
returns uuid as $$
declare
  chat_id uuid;
begin
  -- Try to find existing chat
  select id into chat_id
  from public.chats
  where (participant_1_id = user1_id and participant_2_id = user2_id)
     or (participant_1_id = user2_id and participant_2_id = user1_id);
  
  -- If no chat exists, create one
  if chat_id is null then
    insert into public.chats (participant_1_id, participant_2_id)
    values (least(user1_id, user2_id), greatest(user1_id, user2_id))
    returning id into chat_id;
  end if;
  
  return chat_id;
end;
$$ language plpgsql security definer;

-- Function to update travel plan updated_at timestamp
create or replace function public.update_travel_plan_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for travel plans updated_at
create trigger update_travel_plan_timestamp
  before update on public.travel_plans
  for each row execute procedure public.update_travel_plan_timestamp();

-- Trigger for user profiles updated_at
create trigger update_user_profile_timestamp
  before update on public.user_profiles
  for each row execute procedure public.update_travel_plan_timestamp();

-- Notification cleanup: remove notifications older than 360 days
create or replace function public.cleanup_old_notifications()
returns void language plpgsql security definer as $$
begin
  delete from public.notifications where created_at < now() - interval '360 days';
end; $$;

-- Schedule cleanup daily at 3 AM (requires pg_cron extension)
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('cleanup-notifications', '0 3 * * *',
      'select public.cleanup_old_notifications();');
  end if;
end $$;