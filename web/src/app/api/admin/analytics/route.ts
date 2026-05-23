import { NextResponse } from "next/server";
import {
  aggregateDailyAnalytics,
  defaultAnalyticsRange,
  summarizeAnalytics,
  vnDateRangeToUtcIso,
} from "@/lib/analytics";
import { requireProfile } from "@/lib/auth";
import { canViewAnalytics } from "@/lib/orders";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const session = await requireProfile(["admin"]);
  if (!session || !canViewAnalytics(session.profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const defaults = defaultAnalyticsRange(30);
  const from = searchParams.get("from") ?? defaults.from;
  const to = searchParams.get("to") ?? defaults.to;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }

  const { start, end } = vnDateRangeToUtcIso(from, to);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("created_at, amount, sale_status")
    .gte("created_at", start)
    .lte("created_at", end)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const daily = aggregateDailyAnalytics(data ?? []);
  const summary = summarizeAnalytics(daily);

  return NextResponse.json({ from, to, summary, daily });
}
