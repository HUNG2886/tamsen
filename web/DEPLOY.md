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

(Script nằm ở `scripts/seed-admin.ts` ngoài `web/` — không ảnh hưởng build Vercel.)

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

## 7. Lỗi 401 / 404 (Visit hoặc tamsen.site)

### 404 `NOT_FOUND` (id `hkg1::...`) trên tamsen.site

Domain trỏ vào Vercel nhưng **DNS chưa Valid** hoặc domain gắn **sai project**.

1. **Settings → Domains** → `www.tamsen.site` → **Learn more** → sửa DNS tại nhà cung cấp domain:
   - **CNAME** `www` → `cname.vercel-dns.com`
2. Bấm **Refresh** → đợi **Valid** (hết “DNS Change Recommended”).
3. Thêm `tamsen.site` → redirect sang `www` (nếu hay gõ không có www).

### 401 khi bấm Visit trên Vercel

**Deployment Protection** đang bật.

1. **Settings → Deployment Protection**
2. **Production**: tắt **Vercel Authentication** / **Password Protection** (hoặc chỉ bật cho Preview).
3. Save → **Redeploy** → bấm **Visit** lại.

### Visit vẫn 404 sau khi deploy Ready

1. **Settings → Build and Deployment → Root Directory** = `web` (không phải `./`).
2. Tắt **Include files outside the root directory in the Build Step** (khi đã dùng root `web`).
3. **Deployments** → bản Ready → URL dạng `tamsen-xxxxx.vercel.app` (copy từ deployment, không đoán).
4. **Redeploy** + bật **Clear build cache**.

### Checklist

- [ ] Root Directory = `web`
- [ ] 3 biến env Supabase (Production)
- [ ] Deployment Protection: Production không khóa
- [ ] Domains: Valid
- [ ] Commit deploy: `08971ae` trở lên

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
