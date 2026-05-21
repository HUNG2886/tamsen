import { AdminShell } from "@/components/admin/AdminShell";
import { getSessionProfile } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return <>{children}</>;
  }

  const session = await getSessionProfile();
  if (!session) {
    return <>{children}</>;
  }

  return <AdminShell profile={session.profile}>{children}</AdminShell>;
}
