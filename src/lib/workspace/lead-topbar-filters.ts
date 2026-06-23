import type { LeadRecord } from "@/features/workspace/data/crm-demo";
import type { AdvancedLeadFilters, SearchableFieldId } from "@/stores/workspace-topbar.store";

export function matchesLeadQuickSearch(
  lead: LeadRecord,
  query: string,
  fields: Record<SearchableFieldId, boolean>,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const candidates: string[] = [];
  if (fields.name) candidates.push(lead.name);
  if (fields.title) candidates.push(lead.title);
  if (fields.email) candidates.push(lead.email);
  if (fields.phone && lead.phone) candidates.push(lead.phone);
  if (fields.company) candidates.push(lead.company);
  if (fields.source) candidates.push(lead.source);
  if (fields.owner) candidates.push(lead.owner);
  if (fields.reference) candidates.push(lead.reference);

  return candidates.some((value) => value.toLowerCase().includes(q));
}

export function matchesLeadAdvancedFilters(lead: LeadRecord, filters: AdvancedLeadFilters): boolean {
  if (filters.responsiblePerson && lead.owner !== filters.responsiblePerson) return false;
  if (filters.leadStage && lead.status !== filters.leadStage) return false;
  if (filters.source && lead.source !== filters.source) return false;
  if (filters.clientCode && !lead.reference.toLowerCase().includes(filters.clientCode.toLowerCase())) return false;
  if (filters.segment && !lead.company.toLowerCase().includes(filters.segment.toLowerCase())) return false;
  if (filters.additionalNumber && lead.phone && !lead.phone.includes(filters.additionalNumber)) return false;
  return true;
}
