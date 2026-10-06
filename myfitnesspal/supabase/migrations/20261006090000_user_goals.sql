-- Per-user daily targets, set from the app's settings screen.
-- Matches userGoals in backend/src/db/schema.ts.
create table public.user_goals (
  user_id uuid primary key references public.users (id) on delete cascade,
  calories integer not null,
  carbs integer not null,
  fat integer not null,
  protein integer not null,
  updated_at timestamp not null default now()
);

-- Same as users and food_entries: RLS on with no policies, so the public
-- key cannot touch the table. Only the api Edge Function reads and writes it.
alter table public.user_goals enable row level security;
