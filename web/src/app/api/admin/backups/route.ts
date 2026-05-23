import { NextResponse } from "next/server";
import { z } from "zod";
import { requireProfile } from "@/lib/auth";
import { canManageBackups } from "@/lib/orders";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
export async function GET() {
  const session = await requireProfile(["admin"]);
  if (!session || !canManageBackups(session.profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("order_snapshots")
    .select("id, label, order_count, created_by, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ snapshots: data ?? [] });
}

const createSchema = z.object({
  label: z.string().min(1).max(120).optional(),
});

export async function POST(request: Request) {
  const session = await requireProfile(["admin"]);
  if (!session || !canManageBackups(session.profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let label: string | undefined;
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = createSchema.safeParse(body);
    if (parsed.success) label = parsed.data.label;
  } catch {
    /* optional body */
  }

  const admin = createAdminClient();
  const { data: orders, error: fetchError } = await admin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: true });

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  const now = new Date();
  const vnLabel = new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "short",
    timeStyle: "medium",
  }).format(now);

  const snapshotLabel = label?.trim() || `Sao lưu ${vnLabel}`;

  const { data: snapshot, error: insertError } = await admin
    .from("order_snapshots")
    .insert({
      label: snapshotLabel,
      order_count: orders?.length ?? 0,
      payload: orders ?? [],
      created_by: session.user.id,
    })
    .select("id, label, order_count, created_by, created_at")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ snapshot });
}
