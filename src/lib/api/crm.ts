"use client";

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import {
  assertApiSuccess,
  toApiError,
  unwrapApiData,
} from "@/lib/api/api-envelope";
import { filenameFromContentDisposition, triggerBlobDownload } from "@/lib/hrm/download-blob";
import {
  DEMO_LEADS,
  type LeadRecord,
  type LeadStatus,
} from "@/features/workspace/data/crm-demo";

const useDummy = () => process.env.NEXT_PUBLIC_CRM_USE_DUMMY === "true";

export function normalizeLead(raw: any): LeadRecord {
  if (!raw) {
    throw new Error("Invalid raw lead data");
  }

  const custom = raw.customFields && typeof raw.customFields === "object" ? raw.customFields : {};
  const fitScore = typeof custom.fitScore === "number" ? custom.fitScore : 75;
  const engagementScore = typeof custom.engagementScore === "number" ? custom.engagementScore : 70;
  const score = typeof custom.score === "number" ? custom.score : Math.round((fitScore + engagementScore) / 2);

  // Score band resolver
  let scoreBand: any = "B1";
  if (score >= 90) scoreBand = "A1";
  else if (score >= 80) scoreBand = "A2";
  else if (score >= 70) scoreBand = "B1";
  else if (score >= 60) scoreBand = "B2";
  else scoreBand = "C";

  return {
    id: raw.id,
    reference: `LEAD-${raw.id.slice(-6).toUpperCase()}`,
    name: raw.name || "",
    title: custom.title || "Contact",
    company: raw.companyName || "",
    email: raw.email || "",
    phone: raw.phone || undefined,
    country: custom.country || "India",
    source: raw.source || "Inbound",
    score,
    fitScore,
    engagementScore,
    scoreBand,
    status: (raw.stageId || raw.stage || "new") as LeadStatus,
    lifecycle: custom.lifecycle || "lead",
    owner: raw.assignedTo || "Unassigned",
    slaStatus: custom.slaStatus || "on_track",
    slaDue: custom.slaDue || "24h left",
    firstTouchDue: custom.firstTouchDue || "Due today",
    lastActivity: raw.notes || "Created",
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toLocaleDateString() : "Just now",
    touchCount: typeof custom.touchCount === "number" ? custom.touchCount : 0,
    boardStage: raw.stageId || raw.stage || "new",
  };
}

export type CrmLeadActivity = {
  id: string;
  type: string;
  title?: string;
  notes?: string;
  status?: string;
  createdAt: string;
  createdBy?: string;
};

export type CrmLeadDetail = LeadRecord & {
  activities: CrmLeadActivity[];
  notes?: string;
};

export type CrmDashboardStats = {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  leadsByStage?: { stage: string; count: number }[];
  leadsBySource?: { source: string; count: number }[];
  weeklyConversions?: { label: string; count: number }[];
};

function normalizeLeadActivity(raw: Record<string, unknown>): CrmLeadActivity {
  return {
    id: String(raw.id ?? ""),
    type: String(raw.type ?? "note"),
    title: raw.title ? String(raw.title) : undefined,
    notes: raw.notes ? String(raw.notes) : undefined,
    status: raw.status ? String(raw.status) : undefined,
    createdAt: raw.createdAt ? String(raw.createdAt) : new Date().toISOString(),
    createdBy: raw.createdBy ? String(raw.createdBy) : undefined,
  };
}

function normalizeDashboardStats(raw: Record<string, unknown>): CrmDashboardStats {
  const pickList = <T,>(key: string): T[] | undefined => {
    const list = raw[key];
    if (!Array.isArray(list)) return undefined;
    return list as T[];
  };

  return {
    totalLeads: Number(raw.totalLeads ?? raw.total ?? 0),
    newLeads: Number(raw.newLeads ?? raw.new ?? 0),
    qualifiedLeads: Number(raw.qualifiedLeads ?? raw.qualified ?? 0),
    conversionRate: Number(raw.conversionRate ?? raw.conversion ?? 0),
    leadsByStage:
      pickList<{ stage: string; count: number }>("leadsByStage") ??
      pickList<{ stage: string; count: number }>("byStage"),
    leadsBySource:
      pickList<{ source: string; count: number }>("leadsBySource") ??
      pickList<{ source: string; count: number }>("bySource"),
    weeklyConversions:
      pickList<{ label: string; count: number }>("weeklyConversions") ??
      pickList<{ label: string; count: number }>("weekly"),
  };
}

export async function fetchCrmLeads(query: { search?: string; stage?: string; limit?: number } = {}): Promise<LeadRecord[]> {
  try {
    const { data } = await apiClient.get<any>(endpoints.crm.leads, {
      params: {
        search: query.search || undefined,
        stage: query.stage || undefined,
        limit: query.limit || 1000,
      },
    });
    assertApiSuccess(data);
    const list = unwrapApiData(data);
    if (!Array.isArray(list)) return [];
    return list.map(normalizeLead);
  } catch (err) {
    if (useDummy()) return DEMO_LEADS;
    throw toApiError(err, "Could not load CRM leads.");
  }
}

export async function fetchCrmLead(id: string): Promise<CrmLeadDetail> {
  try {
    const { data } = await apiClient.get<any>(endpoints.crm.lead(id));
    assertApiSuccess(data);
    const raw = unwrapApiData(data) as Record<string, unknown>;
    const activitiesRaw = raw.activities ?? raw.activityHistory ?? [];
    const activities = Array.isArray(activitiesRaw)
      ? activitiesRaw.map((item) => normalizeLeadActivity(item as Record<string, unknown>))
      : [];

    return {
      ...normalizeLead(raw),
      activities,
      notes: raw.notes ? String(raw.notes) : undefined,
    };
  } catch (err) {
    if (useDummy()) {
      const lead = DEMO_LEADS.find((l) => l.id === id);
      if (!lead) throw toApiError(err, "Lead not found.");
      return { ...lead, activities: [] };
    }
    throw toApiError(err, "Could not load lead.");
  }
}

export async function createCrmLead(payload: {
  name: string;
  title: string;
  company: string;
  email: string;
  phone?: string;
  country: string;
  source: string;
  owner?: string;
}): Promise<LeadRecord> {
  try {
    const backendPayload = {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      companyName: payload.company,
      source: payload.source,
      customFields: {
        title: payload.title,
        country: payload.country,
        ownerName: payload.owner,
      },
    };
    const { data } = await apiClient.post<any>(endpoints.crm.leads, backendPayload);
    assertApiSuccess(data);
    return normalizeLead(unwrapApiData(data));
  } catch (err) {
    throw toApiError(err, "Could not create lead.");
  }
}

export async function updateCrmLead(
  id: string,
  updates: Partial<LeadRecord> & { stage?: string; stageId?: string },
): Promise<LeadRecord> {
  try {
    const backendPayload: any = {};
    if (updates.name !== undefined) backendPayload.name = updates.name;
    if (updates.email !== undefined) backendPayload.email = updates.email;
    if (updates.phone !== undefined) backendPayload.phone = updates.phone;
    if (updates.company !== undefined) backendPayload.companyName = updates.company;
    if (updates.source !== undefined) backendPayload.source = updates.source;
    if (updates.status !== undefined) backendPayload.stage = updates.status;
    if (updates.stage !== undefined) backendPayload.stage = updates.stage;
    if (updates.stageId !== undefined) backendPayload.stageId = updates.stageId;

    // Preserve customFields structure
    if (updates.title || updates.country || updates.owner) {
      backendPayload.customFields = {
        title: updates.title,
        country: updates.country,
        ownerName: updates.owner,
      };
    }

    const { data } = await apiClient.put<any>(endpoints.crm.lead(id), backendPayload);
    assertApiSuccess(data);
    return normalizeLead(unwrapApiData(data));
  } catch (err) {
    throw toApiError(err, "Could not update lead.");
  }
}

export async function deleteCrmLead(id: string): Promise<void> {
  try {
    const { data } = await apiClient.delete<any>(endpoints.crm.lead(id));
    assertApiSuccess(data);
  } catch (err) {
    throw toApiError(err, "Could not delete lead.");
  }
}

export async function logCrmLeadActivity(
  leadId: string,
  payload: { type: string; title?: string; notes?: string; status?: string },
): Promise<CrmLeadActivity> {
  try {
    const { data } = await apiClient.post<any>(endpoints.crm.leadActivities(leadId), payload);
    assertApiSuccess(data);
    return normalizeLeadActivity(unwrapApiData(data) as Record<string, unknown>);
  } catch (err) {
    throw toApiError(err, "Could not log lead activity.");
  }
}

export async function fetchCrmDashboard(): Promise<CrmDashboardStats> {
  try {
    const { data } = await apiClient.get<any>(endpoints.crm.dashboard);
    assertApiSuccess(data);
    return normalizeDashboardStats(unwrapApiData(data) as Record<string, unknown>);
  } catch (err) {
    if (useDummy()) {
      return {
        totalLeads: DEMO_LEADS.length,
        newLeads: DEMO_LEADS.filter((l) => l.status === "new").length,
        qualifiedLeads: DEMO_LEADS.filter((l) => l.status === "qualified" || l.status === "interested").length,
        conversionRate: 24,
      };
    }
    throw toApiError(err, "Could not load CRM dashboard.");
  }
}

export async function exportCrmLeadsCsv(params: { search?: string; stage?: string } = {}): Promise<void> {
  try {
    const response = await apiClient.get(endpoints.crm.exportCsv, {
      params: {
        search: params.search || undefined,
        stage: params.stage || undefined,
      },
      responseType: "blob",
    });
    const filename = filenameFromContentDisposition(
      response.headers["content-disposition"] as string | undefined,
      "crm-leads-export.csv",
    );
    triggerBlobDownload(response.data as Blob, filename);
  } catch (err) {
    throw toApiError(err, "Could not export leads.");
  }
}

export async function bulkUpdateCrmLeadsStage(leadIds: string[], stage: string): Promise<number> {
  try {
    const { data } = await apiClient.patch<any>(endpoints.crm.bulkStage, {
      leadIds,
      stage,
    });
    assertApiSuccess(data);
    const result = unwrapApiData(data);
    return typeof result?.updated === "number" ? result.updated : leadIds.length;
  } catch (err) {
    throw toApiError(err, "Could not update leads stage in bulk.");
  }
}

export interface CrmStage {
  id: string;
  name: string;
  color?: string | null;
  position: number;
  pipelineId: string;
}

export interface CrmPipeline {
  id: string;
  name: string;
  companyId: string;
  stages: CrmStage[];
}

export async function fetchCrmPipelines(): Promise<CrmPipeline[]> {
  try {
    const { data } = await apiClient.get<any>(endpoints.crm.pipelines);
    assertApiSuccess(data);
    return unwrapApiData(data) || [];
  } catch (err) {
    if (useDummy()) return [];
    throw toApiError(err, "Could not load pipelines.");
  }
}

export async function createCrmStage(
  pipelineId: string,
  payload: { name: string; color?: string; position?: number }
): Promise<CrmStage> {
  try {
    const { data } = await apiClient.post<any>(endpoints.crm.stages(pipelineId), payload);
    assertApiSuccess(data);
    return unwrapApiData(data);
  } catch (err) {
    throw toApiError(err, "Could not create stage.");
  }
}

export async function updateCrmStage(
  pipelineId: string,
  stageId: string,
  payload: { name?: string; color?: string; position?: number }
): Promise<CrmStage> {
  try {
    const { data } = await apiClient.put<any>(endpoints.crm.stage(pipelineId, stageId), payload);
    assertApiSuccess(data);
    return unwrapApiData(data);
  } catch (err) {
    throw toApiError(err, "Could not update stage.");
  }
}

export async function deleteCrmStage(pipelineId: string, stageId: string): Promise<void> {
  try {
    const { data } = await apiClient.delete<any>(endpoints.crm.stage(pipelineId, stageId));
    assertApiSuccess(data);
  } catch (err) {
    throw toApiError(err, "Could not delete stage.");
  }
}
