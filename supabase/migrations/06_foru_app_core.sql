create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'premium')),
  streak integer not null default 0,
  coins integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'paused', 'blocked', 'completed')),
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id text primary key default gen_random_uuid()::text,
  project_id text not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'doing', 'done')),
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  estimated_time integer default 15,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ideas (
  id text primary key default gen_random_uuid()::text,
  project_id text not null references public.projects(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.ideas enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant select, insert, update, delete on public.ideas to authenticated;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (id = (select auth.uid()));

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (id = (select auth.uid()));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
on public.profiles for delete
to authenticated
using (id = (select auth.uid()));

drop policy if exists "projects_select_own" on public.projects;
create policy "projects_select_own"
on public.projects for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own"
on public.projects for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "projects_update_own" on public.projects;
create policy "projects_update_own"
on public.projects for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "projects_delete_own" on public.projects;
create policy "projects_delete_own"
on public.projects for delete
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "tasks_select_own_project" on public.tasks;
create policy "tasks_select_own_project"
on public.tasks for select
to authenticated
using (
  exists (
    select 1 from public.projects
    where projects.id = tasks.project_id
      and projects.user_id = (select auth.uid())
  )
);

drop policy if exists "tasks_insert_own_project" on public.tasks;
create policy "tasks_insert_own_project"
on public.tasks for insert
to authenticated
with check (
  exists (
    select 1 from public.projects
    where projects.id = tasks.project_id
      and projects.user_id = (select auth.uid())
  )
);

drop policy if exists "tasks_update_own_project" on public.tasks;
create policy "tasks_update_own_project"
on public.tasks for update
to authenticated
using (
  exists (
    select 1 from public.projects
    where projects.id = tasks.project_id
      and projects.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.projects
    where projects.id = tasks.project_id
      and projects.user_id = (select auth.uid())
  )
);

drop policy if exists "tasks_delete_own_project" on public.tasks;
create policy "tasks_delete_own_project"
on public.tasks for delete
to authenticated
using (
  exists (
    select 1 from public.projects
    where projects.id = tasks.project_id
      and projects.user_id = (select auth.uid())
  )
);

drop policy if exists "ideas_select_own_project" on public.ideas;
create policy "ideas_select_own_project"
on public.ideas for select
to authenticated
using (
  exists (
    select 1 from public.projects
    where projects.id = ideas.project_id
      and projects.user_id = (select auth.uid())
  )
);

drop policy if exists "ideas_insert_own_project" on public.ideas;
create policy "ideas_insert_own_project"
on public.ideas for insert
to authenticated
with check (
  exists (
    select 1 from public.projects
    where projects.id = ideas.project_id
      and projects.user_id = (select auth.uid())
  )
);

drop policy if exists "ideas_update_own_project" on public.ideas;
create policy "ideas_update_own_project"
on public.ideas for update
to authenticated
using (
  exists (
    select 1 from public.projects
    where projects.id = ideas.project_id
      and projects.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.projects
    where projects.id = ideas.project_id
      and projects.user_id = (select auth.uid())
  )
);

drop policy if exists "ideas_delete_own_project" on public.ideas;
create policy "ideas_delete_own_project"
on public.ideas for delete
to authenticated
using (
  exists (
    select 1 from public.projects
    where projects.id = ideas.project_id
      and projects.user_id = (select auth.uid())
  )
);
