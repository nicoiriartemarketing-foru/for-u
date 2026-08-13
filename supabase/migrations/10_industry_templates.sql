alter table public.projects
  add column if not exists industry_key text,
  add column if not exists strategy_profile jsonb not null default '{}'::jsonb,
  add column if not exists template_source text;

create index if not exists projects_user_industry_idx
on public.projects (user_id, industry_key);
