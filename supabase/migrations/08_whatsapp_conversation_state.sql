create table if not exists public.whatsapp_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  current_state text not null default 'menu',
  context_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists whatsapp_sessions_user_id_unique
on public.whatsapp_sessions (user_id);

alter table public.whatsapp_interactions
  add column if not exists state_at_time text;

alter table public.whatsapp_sessions enable row level security;

grant select, insert, update, delete on public.whatsapp_sessions to authenticated;

drop policy if exists "whatsapp_sessions_select_own" on public.whatsapp_sessions;
create policy "whatsapp_sessions_select_own"
on public.whatsapp_sessions for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "whatsapp_sessions_insert_own" on public.whatsapp_sessions;
create policy "whatsapp_sessions_insert_own"
on public.whatsapp_sessions for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "whatsapp_sessions_update_own" on public.whatsapp_sessions;
create policy "whatsapp_sessions_update_own"
on public.whatsapp_sessions for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "whatsapp_sessions_delete_own" on public.whatsapp_sessions;
create policy "whatsapp_sessions_delete_own"
on public.whatsapp_sessions for delete
to authenticated
using (user_id = (select auth.uid()));
