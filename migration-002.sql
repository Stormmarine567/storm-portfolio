-- Run this ONCE in the Supabase SQL Editor if you already ran schema.sql before.
-- It adds: editable site text, free-text project categories, and image/CV uploads.

alter table public.settings
  add column if not exists content jsonb not null default '{}'::jsonb;

alter table public.projects
  drop constraint if exists projects_category_check;

insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do update set public = true;
