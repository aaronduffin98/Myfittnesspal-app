-- Weigh-ins for the Progress tab, one per user per day.
-- Matches weightEntries in backend/src/db/schema.ts.
create table public.weight_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  weight_kg numeric(5, 2) not null,
  logged_date date not null,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

create unique index weight_entries_user_id_logged_date_key
  on public.weight_entries (user_id, logged_date);

-- Same as the other tables: RLS on with no policies, so only the api
-- Edge Function can read and write it.
alter table public.weight_entries enable row level security;
