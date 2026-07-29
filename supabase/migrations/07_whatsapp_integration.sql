alter table public.profiles
  add column if not exists whatsapp_number text,
  add column if not exists whatsapp_enabled boolean not null default false;

create unique index if not exists profiles_whatsapp_number_unique
on public.profiles (whatsapp_number)
where whatsapp_number is not null;

create table if not exists public.whatsapp_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  phone_number text not null,
  message_in text not null,
  message_out text not null,
  intent text not null default 'unknown',
  created_at timestamptz not null default now()
);

alter table public.whatsapp_interactions enable row level security;

grant select, insert, update on public.whatsapp_interactions to authenticated;

drop policy if exists "whatsapp_interactions_select_own" on public.whatsapp_interactions;
create policy "whatsapp_interactions_select_own"
on public.whatsapp_interactions for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "whatsapp_interactions_insert_own" on public.whatsapp_interactions;
create policy "whatsapp_interactions_insert_own"
on public.whatsapp_interactions for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "whatsapp_interactions_update_own" on public.whatsapp_interactions;
create policy "whatsapp_interactions_update_own"
on public.whatsapp_interactions for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));
