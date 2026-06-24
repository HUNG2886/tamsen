import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid api key")) {
    return "Sai Supabase API key trên Vercel. Kiểm tra NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY, sau đó Redeploy.";
  }
  if (m.includes("invalid login credentials")) {
    return "Email hoặc mật khẩu không đúng.";
  }
  if (m.includes("fetch") || m.includes("network") || m.includes("timeout")) {
    return "Không kết nối được Supabase. Kiểm tra project Supabase còn Active (không Pause) và URL đúng trên Vercel.";
  }
  return message;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Email hoặc mật khẩu không hợp lệ" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      return NextResponse.json(
        { error: mapAuthError(error.message) },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (!profile) {
      await supabase.auth.signOut();
      return NextResponse.json(
        {
          error:
            "Tài khoản chưa có quyền staff. Chạy npm run seed:admin (sau khi cấu hình .env.local).",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ ok: true, role: profile.role });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Thiếu cấu hình Supabase") || msg.includes("Thiếu")) {
      return NextResponse.json(
        { error: "Chưa cấu hình Supabase trên server. Xem /admin/setup" },
        { status: 503 }
      );
    }
    console.error("[admin/login]", e);
    return NextResponse.json(
      {
        error:
          "Không kết nối được Supabase. Kiểm tra project Active trên dashboard và biến môi trường trên Vercel.",
      },
      { status: 503 }
    );
  }
}
