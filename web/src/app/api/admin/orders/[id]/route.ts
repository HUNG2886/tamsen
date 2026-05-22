import { NextResponse } from "next/server";
import { z } from "zod";
import { requireProfile } from "@/lib/auth";
import {
  canConfirmOrder,
  canDeleteOrder,
  canEditCustomer,
  canUpdateShipping,
  getComboTotalAmount,
} from "@/lib/orders";
import { createClient } from "@/lib/supabase/server";

const patchSchema = z.object({
  customer_name: z.string().min(2).optional(),
  phone: z.string().min(9).optional(),
  address: z.string().min(5).optional(),
  combo: z.coerce.number().int().min(1).max(3).optional(),
  note: z.string().max(300).optional().nullable(),
  sale_status: z
    .enum([
      "moi",
      "da_xac_nhan",
      "chot_don",
      "khong_nghe",
      "khong_mua",
      "huy",
    ])
    .optional(),
  shipping_status: z.enum(["cho_giao", "dang_giao", "da_giao"]).optional(),
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
  const isAdmin = role === "admin";

  if (
    (payload.customer_name ||
      payload.phone ||
      payload.address ||
      payload.combo !== undefined ||
      payload.note !== undefined) &&
    !canEditCustomer(role) &&
    !isAdmin
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (payload.sale_status !== undefined && !canConfirmOrder(role) && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (
    (payload.shipping_status !== undefined ||
      payload.tracking_code !== undefined ||
      payload.carrier !== undefined) &&
    !canUpdateShipping(role) &&
    !isAdmin
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const update: Record<string, unknown> = {};

  if (isAdmin || canEditCustomer(role)) {
    if (payload.customer_name !== undefined) update.customer_name = payload.customer_name;
    if (payload.phone !== undefined) update.phone = payload.phone;
    if (payload.address !== undefined) update.address = payload.address;
    if (payload.combo !== undefined) {
      update.combo = payload.combo;
      update.amount = getComboTotalAmount(payload.combo as 1 | 2 | 3);
    }
    if (payload.note !== undefined) update.note = payload.note;
    if (payload.assigned_sale_id !== undefined) {
      update.assigned_sale_id = payload.assigned_sale_id;
    }
  }

  if (isAdmin || canConfirmOrder(role)) {
    if (payload.sale_status !== undefined) update.sale_status = payload.sale_status;
  }

  if (isAdmin || canUpdateShipping(role)) {
    if (payload.shipping_status !== undefined) {
      update.shipping_status = payload.shipping_status;
    }
    if (payload.tracking_code !== undefined) update.tracking_code = payload.tracking_code;
    if (payload.carrier !== undefined) update.carrier = payload.carrier;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const supabase = await createClient();
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
