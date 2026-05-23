import { redirect } from "next/navigation";
import { AnalyticsPanel } from "@/components/admin/AnalyticsPanel";
import { getSessionProfile } from "@/lib/auth";
import { canViewAnalytics } from "@/lib/orders";

export default async function AdminAnalyticsPage() {
  const session = await getSessionProfile();
  if (!session) redirect("/admin/login");
  if (!canViewAnalytics(session.profile.role)) redirect("/admin/orders");

  return <AnalyticsPanel />;
}
