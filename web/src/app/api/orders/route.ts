import { NextResponse } from "next/server";
import { z } from "zod";
import { getComboTotalAmount, generateOrderCode } from "@/lib/orders";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ComboId } from "@/lib/types";

const schema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().min(9).max(15),
  address: z.string().min(5).max(500),
  combo: z.coerce.number().int().min(1).max(3),
  note: z.string().max(300).optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, phone, address, combo, note } = parsed.data;
    const comboId = combo as ComboId;
    const amount = getComboTotalAmount(comboId);

    const supabase = createAdminClient();
    const order_code = generateOrderCode();

    const { data, error } = await supabase
      .from("orders")
      .insert({
        order_code,
        customer_name: name.trim(),
        phone: phone.replace(/\s/g, ""),
        address: address.trim(),
        combo: comboId,
        amount,
        note: note?.trim() || null,
        status: "moi",
      })
      .select("id, order_code")
      .single();

    if (error) {
      console.error("[orders]", error);
      return NextResponse.json(
        { error: "Không thể tạo đơn hàng. Vui lòng thử lại." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      order_code: data.order_code,
      id: data.id,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
