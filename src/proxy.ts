import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    req.auth.user.mustChangePassword &&
    req.nextUrl.pathname !== "/dashboard/change-password"
  ) {
    return NextResponse.redirect(
      new URL("/dashboard/change-password", req.nextUrl.origin)
    );
  }
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
