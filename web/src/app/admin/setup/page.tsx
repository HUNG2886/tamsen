import Link from "next/link";

export default function AdminSetupPage() {
  return (
    <div className="min-h-screen bg-[#141210] text-[#f6f1e8] p-6 flex items-center justify-center">
      <div className="max-w-lg w-full border border-[#b8956a]/40 bg-[#1c1916] p-8">
        <p className="text-xs tracking-[0.25em] uppercase text-[#b8956a]">Tâm Sen · Admin</p>
        <h1 className="font-serif text-2xl font-semibold mt-2">Chưa cấu hình Supabase</h1>
        <p className="mt-4 text-sm text-[#c9bfb0] leading-relaxed">
          Trang quản trị cần kết nối Supabase (đăng nhập + lưu đơn). Hiện{" "}
          <code className="text-[#e8dcc8]">web/.env.local</code> vẫn là giá trị mẫu hoặc thiếu trên
          Vercel.
        </p>
        <ol className="mt-6 space-y-3 text-sm list-decimal list-inside text-[#d4c9b8]">
          <li>
            Tạo project tại{" "}
            <a
              href="https://supabase.com"
              className="text-[#b8956a] underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              supabase.com
            </a>
          </li>
          <li>
            SQL Editor → chạy file{" "}
            <code className="text-[#e8dcc8]">web/supabase/migrations/001_init.sql</code>
          </li>
          <li>
            Copy <code className="text-[#e8dcc8]">web/.env.example</code> →{" "}
            <code className="text-[#e8dcc8]">web/.env.local</code>, điền URL + anon key + service
            role từ Dashboard → API
          </li>
          <li>
            Trong thư mục <code className="text-[#e8dcc8]">web</code>:{" "}
            <code className="text-[#e8dcc8]">npm run seed:admin</code> (tạo tài khoản admin)
          </li>
          <li>
            Local: <code className="text-[#e8dcc8]">npm run dev</code> — Vercel: thêm 3 biến env
            (xem <code className="text-[#e8dcc8]">DEPLOY.md</code>) rồi deploy lại
          </li>
        </ol>
        <p className="mt-6 text-xs text-[#8a8076]">
          Đăng nhập: <strong className="text-[#c9bfb0]">/admin/login</strong> · Email/mật khẩu theo{" "}
          <code className="text-[#e8dcc8]">SEED_ADMIN_EMAIL</code> /{" "}
          <code className="text-[#e8dcc8]">SEED_ADMIN_PASSWORD</code> trong .env.local
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/admin/login"
            className="px-4 py-2 bg-[#4d6358] text-white text-sm uppercase tracking-wide"
          >
            Thử đăng nhập
          </Link>
          <Link href="/" className="px-4 py-2 border border-[#b8956a]/50 text-sm text-[#c9bfb0]">
            Về trang bán hàng
          </Link>
        </div>
      </div>
    </div>
  );
}
