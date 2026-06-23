export type CrmLayoutFieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "textarea"
  | "select"
  | "date"
  | "checkbox"
  | "url";

export type CrmLayoutSection = {
  id: string;
  name: string;
  description?: string;
  order: number;
  columns: 1 | 2;
  collapsedDefault?: boolean;
};

export type CrmLayoutField = {
  id: string;
  sectionId: string;
  label: string;
  key: string;
  type: CrmLayoutFieldType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  width: "full" | "half";
  order: number;
  options?: string[];
  showOnCreate: boolean;
  showOnEdit: boolean;
  isSystem?: boolean;
};

export const CRM_LAYOUT_FIELD_TYPES: {
  value: CrmLayoutFieldType;
  label: string;
  description: string;
}[] = [
  { value: "text", label: "Single line text", description: "Short text input" },
  { value: "email", label: "Email", description: "Validated email address" },
  { value: "tel", label: "Phone", description: "Phone with formatting" },
  { value: "number", label: "Number", description: "Numeric values only" },
  { value: "textarea", label: "Long text", description: "Multi-line notes" },
  { value: "select", label: "Dropdown", description: "Pick from options" },
  { value: "date", label: "Date", description: "Calendar date picker" },
  { value: "checkbox", label: "Checkbox", description: "Yes / no toggle" },
  { value: "url", label: "URL", description: "Website or link" },
];

export const DEMO_CRM_LAYOUT_SECTIONS: CrmLayoutSection[] = [
  {
    id: "sec_contact",
    name: "Contact",
    description: "Primary person details for the lead record.",
    order: 1,
    columns: 2,
  },
  {
    id: "sec_company",
    name: "Company",
    description: "Organization and role information.",
    order: 2,
    columns: 2,
  },
  {
    id: "sec_attribution",
    name: "Attribution",
    description: "Source, campaign, and ownership.",
    order: 3,
    columns: 2,
  },
  {
    id: "sec_notes",
    name: "Additional details",
    description: "Optional context captured at intake.",
    order: 4,
    columns: 1,
    collapsedDefault: true,
  },
];

export const DEMO_CRM_LAYOUT_FIELDS: CrmLayoutField[] = [
  {
    id: "f1",
    sectionId: "sec_contact",
    label: "Full name",
    key: "full_name",
    type: "text",
    required: true,
    placeholder: "e.g. Akshit Kesar",
    width: "half",
    order: 1,
    showOnCreate: true,
    showOnEdit: true,
    isSystem: true,
  },
  {
    id: "f2",
    sectionId: "sec_contact",
    label: "Work email",
    key: "work_email",
    type: "email",
    required: true,
    placeholder: "name@company.com",
    width: "half",
    order: 2,
    showOnCreate: true,
    showOnEdit: true,
    isSystem: true,
  },
  {
    id: "f3",
    sectionId: "sec_contact",
    label: "Phone number",
    key: "phone_number",
    type: "tel",
    required: true,
    placeholder: "+91 98765 43210",
    width: "half",
    order: 3,
    showOnCreate: true,
    showOnEdit: true,
  },
  {
    id: "f4",
    sectionId: "sec_contact",
    label: "LinkedIn URL",
    key: "linkedin_url",
    type: "url",
    required: false,
    placeholder: "https://linkedin.com/in/…",
    width: "half",
    order: 4,
    showOnCreate: true,
    showOnEdit: true,
  },
  {
    id: "f5",
    sectionId: "sec_company",
    label: "Company",
    key: "company",
    type: "text",
    required: true,
    placeholder: "Organization name",
    width: "half",
    order: 1,
    showOnCreate: true,
    showOnEdit: true,
    isSystem: true,
  },
  {
    id: "f6",
    sectionId: "sec_company",
    label: "Job title",
    key: "job_title",
    type: "text",
    required: false,
    placeholder: "e.g. VP Sales",
    width: "half",
    order: 2,
    showOnCreate: true,
    showOnEdit: true,
  },
  {
    id: "f7",
    sectionId: "sec_company",
    label: "Country",
    key: "country",
    type: "select",
    required: false,
    options: ["India", "United States", "United Kingdom", "Singapore", "UAE"],
    width: "half",
    order: 3,
    showOnCreate: true,
    showOnEdit: true,
  },
  {
    id: "f8",
    sectionId: "sec_company",
    label: "Employee count",
    key: "employee_count",
    type: "select",
    required: false,
    options: ["1–10", "11–50", "51–200", "201–500", "500+"],
    width: "half",
    order: 4,
    showOnCreate: true,
    showOnEdit: true,
  },
  {
    id: "f9",
    sectionId: "sec_attribution",
    label: "Lead source",
    key: "lead_source",
    type: "select",
    required: true,
    options: ["Inbound", "Outbound", "Partner", "Webinar", "Referral", "Facebook", "Event"],
    width: "half",
    order: 1,
    showOnCreate: true,
    showOnEdit: true,
    isSystem: true,
  },
  {
    id: "f10",
    sectionId: "sec_attribution",
    label: "Assigned owner",
    key: "assigned_owner",
    type: "select",
    required: true,
    options: ["Round robin · Sales team", "Priya Singh", "James Okon", "Elena Rossi"],
    width: "half",
    order: 2,
    showOnCreate: true,
    showOnEdit: false,
  },
  {
    id: "f11",
    sectionId: "sec_attribution",
    label: "Campaign",
    key: "campaign",
    type: "text",
    required: false,
    placeholder: "UTM or campaign name",
    width: "half",
    order: 3,
    showOnCreate: true,
    showOnEdit: true,
  },
  {
    id: "f12",
    sectionId: "sec_notes",
    label: "Initial notes",
    key: "initial_notes",
    type: "textarea",
    required: false,
    placeholder: "Context from the first touch…",
    helpText: "Visible to all CRM users with lead access.",
    width: "full",
    order: 1,
    showOnCreate: true,
    showOnEdit: true,
  },
];

export function slugifyLayoutKey(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48);
}

export function createSectionId() {
  return `sec_${Date.now()}`;
}

export function createFieldId() {
  return `f_${Date.now()}`;
}
