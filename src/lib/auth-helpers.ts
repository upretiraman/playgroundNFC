import { auth } from "@/auth";
import type { SessionUser, UserRole } from "@/lib/auth-types";

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  return session.user as SessionUser;
}

export async function requireRole(
  roles: UserRole[]
): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("Not authenticated");
  if (!roles.includes(user.role)) {
    throw new Error("Not authorized");
  }
  return user;
}

export function canManageTeam(user: SessionUser, team: "boys" | "girls") {
  if (user.role === "ADMIN") return true;
  if (user.role === "TRAINER") return user.team === team;
  return false;
}

/** Events with team "both" (club-wide) may only be managed by an Administrator. */
export function canManageEventTeam(
  user: SessionUser,
  team: "boys" | "girls" | "both"
) {
  if (team === "both") return user.role === "ADMIN";
  return canManageTeam(user, team);
}

/** Creating, editing, disabling, or promoting another Admin — and granting/revoking
 * the super-admin flag itself — is restricted to super-admins. */
export function canManageAdmins(user: SessionUser) {
  return user.role === "ADMIN" && user.isSuperAdmin;
}
