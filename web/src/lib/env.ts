export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    throw new Error(
      [
        "Thiếu cấu hình Supabase.",
        "Tạo file web/.env.local (copy từ .env.example) và điền:",
        "  NEXT_PUBLIC_SUPABASE_URL",
        "  NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "  SUPABASE_SERVICE_ROLE_KEY",
        "Lấy tại: Supabase Dashboard → Project Settings → API",
        "Sau đó chạy lại: npm run dev",
      ].join("\n")
    );
  }

  if (url.includes("your-project") || anonKey.includes("your-")) {
    throw new Error(
      "Bạn chưa thay giá trị thật trong web/.env.local — dùng URL và Key từ Supabase Dashboard → API."
    );
  }

  return { url, anonKey };
}

export function getServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    throw new Error("Thiếu SUPABASE_SERVICE_ROLE_KEY trong web/.env.local");
  }
  return key;
}
