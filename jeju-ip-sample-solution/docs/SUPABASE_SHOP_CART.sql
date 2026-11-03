-- 기념품 장바구니 전용 테이블입니다.
-- 즐겨찾기와 방명록 테이블, 정책, 데이터는 변경하지 않습니다.

create table if not exists public.jeju_shop_cart_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null check (char_length(product_id) between 1 and 100),
  quantity integer not null check (quantity between 1 and 9),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table public.jeju_shop_cart_items enable row level security;

revoke all on table public.jeju_shop_cart_items from anon, authenticated;
grant select, insert, update, delete on table public.jeju_shop_cart_items to authenticated;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'jeju_shop_cart_items' and policyname = 'jeju_shop_cart_select_own') then
    create policy jeju_shop_cart_select_own on public.jeju_shop_cart_items for select to authenticated using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'jeju_shop_cart_items' and policyname = 'jeju_shop_cart_insert_own') then
    create policy jeju_shop_cart_insert_own on public.jeju_shop_cart_items for insert to authenticated with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'jeju_shop_cart_items' and policyname = 'jeju_shop_cart_update_own') then
    create policy jeju_shop_cart_update_own on public.jeju_shop_cart_items for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'jeju_shop_cart_items' and policyname = 'jeju_shop_cart_delete_own') then
    create policy jeju_shop_cart_delete_own on public.jeju_shop_cart_items for delete to authenticated using (auth.uid() = user_id);
  end if;
end $$;
