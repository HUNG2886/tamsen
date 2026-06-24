import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/env";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  if (!isSupabaseConfigured()) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/setup";
    return NextResponse.redirect(url);
  }

  let url: string;
  let anonKey: string;
  try {
    ({ url, anonKey } = getSupabaseEnv());
  } catch {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/setup";
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = createServerClient(url, anonKey, {
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
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/login";
    redirectUrl.searchParams.set("next", path);
    return NextResponse.redirect(redirectUrl);
  }

  if (path === "/admin") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/orders";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  // Bỏ qua /admin/login và /admin/setup — tránh 504 khi gọi Supabase trên Edge
  matcher: ["/admin/((?!login|setup).*)", "/admin"],
};
