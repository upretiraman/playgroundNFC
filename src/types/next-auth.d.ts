import type { UserRole } from "@/lib/auth-types";

declare module "next-auth" {
  interface User {
    roles: UserRole[];
    isSuperAdmin: boolean;
    mustChangePassword: boolean;
    team: "boys" | "girls" | null;
    playerSlug: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      roles: UserRole[];
      isSuperAdmin: boolean;
      mustChangePassword: boolean;
      team: "boys" | "girls" | null;
      playerSlug: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roles: UserRole[];
    isSuperAdmin: boolean;
    mustChangePassword: boolean;
    team: "boys" | "girls" | null;
    playerSlug: string | null;
  }
}
