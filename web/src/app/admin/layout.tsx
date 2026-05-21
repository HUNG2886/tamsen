import { AdminShell } from "@/components/admin/AdminShell";
import { getSessionProfile } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionProfile();
  if (!session) {
    return <>{children}</>;
  }

  return <AdminShell profile={session.profile}>{children}</AdminShell>;
}
