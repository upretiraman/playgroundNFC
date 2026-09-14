import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { parseRoles, type UserRole } from "@/lib/auth-types";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string" ? credentials.email : undefined;
        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : undefined;
        if (!email || !password) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user || !user.isActive) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: parseRoles(user.roles),
          isSuperAdmin: user.isSuperAdmin,
          mustChangePassword: user.mustChangePassword,
          team: user.team as "boys" | "girls" | null,
          playerSlug: user.playerSlug,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.roles = user.roles;
        token.isSuperAdmin = user.isSuperAdmin;
        token.mustChangePassword = user.mustChangePassword;
        token.team = user.team;
        token.playerSlug = user.playerSlug;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.roles = token.roles as UserRole[];
        session.user.isSuperAdmin = token.isSuperAdmin as boolean;
        session.user.mustChangePassword = token.mustChangePassword as boolean;
        session.user.team = token.team as "boys" | "girls" | null;
        session.user.playerSlug = token.playerSlug as string | null;
      }
      return session;
    },
  },
});
