create table if not exists public.project_feelings (
  id uuid primary key default gen_random_uuid(),
  project_id text not null references public.projects(id) on delete cascade,
  feeling_type text not null,
  created_at timestamptz not null default now(),
  unique (project_id, feeling_type)
);

create table if not exists public.daily_mood (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  mood text not null,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, date, mood)
);

create table if not exists public.rewiring_habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  habit text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.projects
  add column if not exists tangible_goal text;

alter table public.tasks
  add column if not exists feeling_type text;

alter table public.project_feelings enable row level security;
alter table public.daily_mood enable row level security;
alter table public.rewiring_habits enable row level security;

grant select, insert, update, delete on public.project_feelings to authenticated;
grant select, insert, update, delete on public.daily_mood to authenticated;
grant select, insert, update, delete on public.rewiring_habits to authenticated;

drop policy if exists "project_feelings_select_own_project" on public.project_feelings;
create policy "project_feelings_select_own_project"
on public.project_feelings for select
to authenticated
using (
  exists (
    select 1 from public.projects
    where projects.id = project_feelings.project_id
      and projects.user_id = (select auth.uid())
  )
);

drop policy if exists "project_feelings_insert_own_project" on public.project_feelings;
create policy "project_feelings_insert_own_project"
on public.project_feelings for insert
to authenticated
with check (
  exists (
    select 1 from public.projects
    where projects.id = project_feelings.project_id
      and projects.user_id = (select auth.uid())
  )
);

drop policy if exists "project_feelings_update_own_project" on public.project_feelings;
create policy "project_feelings_update_own_project"
on public.project_feelings for update
to authenticated
using (
  exists (
    select 1 from public.projects
    where projects.id = project_feelings.project_id
      and projects.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.projects
    where projects.id = project_feelings.project_id
      and projects.user_id = (select auth.uid())
  )
);

drop policy if exists "project_feelings_delete_own_project" on public.project_feelings;
create policy "project_feelings_delete_own_project"
on public.project_feelings for delete
to authenticated
using (
  exists (
    select 1 from public.projects
    where projects.id = project_feelings.project_id
      and projects.user_id = (select auth.uid())
  )
);

drop policy if exists "daily_mood_select_own" on public.daily_mood;
create policy "daily_mood_select_own"
on public.daily_mood for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "daily_mood_insert_own" on public.daily_mood;
create policy "daily_mood_insert_own"
on public.daily_mood for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "daily_mood_update_own" on public.daily_mood;
create policy "daily_mood_update_own"
on public.daily_mood for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "daily_mood_delete_own" on public.daily_mood;
create policy "daily_mood_delete_own"
on public.daily_mood for delete
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "rewiring_habits_select_own" on public.rewiring_habits;
create policy "rewiring_habits_select_own"
on public.rewiring_habits for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "rewiring_habits_insert_own" on public.rewiring_habits;
create policy "rewiring_habits_insert_own"
on public.rewiring_habits for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "rewiring_habits_update_own" on public.rewiring_habits;
create policy "rewiring_habits_update_own"
on public.rewiring_habits for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "rewiring_habits_delete_own" on public.rewiring_habits;
create policy "rewiring_habits_delete_own"
on public.rewiring_habits for delete
to authenticated
using (user_id = (select auth.uid()));
