-- Trà Tâm Sen: profiles + orders + RLS

create type public.user_role as enum ('admin', 'sale', 'shipping');
create type public.sale_status as enum (
  'moi',
  'da_xac_nhan',
  'chot_don',
  'khong_nghe',
  'khong_mua',
  'huy'
);

create type public.shipping_status as enum ('cho_giao', 'dang_giao', 'da_giao');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role public.user_role not null default 'sale',
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  customer_name text not null,
  phone text not null,
  address text not null,
  combo smallint not null check (combo between 1 and 3),
  amount integer not null check (amount > 0),
  note text,
  sale_status public.sale_status not null default 'moi',
  shipping_status public.shipping_status not null default 'cho_giao',
  assigned_sale_id uuid references public.profiles (id) on delete set null,
  tracking_code text,
  carrier text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_sale_status_idx on public.orders (sale_status);
create index orders_shipping_status_idx on public.orders (shipping_status);

create table public.order_snapshots (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  order_count integer not null check (order_count >= 0),
  payload jsonb not null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index order_snapshots_created_at_idx on public.order_snapshots (created_at desc);
create index orders_created_at_idx on public.orders (created_at desc);
create index orders_phone_idx on public.orders (phone);
create index orders_order_code_idx on public.orders (order_code);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'sale')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_snapshots enable row level security;

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Profiles: đọc profile của mình; staff đọc tất cả
create policy profiles_select_own on public.profiles
for select to authenticated
using (id = auth.uid());

create policy profiles_select_staff on public.profiles
for select to authenticated
using (public.current_user_role() is not null);

create policy profiles_update_admin on public.profiles
for update to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

-- Orders: staff read; public insert via service role API only
create policy orders_select_staff on public.orders
for select to authenticated
using (public.current_user_role() is not null);

create policy orders_insert_staff on public.orders
for insert to authenticated
with check (public.current_user_role() in ('admin', 'sale'));

create policy orders_update_admin on public.orders
for update to authenticated
using (public.current_user_role() = 'admin');

create policy orders_update_sale on public.orders
for update to authenticated
using (public.current_user_role() = 'sale');

create policy orders_update_shipping on public.orders
for update to authenticated
using (public.current_user_role() = 'shipping');

create policy orders_delete_admin on public.orders
for delete to authenticated
using (public.current_user_role() = 'admin');

create policy order_snapshots_admin on public.order_snapshots
for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

-- Allow anon to insert orders (landing form) — controlled via API with service role instead.
-- Public POST uses service role in Next.js API route.
