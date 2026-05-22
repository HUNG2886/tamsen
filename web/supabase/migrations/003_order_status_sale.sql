-- Thêm trạng thái sale: chốt đơn, không nghe, không mua

alter type public.order_status add value if not exists 'chot_don';
alter type public.order_status add value if not exists 'khong_nghe';
alter type public.order_status add value if not exists 'khong_mua';
