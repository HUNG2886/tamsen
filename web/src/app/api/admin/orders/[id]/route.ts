import { NextResponse } from "next/server";
import { z } from "zod";
import { requireProfile } from "@/lib/auth";
import {
  canConfirmOrder,
  canDeleteOrder,
  canEditCustomer,
  canUpdateShipping,
} from "@/lib/orders";
import { createClient } from "@/lib/supabase/server";
const patchSchema = z.object({
  customer_name: z.string().min(2).optional(),
  phone: z.string().min(9).optional(),
  address: z.string().min(5).optional(),
  combo: z.coerce.number().int().min(1).max(3).optional(),
  note: z.string().max(300).optional().nullable(),
  status: z
    .enum(["moi", "da_xac_nhan", "dang_giao", "da_giao", "huy"])
    .optional(),
  tracking_code: z.string().max(100).optional().nullable(),
  carrier: z.string().max(100).optional().nullable(),
  assigned_sale_id: z.string().uuid().optional().nullable(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireProfile(["admin", "sale", "shipping"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const role = session.profile.role;
  const payload = parsed.data;

  if (
    (payload.customer_name ||
      payload.phone ||
      payload.address ||
      payload.combo !== undefined) &&
    !canEditCustomer(role)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (payload.status === "da_xac_nhan" && !canConfirmOrder(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (
    (payload.status === "dang_giao" || payload.status === "da_giao") &&
    !canUpdateShipping(role) &&
    role !== "admin"
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (payload.tracking_code !== undefined && !canUpdateShipping(role) && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = await createClient();
  const update: Record<string, unknown> = { ...payload };

  if (payload.combo) {
    const { getComboTotalAmount } = await import("@/lib/orders");
    update.amount = getComboTotalAmount(payload.combo as 1 | 2 | 3);
  }

  const { data, error } = await supabase
    .from("orders")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ order: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireProfile(["admin"]);
  if (!session || !canDeleteOrder(session.profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.from("orders").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
