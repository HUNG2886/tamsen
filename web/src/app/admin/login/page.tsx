"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin/orders";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      router.push("/admin/setup");
      return;
    }
    setLoading(true);
    setError("");
    let supabase;
    try {
      supabase = createClient();
    } catch {
      setLoading(false);
      setError("Chưa cấu hình Supabase. Xem hướng dẫn tại /admin/setup");
      return;
    }
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (err) {
      setLoading(false);
      setError(
        err.message.includes("Invalid login credentials")
          ? "Email hoặc mật khẩu không đúng. Nếu mới cấu hình Supabase, chạy trong thư mục web: npm run seed:admin"
          : err.message
      );
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();
    setLoading(false);
    if (!profile) {
      await supabase.auth.signOut();
      setError(
        "Tài khoản chưa có quyền staff. Chạy npm run seed:admin trong thư mục web (sau khi cấu hình .env.local)."
      );
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#141210] p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#f6f1e8] p-8 border border-[#b8956a]/40"
      >
        <p className="text-xs tracking-[0.25em] uppercase text-[#b8956a]">Tâm Sen</p>
        <h1 className="font-serif text-2xl font-semibold mt-2 text-[#141210]">
          Đăng nhập quản trị
        </h1>
        {error && (
          <p className="mt-4 text-sm text-red-800 bg-red-50 px-3 py-2">{error}</p>
        )}
        <label className="block mt-6 text-sm">
          <span className="text-xs uppercase tracking-wider text-[#6f665c]">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border border-[#d4c9b8] px-3 py-2 bg-white"
          />
        </label>
        <label className="block mt-4 text-sm">
          <span className="text-xs uppercase tracking-wider text-[#6f665c]">Mật khẩu</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full border border-[#d4c9b8] px-3 py-2 bg-white"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full py-2.5 bg-[#4d6358] text-white text-sm font-medium tracking-wide uppercase disabled:opacity-50"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
        {!isSupabaseConfigured() && (
          <p className="mt-4 text-sm text-amber-900 bg-amber-50 px-3 py-2">
            Supabase chưa cấu hình.{" "}
            <Link href="/admin/setup" className="underline font-medium">
              Xem hướng dẫn thiết lập
            </Link>
          </p>
        )}
        <p className="mt-4 text-center">
          <Link href="/" className="text-xs text-[#6f665c] hover:text-[#4d6358]">
            ← Về trang bán hàng
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#141210]" />}>
      <LoginForm />
    </Suspense>
  );
}
