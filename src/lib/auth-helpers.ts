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
  if (!roles.some((r) => user.roles.includes(r))) {
    throw new Error("Not authorized");
  }
  return user;
}

/** Trainers are club-wide — any Trainer may manage any team's events. */
export function canManageTeam(user: SessionUser) {
  return user.roles.includes("ADMIN") || user.roles.includes("TRAINER");
}

/** Events with team "both" (club-wide) may only be managed by an Administrator. */
export function canManageEventTeam(
  user: SessionUser,
  team: "boys" | "girls" | "both"
) {
  if (team === "both") return user.roles.includes("ADMIN");
  return canManageTeam(user);
}

/** Creating, editing, disabling, or promoting another Admin — and granting/revoking
 * the super-admin flag itself — is restricted to super-admins. */
export function canManageAdmins(user: SessionUser) {
  return user.roles.includes("ADMIN") && user.isSuperAdmin;
}
