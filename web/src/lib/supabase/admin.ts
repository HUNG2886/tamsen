import { createClient } from "@supabase/supabase-js";
import { getServiceRoleKey, getSupabaseEnv } from "@/lib/env";

export function createAdminClient() {
  const { url } = getSupabaseEnv();
  const key = getServiceRoleKey();
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
