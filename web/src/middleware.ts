import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/env";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  let url: string;
  let anonKey: string;
  try {
    ({ url, anonKey } = getSupabaseEnv());
  } catch {
    if (request.nextUrl.pathname.startsWith("/admin")) {
      return new NextResponse(
        "Thiếu Supabase env. Tạo web/.env.local từ .env.example và điền URL + Key.",
        { status: 503 }
      );
    }
    return response;
  }

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdmin = path.startsWith("/admin");
  const isLogin = path === "/admin/login";

  if (!isAdmin) return response;

  if (!user && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (user && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/orders";
    return NextResponse.redirect(url);
  }

  if (user && path.startsWith("/admin/users")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/orders";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
