import { NextRequest, NextResponse } from "next/server";

const AUTH_ROUTES = ["/login", "/admin/login", "/signup", "/forgot-password"];
const PUBLIC_ROUTES = ["/", ...AUTH_ROUTES, "/invite"];

const parseJwtPayload = (token: string | undefined): Record<string, unknown> | null => {
  if (!token) return null;
  try {
    const base64 = token.split(".")[1];
    const normalized = base64.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const payload = atob(padded);
    return JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const extractRole = (token: string | undefined): string | null => {
  const payload = parseJwtPayload(token);
  return typeof payload?.role === "string" ? payload.role : null;
};

const workspaceFromToken = (token: string | undefined): string | null => {
  const payload = parseJwtPayload(token);
  return typeof payload?.workspaceId === "string" ? payload.workspaceId : null;
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("rvx_access_token")?.value;
  const role = extractRole(token);
  const workspaceId = workspaceFromToken(token);

  const isPublic = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && AUTH_ROUTES.includes(pathname)) {
    if (role === "SUPER_ADMIN") return NextResponse.redirect(new URL("/super-admin", request.url));
    if (role === "ADMIN") return NextResponse.redirect(new URL("/dashboard", request.url));
    return NextResponse.redirect(new URL("/agent", request.url));
  }

  if (pathname.startsWith("/super-admin") && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  if (pathname.startsWith("/dashboard") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  if (pathname.startsWith("/agent") && role !== "USER") {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  if (!pathname.startsWith("/super-admin") && !isPublic && !workspaceId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};
