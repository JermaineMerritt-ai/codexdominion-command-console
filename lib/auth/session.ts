import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/data/queries";

export const requireAuth = process.env.NEXT_PUBLIC_REQUIRE_AUTH === "true";

/**
 * Resolve the current session user. When Supabase is configured, this reads
 * the authenticated user; otherwise it falls back to the seed admin so the
 * console is fully demoable without a backend.
 */
export async function getSessionUser() {
  const supabase = await createClient();
  if (!supabase) {
    return getUser("usr_jmerritt");
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  // In production, map auth user -> application user record.
  return getUser("usr_jmerritt");
}
