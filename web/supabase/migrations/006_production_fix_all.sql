-- Chạy file này trên Supabase SQL Editor nếu đặt hàng/admin báo lỗi cột status hoặc sale_status.
-- An toàn chạy lại: bỏ qua bước đã có.

-- 1) Enum sale (nếu chưa có từ migration 003)
alter type public.order_status add value if not exists 'chot_don';
alter type public.order_status add value if not exists 'khong_nghe';
alter type public.order_status add value if not exists 'khong_mua';

-- 2) Tách sale_status + shipping_status (bỏ qua nếu đã chạy 004)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'sale_status') then
    create type public.sale_status as enum (
      'moi', 'da_xac_nhan', 'chot_don', 'khong_nghe', 'khong_mua', 'huy'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'shipping_status') then
    create type public.shipping_status as enum ('cho_giao', 'dang_giao', 'da_giao');
  end if;
end $$;

alter table public.orders
  add column if not exists sale_status public.sale_status,
  add column if not exists shipping_status public.shipping_status;

-- Chỉ migrate khi còn cột status cũ
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'status'
  ) then
    update public.orders
    set
      sale_status = coalesce(sale_status, case status::text
        when 'moi' then 'moi'
        when 'da_xac_nhan' then 'da_xac_nhan'
        when 'chot_don' then 'chot_don'
        when 'khong_nghe' then 'khong_nghe'
        when 'khong_mua' then 'khong_mua'
        when 'huy' then 'huy'
        when 'dang_giao' then 'chot_don'
        when 'da_giao' then 'chot_don'
        else 'moi'
      end::public.sale_status),
      shipping_status = coalesce(shipping_status, case status::text
        when 'dang_giao' then 'dang_giao'
        when 'da_giao' then 'da_giao'
        else 'cho_giao'
      end::public.shipping_status);

    alter table public.orders drop column status;
    drop type if exists public.order_status;
  end if;
end $$;

update public.orders set sale_status = 'moi' where sale_status is null;
update public.orders set shipping_status = 'cho_giao' where shipping_status is null;

alter table public.orders
  alter column sale_status set default 'moi',
  alter column shipping_status set default 'cho_giao';

alter table public.orders
  alter column sale_status set not null,
  alter column shipping_status set not null;

drop index if exists public.orders_status_idx;
create index if not exists orders_sale_status_idx on public.orders (sale_status);
create index if not exists orders_shipping_status_idx on public.orders (shipping_status);

-- 3) Bảng sao lưu (005)
create table if not exists public.order_snapshots (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  order_count integer not null check (order_count >= 0),
  payload jsonb not null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists order_snapshots_created_at_idx
  on public.order_snapshots (created_at desc);

alter table public.order_snapshots enable row level security;

drop policy if exists order_snapshots_admin on public.order_snapshots;
create policy order_snapshots_admin on public.order_snapshots
for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

-- Realtime đơn hàng (admin tự cập nhật)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end $$;
