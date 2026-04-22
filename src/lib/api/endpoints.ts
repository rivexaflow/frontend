export const endpoints = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh"
  },
  workspace: (slug: string) => `/workspaces/${slug}`
};
