/**
 * Chạy sau khi cấu hình web/.env.local:
 * npm run seed:admin
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const path = resolve(__dirname, "../.env.local");
  try {
    const text = readFileSync(path, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      process.env[key] = value;
    }
  } catch {
    console.warn("Không đọc được .env.local — dùng biến môi trường hệ thống");
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.SEED_ADMIN_EMAIL ?? "admin@tamsen.vn";
const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

if (!url || !serviceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function main() {
  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing.users.find((u) => u.email === email);
  let userId = found?.id;

  if (!found) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Admin", role: "admin" },
    });
    if (error) throw error;
    userId = data.user.id;
    console.log("Created user:", email);
  } else {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
    });
    if (error) throw error;
    console.log("User exists — password updated:", email);
  }

  if (userId) {
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: userId,
        email,
        full_name: "Quản trị viên",
        role: "admin",
      },
      { onConflict: "id" }
    );
    if (profileError) {
      console.error("Lỗi ghi profiles:", profileError.message);
      console.error(
        "→ Chạy file supabase/migrations/001_init.sql trong Supabase SQL Editor trước."
      );
      process.exit(1);
    }
    const { data: profile, error: readError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", userId)
      .single();
    if (readError || !profile) {
      console.error("Không xác nhận được profile sau seed:", readError?.message);
      process.exit(1);
    }
    console.log("Profile OK — role:", profile.role);
  }

  console.log("Done. Login at /admin/login");
  console.log(`  Email: ${email}`);
  console.log(`  Password: (giá trị SEED_ADMIN_PASSWORD trong .env.local)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
