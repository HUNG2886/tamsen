-- Tách trạng thái sale và vận chuyển để vận hành song song

create type public.sale_status as enum (
  'moi',
  'da_xac_nhan',
  'chot_don',
  'khong_nghe',
  'khong_mua',
  'huy'
);

create type public.shipping_status as enum ('cho_giao', 'dang_giao', 'da_giao');

alter table public.orders
  add column sale_status public.sale_status,
  add column shipping_status public.shipping_status;

update public.orders
set
  sale_status = case status::text
    when 'moi' then 'moi'
    when 'da_xac_nhan' then 'da_xac_nhan'
    when 'chot_don' then 'chot_don'
    when 'khong_nghe' then 'khong_nghe'
    when 'khong_mua' then 'khong_mua'
    when 'huy' then 'huy'
    when 'dang_giao' then 'chot_don'
    when 'da_giao' then 'chot_don'
    else 'moi'
  end::public.sale_status,
  shipping_status = case status::text
    when 'dang_giao' then 'dang_giao'
    when 'da_giao' then 'da_giao'
    else 'cho_giao'
  end::public.shipping_status;

alter table public.orders
  alter column sale_status set not null,
  alter column sale_status set default 'moi',
  alter column shipping_status set not null,
  alter column shipping_status set default 'cho_giao';

drop index if exists public.orders_status_idx;
alter table public.orders drop column status;
drop type public.order_status;

create index orders_sale_status_idx on public.orders (sale_status);
create index orders_shipping_status_idx on public.orders (shipping_status);
