-- Sao lưu đơn hàng (admin) — khôi phục khi xóa nhầm

create table public.order_snapshots (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  order_count integer not null check (order_count >= 0),
  payload jsonb not null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index order_snapshots_created_at_idx on public.order_snapshots (created_at desc);

alter table public.order_snapshots enable row level security;

create policy order_snapshots_admin on public.order_snapshots
for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');
