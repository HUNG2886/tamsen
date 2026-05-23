import { redirect } from "next/navigation";
import { BackupPanel } from "@/components/admin/BackupPanel";
import { getSessionProfile } from "@/lib/auth";
import { canManageBackups } from "@/lib/orders";

export default async function AdminBackupPage() {
  const session = await getSessionProfile();
  if (!session) redirect("/admin/login");
  if (!canManageBackups(session.profile.role)) redirect("/admin/orders");

  return <BackupPanel />;
}
