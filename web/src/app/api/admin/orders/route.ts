import { NextResponse } from "next/server";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { SaleStatus, ShippingStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await requireProfile(["admin", "sale", "shipping"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const saleStatus = searchParams.get("sale_status") as SaleStatus | "all" | null;
  const shippingStatus = searchParams.get("shipping_status") as
    | ShippingStatus
    | "all"
    | null;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(
    50,
    Math.max(10, parseInt(searchParams.get("pageSize") ?? "20", 10))
  );
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (saleStatus && saleStatus !== "all") {
    query = query.eq("sale_status", saleStatus);
  }
  if (shippingStatus && shippingStatus !== "all") {
    query = query.eq("shipping_status", shippingStatus);
  }
  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", `${to}T23:59:59`);
  if (q) {
    const safe = q.replace(/[%_,]/g, "");
    const like = `%${safe}%`;
    query = query.or(
      `customer_name.ilike.${like},phone.ilike.${like},order_code.ilike.${like}`
    );
  }

  const fromIdx = (page - 1) * pageSize;
  query = query.range(fromIdx, fromIdx + pageSize - 1);

  const { data, error, count } = await query;
  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    orders: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
  });
}
