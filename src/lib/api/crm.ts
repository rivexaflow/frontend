"use client";

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import {
  assertApiSuccess,
  toApiError,
  unwrapApiData,
} from "@/lib/api/api-envelope";
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
    status: (raw.stage || "new") as LeadStatus,
    lifecycle: custom.lifecycle || "lead",
    owner: raw.assignedTo || "Unassigned",
    slaStatus: custom.slaStatus || "on_track",
    slaDue: custom.slaDue || "24h left",
    firstTouchDue: custom.firstTouchDue || "Due today",
    lastActivity: raw.notes || "Created",
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toLocaleDateString() : "Just now",
    touchCount: typeof custom.touchCount === "number" ? custom.touchCount : 0,
    boardStage: raw.stage || "new",
  };
}

export async function fetchCrmLeads(query: { search?: string; stage?: string } = {}): Promise<LeadRecord[]> {
  try {
    const { data } = await apiClient.get<any>(endpoints.crm.leads, {
      params: {
        search: query.search || undefined,
        stage: query.stage || undefined,
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
