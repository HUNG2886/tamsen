# Triển khai Trà Tâm Sen (Vercel + Supabase)

## 1. Supabase

1. Tạo project tại [supabase.com](https://supabase.com).
2. **SQL Editor** → chạy file [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql).
3. **Authentication** → bật Email provider.
4. Lấy keys: **Project Settings → API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (chỉ server, không public)

## 2. Tạo admin đầu tiên

Trong thư mục `web/`:

```bash
cp .env.example .env.local
# Điền các biến Supabase + SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD

npm run seed:admin
```

## 3. Vercel

1. Import repo GitHub/GitLab.
2. **Root Directory**: `web`
3. **Environment Variables** (Production + Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy.

## 4. Domain (tamsen.site)

**Production:** https://www.tamsen.site/

| Trang | URL |
|-------|-----|
| Landing | https://www.tamsen.site/ |
| Đăng nhập admin | https://www.tamsen.site/admin/login |
| Đơn hàng | https://www.tamsen.site/admin/orders |

Nếu `/admin/login` báo **404**: Vercel → Project → **Settings → General → Root Directory** phải là **`web`**, sau đó **Deployments → Redeploy** (bản mới nhất từ GitHub `main`).

**Supabase → Authentication → URL Configuration:**

- Site URL: `https://www.tamsen.site`
- Redirect URLs: `https://www.tamsen.site/**`

Landing cũng có rewrite: `/tra` → `/` (trong `vercel.json`).

## 5. Vai trò

| Role | Quyền |
|------|--------|
| `admin` | Toàn quyền + quản lý user |
| `sale` | Xem/sửa đơn, xác nhận đơn |
| `shipping` | Cập nhật vận đơn, trạng thái giao |

Tạo thêm user tại **Admin → Người dùng** (chỉ admin).

## 6. Chạy local

```bash
cd web
npm install
npm run dev
```

Mở http://localhost:3000 và http://localhost:3000/admin/login
