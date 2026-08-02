import type { UserRole } from "@/lib/auth-types";

declare module "next-auth" {
  interface User {
    role: UserRole;
    team: "boys" | "girls" | null;
    playerSlug: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      team: "boys" | "girls" | null;
      playerSlug: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    team: "boys" | "girls" | null;
    playerSlug: string | null;
  }
}
