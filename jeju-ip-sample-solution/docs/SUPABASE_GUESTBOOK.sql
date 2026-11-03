-- 새 제주 Supabase 프로젝트에서만 실행할 방명록 전용 SQL입니다.
-- 기존 즐겨찾기 테이블이나 정책을 변경하거나 삭제하지 않습니다.

create table public.jeju_guestbook (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid(),
  nickname text not null check (char_length(btrim(nickname)) between 1 and 16),
  message text not null check (char_length(btrim(message)) between 1 and 300),
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create index jeju_guestbook_created_at_idx
  on public.jeju_guestbook (created_at desc);

alter table public.jeju_guestbook enable row level security;

revoke all on table public.jeju_guestbook from anon, authenticated;
grant select (id, nickname, message, created_at) on table public.jeju_guestbook to anon, authenticated;
grant insert (nickname, message) on table public.jeju_guestbook to authenticated;

create policy jeju_guestbook_read_visible
  on public.jeju_guestbook
  for select
  to anon, authenticated
  using (is_visible = true);

create policy jeju_guestbook_insert_own_session
  on public.jeju_guestbook
  for insert
  to authenticated
  with check (
    auth.uid() is not null
    and author_id = auth.uid()
    and is_visible = true
    and char_length(btrim(nickname)) between 1 and 16
    and char_length(btrim(message)) between 1 and 300
  );

create function public.enforce_jeju_guestbook_cooldown()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.jeju_guestbook as entry
    where entry.author_id = new.author_id
      and entry.created_at > pg_catalog.now() - interval '30 seconds'
  ) then
    raise exception using errcode = 'P0001', message = 'guestbook_rate_limit';
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_jeju_guestbook_cooldown() from public, anon, authenticated;

create trigger jeju_guestbook_cooldown_before_insert
  before insert on public.jeju_guestbook
  for each row execute function public.enforce_jeju_guestbook_cooldown();
