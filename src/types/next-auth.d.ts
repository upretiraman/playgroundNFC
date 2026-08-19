import type { UserRole } from "@/lib/auth-types";

declare module "next-auth" {
  interface User {
    role: UserRole;
    isSuperAdmin: boolean;
    team: "boys" | "girls" | null;
    playerSlug: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      isSuperAdmin: boolean;
      team: "boys" | "girls" | null;
      playerSlug: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    isSuperAdmin: boolean;
    team: "boys" | "girls" | null;
    playerSlug: string | null;
  }
}
