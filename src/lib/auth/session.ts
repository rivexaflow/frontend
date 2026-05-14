const AUTH_COOKIE = "rvx_access_token";
const REMEMBER_ME_DAYS = 30;

const b64url = (value: object) =>
  btoa(JSON.stringify(value))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");

export const encodeDemoJwt = (payload: Record<string, unknown>) =>
  `${b64url({ alg: "none", typ: "JWT" })}.${b64url(payload)}.demo`;

type SetSessionCookieOptions = {
  /** When true, persist the cookie for ~30 days. Otherwise session-only. */
  remember?: boolean;
};

export const setSessionCookie = (
  token: string,
  options: SetSessionCookieOptions = {},
) => {
  if (typeof document === "undefined") return;
  const parts = [
    `${AUTH_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "SameSite=Lax",
  ];
  if (options.remember) {
    parts.push(`Max-Age=${REMEMBER_ME_DAYS * 24 * 60 * 60}`);
  }
  document.cookie = parts.join("; ");
};

export const clearSessionCookie = () => {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
};
