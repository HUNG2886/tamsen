import { redirect } from "next/navigation";
import { OrdersPanel } from "@/components/admin/OrdersPanel";
import { getSessionProfile } from "@/lib/auth";

export default async function AdminOrdersPage() {
  const session = await getSessionProfile();
  if (!session) redirect("/admin/login");

  return <OrdersPanel role={session.profile.role} />;
}
