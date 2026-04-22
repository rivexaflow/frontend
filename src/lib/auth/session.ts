const AUTH_COOKIE = "rvx_access_token";

const b64url = (value: object) =>
  btoa(JSON.stringify(value))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");

export const encodeDemoJwt = (payload: Record<string, unknown>) =>
  `${b64url({ alg: "none", typ: "JWT" })}.${b64url(payload)}.demo`;

export const setSessionCookie = (token: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(token)}; Path=/; SameSite=Lax`;
};

export const clearSessionCookie = () => {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
};
