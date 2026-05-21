"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile, UserRole } from "@/lib/types";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Quản trị",
  sale: "Sale",
  shipping: "Vận đơn",
};

export function AdminShell({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const links = [
    { href: "/admin/orders", label: "Đơn hàng", roles: ["admin", "sale", "shipping"] as UserRole[] },
    { href: "/admin/users", label: "Người dùng", roles: ["admin"] as UserRole[] },
  ];

  return (
    <div className="min-h-screen bg-[#f0ebe3] text-[#141210] flex">
      <aside className="w-56 shrink-0 bg-[#141210] text-[#f6f1e8] flex flex-col">
        <div className="p-5 border-b border-white/10">
          <p className="text-xs tracking-[0.2em] uppercase text-[#b8956a]">Tâm Sen</p>
          <p className="font-serif text-lg mt-1">Quản trị</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links
            .filter((l) => l.roles.includes(profile.role))
            .map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`block px-3 py-2.5 text-sm rounded transition ${
                  pathname.startsWith(l.href)
                    ? "bg-[#4d6358] text-white"
                    : "hover:bg-white/10"
                }`}
              >
                {l.label}
              </Link>
            ))}
        </nav>
        <div className="p-4 border-t border-white/10 text-xs">
          <p className="font-medium truncate">{profile.full_name || profile.email}</p>
          <p className="text-[#b8956a] mt-0.5">{ROLE_LABELS[profile.role]}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 w-full py-2 text-left text-[#f6f1e8]/70 hover:text-white"
          >
            Đăng xuất
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-6 md:p-8">{children}</main>
    </div>
  );
}
