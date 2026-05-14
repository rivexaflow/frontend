import { NextRequest, NextResponse } from "next/server";
import { RESERVED_ROOT_SEGMENTS } from "@/lib/constants/routes";

const AUTH_COOKIE = "rvx_access_token";

const PUBLIC_EXACT = new Set([
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/admin/login",
  "/logout",
  "/pricing",
  "/about",
  "/contact",
  "/forbidden",
]);

const AUTH_ONLY = new Set([
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/admin/login",
]);

const parseJwtPayload = (token: string | undefined): Record<string, unknown> | null => {
  if (!token) return null;
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
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

/** Robust cookie deletion: cover both Lax/Strict and ensure expiry is unambiguous. */
const clearAuthCookie = (response: NextResponse) => {
  response.cookies.set({
    name: AUTH_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    sameSite: "lax",
  });
};

/** Where this authenticated user "belongs" — used to softly redirect away from wrong areas. */
const homePathForRole = (
  role: string | null,
  workspaceSlug: string | null,
): string | null => {
  if (role === "SUPER_ADMIN") return "/super-admin";
  if ((role === "ADMIN" || role === "USER") && workspaceSlug) {
    return `/${workspaceSlug}/dashboard`;
  }
  return null;
};

/**
 * The login route a user "belongs to" when they hit the wrong auth screen
 * while still carrying a session.
 *  - SUPER_ADMIN  → /admin/login  (platform operators)
 *  - ADMIN / USER → /login        (organization workspace users)
 */
const loginPathForRole = (role: string | null): string => {
  if (role === "SUPER_ADMIN") return "/admin/login";
  return "/login";
};

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const role = extractRole(token);
  const workspaceId = workspaceIdFromToken(token);
  const workspaceSlug = workspaceSlugFromToken(token);

  const isPublic = PUBLIC_EXACT.has(pathname) || pathname.startsWith("/invite/");
  const wantsSignout =
    searchParams.get("signout") === "1" ||
    searchParams.get("force") === "1" ||
    pathname === "/logout";

  // /logout — always clear and allow through (page does client-side cleanup + redirect)
  if (pathname === "/logout") {
    const response = NextResponse.next();
    clearAuthCookie(response);
    return response;
  }

  // /login?signout=1 or /login?force=1 etc — clear cookie at the edge, then render the form.
  if (AUTH_ONLY.has(pathname) && wantsSignout) {
    const response = NextResponse.next();
    clearAuthCookie(response);
    return response;
  }

  // Anonymous user hitting a protected route → go to /login
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Authed user hitting an auth-only screen (login/signup/...).
  // Behaviour is split by which auth screen they hit:
  //
  //   /login (organization workspace login):
  //     - ADMIN / USER  → straight to their workspace dashboard.
  //     - SUPER_ADMIN   → wrong door; send them to /admin/login so they don't
  //                       accidentally end up in /super-admin without choosing it.
  //
  //   /admin/login (platform operator login):
  //     - SUPER_ADMIN   → straight to /super-admin.
  //     - ADMIN / USER  → wrong door; send them to /login (or their dashboard).
  if (token && AUTH_ONLY.has(pathname)) {
    if (pathname === "/login") {
      if (role === "ADMIN" || role === "USER") {
        const slug = workspaceSlug ?? "acme-corp";
        return NextResponse.redirect(new URL(`/${slug}/dashboard`, request.url));
      }
      if (role === "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    } else if (pathname === "/admin/login") {
      if (role === "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/super-admin", request.url));
      }
      if (role === "ADMIN" || role === "USER") {
        return NextResponse.redirect(new URL(loginPathForRole(role), request.url));
      }
    } else {
      // /signup, /forgot-password, /reset-password — just take them home if we can.
      const home = homePathForRole(role, workspaceSlug);
      if (home) return NextResponse.redirect(new URL(home, request.url));
    }

    // Unknown role on an existing cookie → session is corrupt, clear it and let the page render.
    const response = NextResponse.next();
    clearAuthCookie(response);
    return response;
  }

  // Platform (super-admin) routes
  if (pathname.startsWith("/super-admin")) {
    if (role === "SUPER_ADMIN") return NextResponse.next();
    // Workspace user wandering into platform area → send them to their dashboard, not 403.
    if ((role === "ADMIN" || role === "USER") && workspaceSlug) {
      return NextResponse.redirect(new URL(`/${workspaceSlug}/dashboard`, request.url));
    }
    // Anonymous / unknown role → log in.
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Workspace routes
  if (isWorkspacePath(pathname)) {
    // Super admin trying to access a workspace → take them to their own home.
    if (role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/super-admin", request.url));
    }
    // No usable role → log in (session is incomplete).
    if (role !== "ADMIN" && role !== "USER") {
      const response = NextResponse.redirect(new URL("/login", request.url));
      clearAuthCookie(response);
      return response;
    }
    // Wrong workspace slug → silently route to the correct workspace with the same sub-path.
    const segments = pathname.split("/").filter(Boolean);
    const requestedSlug = segments[0];
    if (workspaceSlug && requestedSlug !== workspaceSlug) {
      const rest = segments.slice(1).join("/");
      return NextResponse.redirect(
        new URL(`/${workspaceSlug}/${rest || "dashboard"}`, request.url),
      );
    }
    if (!workspaceId) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      clearAuthCookie(response);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
