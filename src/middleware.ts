import { NextRequest, NextResponse } from "next/server";
import { RESERVED_ROOT_SEGMENTS } from "@/lib/constants/routes";

const PUBLIC_EXACT = new Set([
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/admin/login",
  "/pricing",
  "/about",
  "/contact",
  "/forbidden"
]);

const AUTH_ONLY = new Set(["/login", "/signup", "/forgot-password", "/reset-password", "/admin/login"]);

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

const workspaceIdFromToken = (token: string | undefined): string | null => {
  const payload = parseJwtPayload(token);
  return typeof payload?.workspaceId === "string" ? payload.workspaceId : null;
};

const workspaceSlugFromToken = (token: string | undefined): string | null => {
  const payload = parseJwtPayload(token);
  return typeof payload?.workspaceSlug === "string" ? payload.workspaceSlug : null;
};

const isWorkspacePath = (pathname: string) => {
  const first = pathname.split("/").filter(Boolean)[0];
  if (!first) return false;
  return !RESERVED_ROOT_SEGMENTS.has(first);
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("rvx_access_token")?.value;
  const role = extractRole(token);
  const workspaceId = workspaceIdFromToken(token);
  const workspaceSlug = workspaceSlugFromToken(token);

  const isPublic = PUBLIC_EXACT.has(pathname) || pathname.startsWith("/invite/");

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && (AUTH_ONLY.has(pathname) || pathname.startsWith("/invite/"))) {
    if (role === "SUPER_ADMIN") return NextResponse.redirect(new URL("/super-admin", request.url));
    if (role === "ADMIN" || role === "USER") {
      const slug = workspaceSlug ?? "acme-corp";
      return NextResponse.redirect(new URL(`/${slug}/dashboard`, request.url));
    }
  }

  if (pathname.startsWith("/super-admin") && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  if (isWorkspacePath(pathname)) {
    if (role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }
    if (role !== "ADMIN" && role !== "USER") {
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }
    const slug = pathname.split("/").filter(Boolean)[0];
    if (workspaceSlug && slug !== workspaceSlug) {
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }
    if (!workspaceId) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};
