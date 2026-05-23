import { NextResponse } from "next/server";
import { requireProfile } from "@/lib/auth";
import { canManageBackups } from "@/lib/orders";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Order } from "@/lib/types";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireProfile(["admin"]);
  if (!session || !canManageBackups(session.profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const admin = createAdminClient();

  const { data: snapshot, error: loadError } = await admin
    .from("order_snapshots")
    .select("id, label, order_count, payload")
    .eq("id", id)
    .single();

  if (loadError || !snapshot) {
    return NextResponse.json({ error: "Không tìm thấy bản sao lưu" }, { status: 404 });
  }

  const orders = snapshot.payload as Order[];
  if (!Array.isArray(orders) || orders.length === 0) {
    return NextResponse.json(
      { error: "Bản sao lưu không có đơn hàng" },
      { status: 400 }
    );
  }

  const { error: upsertError } = await admin
    .from("orders")
    .upsert(orders, { onConflict: "id" });

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    restored: orders.length,
    label: snapshot.label,
  });
}
