export const endpoints = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    register: "/auth/register",
    refresh: "/auth/refresh",
    profile: "/auth/profile",
    changePassword: "/auth/change-password",
  },
  workspace: (slug: string) => `/workspaces/${slug}`,
};
