/**
 * Chạy một lần sau khi tạo Supabase project:
 * npx tsx scripts/seed-admin.ts
 */
import { createClient } from "@supabase/supabase-js";

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
    console.log("User exists:", email);
  }

  if (userId) {
    await supabase.from("profiles").upsert({
      id: userId,
      email,
      full_name: "Quản trị viên",
      role: "admin",
    });
  }

  console.log("Done. Login at /admin/login");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
