-- Cho phép user đọc profile của chính mình (tránh vòng RLS khi mới đăng nhập)
drop policy if exists profiles_select_own on public.profiles;

create policy profiles_select_own on public.profiles
for select to authenticated
using (id = auth.uid());
