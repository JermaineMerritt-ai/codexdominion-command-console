import { getActiveOrganization, getUsers } from "@/lib/data/queries";
import { createClient } from "@/lib/supabase/server";
import type { Actor } from "@/lib/data/mutations";
import type { User } from "@/types";

export const requireAuth = process.env.NEXT_PUBLIC_REQUIRE_AUTH === "true";

/**
 * Resolve the current application user.
 *  - Demo / no-auth: the seeded organization administrator (Jermaine Merritt).
 *  - Auth mode: the Supabase session user matched to an app User by email
 *    (least-privilege `viewer` if no matching record), or null if unauthenticated.
 */
export async function getCurrentUser(): Promise<User | null> {
  const users = await getUsers();

  if (requireAuth) {
    const supabase = await createClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;
      const matched = users.find(
        (u) => u.email.toLowerCase() === user.email?.toLowerCase(),
      );
      if (matched) return matched;
      // Authenticated but no app record → least privilege.
      const org = await getActiveOrganization();
      return {
        id: user.id,
        name: user.email ?? "Authenticated User",
        email: user.email ?? "",
        role: "viewer",
        title: "Member",
        organizationId: org.id,
        status: "active",
        lastActiveAt: new Date().toISOString(),
        avatarColor: "#64748b",
      };
    }
  }

  return users.find((u) => u.role === "administrator") ?? users[0] ?? null;
}

/** The acting principal for governance mutations (id + role + org). */
export async function getCurrentActor(): Promise<Actor> {
  const [user, org] = await Promise.all([
    getCurrentUser(),
    getActiveOrganization(),
  ]);
  if (!user) {
    // Should not happen for an action call (middleware gates routes), but keep
    // a safe least-privilege fallback.
    return {
      id: "anonymous",
      name: "Anonymous",
      organizationId: org.id,
      role: "viewer",
    };
  }
  return {
    id: user.id,
    name: user.name,
    organizationId: org.id,
    role: user.role,
  };
}
