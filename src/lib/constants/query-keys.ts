export const queryKeys = {
  workspace: (slug: string) => ["workspace", slug] as const,
  crmContacts: (slug: string) => ["crm", "contacts", slug] as const
};
