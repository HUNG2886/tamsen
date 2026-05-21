import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/types";

export async function getSessionProfile(): Promise<{
  user: { id: string; email?: string };
  profile: Profile;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    user: { id: user.id, email: user.email },
    profile: profile as Profile,
  };
}

export async function requireProfile(roles?: UserRole[]) {
  const session = await getSessionProfile();
  if (!session) return null;
  if (roles && !roles.includes(session.profile.role)) return null;
  return session;
}
