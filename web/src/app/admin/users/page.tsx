import { redirect } from "next/navigation";
import { UsersPanel } from "@/components/admin/UsersPanel";
import { getSessionProfile } from "@/lib/auth";

export default async function AdminUsersPage() {
  const session = await getSessionProfile();
  if (!session) redirect("/admin/login");
  if (session.profile.role !== "admin") redirect("/admin/orders");

  return <UsersPanel />;
}
