import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const role = token?.role;

  if (!token) {
    // Redirect unauthenticated users to login
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Redirect users based on their role
  if (role === "owner" && !req.nextUrl.pathname.startsWith("/owner")) {
    return NextResponse.redirect(new URL("/owner", req.url));
  }

  if (role === "renter" && !req.nextUrl.pathname.startsWith("/")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!auth|api|_next|static|favicon.ico).*)"], // Match all paths except auth, api, etc.
};
