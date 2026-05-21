import { NextResponse } from "next/server";
import { z } from "zod";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const session = await requireProfile(["admin"]);
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users: data });
}

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(1),
  role: z.enum(["admin", "sale", "shipping"]),
});

export async function POST(request: Request) {
  const session = await requireProfile(["admin"]);
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { email, password, full_name, role } = parsed.data;
  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await admin.from("profiles").upsert({
    id: data.user.id,
    email,
    full_name,
    role,
  });

  return NextResponse.json({ ok: true, id: data.user.id });
}
