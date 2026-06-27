import { apiClient } from "@/lib/api/client";
import {
  parseThemeConfig,
  type CompanyBrandingPayload,
  type WorkspaceThemeConfig,
} from "@/features/workspace/schemas/branding.schema";

export type CustomDomainRecord = {
  id: string;
  domain: string;
  module: string;
  createdAt: string;
};

export type DnsVerificationResult = {
  domain: string;
  isVerified: boolean;
  aRecords: string[];
  cnameRecords: string[];
  platformIp: string;
  platformCname: string;
  aMatch: boolean;
  cnameMatch: boolean;
  status: "verified" | "pending";
  message: string;
  resolvedA: string | null;
  resolvedCname: string | null;
};

export type CompanyBrandingResponse = {
  brandName?: string | null;
  logo?: string | null;
  customDomain?: string | null;
  slug?: string | null;
  themeConfig?: unknown;
};

export async function fetchCompanyBranding(companyId: string): Promise<CompanyBrandingResponse> {
  const { data } = await apiClient.get(`/company/${companyId}`);
  if (!data?.success) throw new Error(data?.message || "Failed to load branding.");
  return data.data as CompanyBrandingResponse;
}

export async function saveCompanyBranding(
  companyId: string,
  payload: Pick<CompanyBrandingPayload, "brandName" | "logo" | "themeConfig">,
) {
  const { data } = await apiClient.put(`/company/${companyId}`, payload);
  if (!data?.success) throw new Error(data?.message || "Failed to save branding.");
  return data.data;
}

export async function saveCompanyCustomDomain(companyId: string, customDomain: string | null) {
  const { data } = await apiClient.patch(`/company/${companyId}/branding`, { customDomain });
  if (!data?.success) throw new Error(data?.message || "Failed to save custom domain.");
  return data.data;
}

export async function fetchCustomDomains(companyId: string): Promise<CustomDomainRecord[]> {
  const { data } = await apiClient.get(`/company/${companyId}/custom-domains`);
  if (!data?.success) throw new Error(data?.message || "Failed to load custom domains.");
  return (data.data || []) as CustomDomainRecord[];
}

export async function connectCustomDomain(
  companyId: string,
  domain: string,
  module: string,
): Promise<CustomDomainRecord> {
  const { data } = await apiClient.post(`/company/${companyId}/custom-domains`, { domain, module });
  if (!data?.success) throw new Error(data?.message || "Failed to connect domain.");
  return data.data as CustomDomainRecord;
}

export async function disconnectCustomDomain(companyId: string, domainId: string) {
  const { data } = await apiClient.delete(`/company/${companyId}/custom-domains/${domainId}`);
  if (!data?.success) throw new Error(data?.message || "Failed to disconnect domain.");
  return data.data;
}

export async function verifyCompanyDns(
  companyId: string,
  domain: string,
): Promise<DnsVerificationResult> {
  const { data } = await apiClient.post(`/company/${companyId}/verify-dns`, { domain });
  if (!data?.success) throw new Error(data?.message || "DNS verification failed.");
  return data.data as DnsVerificationResult;
}

export function buildBrandingPayload(input: {
  brandName: string;
  logo: string;
  theme: WorkspaceThemeConfig;
}): Pick<CompanyBrandingPayload, "brandName" | "logo" | "themeConfig"> {
  return {
    brandName: input.brandName.trim() || null,
    logo: input.logo.trim() || null,
    themeConfig: input.theme,
  };
}

export function brandingFromCompany(company: CompanyBrandingResponse) {
  return {
    brandName: company.brandName || "",
    logo: company.logo || "",
    customDomain: company.customDomain || "",
    slug: company.slug || "",
    theme: parseThemeConfig(company.themeConfig),
  };
}

export const PLATFORM_DNS = {
  ip: "193.203.184.192",
  cname: "rivexaflow.in",
  defaultSubdomainSuffix: "rivexaflow.in",
} as const;
