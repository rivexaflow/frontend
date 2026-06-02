export type KycCaseStatus = "pending" | "in_review" | "approved" | "rejected" | "escalated";
export type KycRiskLevel = "low" | "medium" | "high";
export type VerificationType =
  | "individual_kyc"
  | "corporate_kyb"
  | "ubo_verification"
  | "enhanced_due_diligence";

export type KycCase = {
  id: string;
  reference: string;
  applicant: string;
  company: string;
  email: string;
  verificationType: VerificationType;
  jurisdiction: string;
  risk: KycRiskLevel;
  status: KycCaseStatus;
  owner: string;
  provider: string;
  aiScore: number;
  slaDue: string;
  createdAt: string;
  pepHit: boolean;
  sanctionsHit: boolean;
  documentsComplete: number;
  documentsTotal: number;
};

export type ScreeningAlert = {
  id: string;
  caseRef: string;
  subject: string;
  listType: "pep" | "sanctions" | "adverse_media";
  matchStrength: number;
  status: "open" | "cleared" | "confirmed";
  source: string;
  detectedAt: string;
};

export type KycDocument = {
  id: string;
  caseRef: string;
  applicant: string;
  docType: string;
  status: "pending" | "verified" | "failed" | "expired";
  liveness: boolean;
  ocrConfidence: number;
  uploadedAt: string;
};

export type MonitoringEvent = {
  id: string;
  caseRef: string;
  subject: string;
  eventType: "rescreen" | "status_change" | "document_expiry" | "risk_elevation";
  severity: "info" | "warning" | "critical";
  message: string;
  occurredAt: string;
};

export type AuditEntry = {
  id: string;
  actor: string;
  action: string;
  resource: string;
  caseRef?: string;
  ip: string;
  timestamp: string;
};

export const VERIFICATION_TYPE_LABELS: Record<VerificationType, string> = {
  individual_kyc: "Individual KYC",
  corporate_kyb: "Corporate KYB",
  ubo_verification: "UBO verification",
  enhanced_due_diligence: "Enhanced due diligence",
};

export const DEMO_KYC_CASES: KycCase[] = [
  {
    id: "kc1",
    reference: "KYC-2026-1042",
    applicant: "David Park",
    company: "Apex FinServ",
    email: "david@apexfs.com",
    verificationType: "individual_kyc",
    jurisdiction: "United States",
    risk: "high",
    status: "pending",
    owner: "Elena Rossi",
    provider: "Onfido",
    aiScore: 42,
    slaDue: "1h left",
    createdAt: "Today, 09:14",
    pepHit: true,
    sanctionsHit: false,
    documentsComplete: 2,
    documentsTotal: 4,
  },
  {
    id: "kc2",
    reference: "KYC-2026-1041",
    applicant: "Sofia Alvarez",
    company: "Brightline Retail",
    email: "sofia@brightline.com",
    verificationType: "corporate_kyb",
    jurisdiction: "United Kingdom",
    risk: "medium",
    status: "in_review",
    owner: "Priya Singh",
    provider: "Sumsub",
    aiScore: 78,
    slaDue: "4h left",
    createdAt: "Today, 07:30",
    pepHit: false,
    sanctionsHit: false,
    documentsComplete: 5,
    documentsTotal: 6,
  },
  {
    id: "kc3",
    reference: "KYC-2026-1038",
    applicant: "Mei Tanaka",
    company: "Orbit Logistics",
    email: "mei@orbitlogistics.jp",
    verificationType: "ubo_verification",
    jurisdiction: "Japan",
    risk: "low",
    status: "approved",
    owner: "James Okon",
    provider: "Onfido",
    aiScore: 94,
    slaDue: "—",
    createdAt: "Yesterday",
    pepHit: false,
    sanctionsHit: false,
    documentsComplete: 3,
    documentsTotal: 3,
  },
  {
    id: "kc4",
    reference: "KYC-2026-1035",
    applicant: "Robert Klein",
    company: "Sterling Holdings",
    email: "r.klein@sterling.com",
    verificationType: "enhanced_due_diligence",
    jurisdiction: "Germany",
    risk: "high",
    status: "escalated",
    owner: "Priya Singh",
    provider: "ComplyAdvantage",
    aiScore: 55,
    slaDue: "Overdue",
    createdAt: "May 24",
    pepHit: true,
    sanctionsHit: true,
    documentsComplete: 4,
    documentsTotal: 8,
  },
  {
    id: "kc5",
    reference: "KYC-2026-1032",
    applicant: "Lina Hassan",
    company: "NovaPay",
    email: "lina@novapay.io",
    verificationType: "corporate_kyb",
    jurisdiction: "UAE",
    risk: "medium",
    status: "in_review",
    owner: "Elena Rossi",
    provider: "Sumsub",
    aiScore: 71,
    slaDue: "6h left",
    createdAt: "May 24",
    pepHit: false,
    sanctionsHit: false,
    documentsComplete: 4,
    documentsTotal: 5,
  },
  {
    id: "kc6",
    reference: "KYC-2026-1029",
    applicant: "Tomás Rivera",
    company: "LatAm Logistics",
    email: "tomas@latamlogistics.mx",
    verificationType: "individual_kyc",
    jurisdiction: "Mexico",
    risk: "low",
    status: "approved",
    owner: "James Okon",
    provider: "Onfido",
    aiScore: 91,
    slaDue: "—",
    createdAt: "May 23",
    pepHit: false,
    sanctionsHit: false,
    documentsComplete: 3,
    documentsTotal: 3,
  },
  {
    id: "kc7",
    reference: "KYC-2026-1026",
    applicant: "Cody Fisher",
    company: "Stark Industries",
    email: "cody@stark.com",
    verificationType: "individual_kyc",
    jurisdiction: "United States",
    risk: "high",
    status: "rejected",
    owner: "Priya Singh",
    provider: "Onfido",
    aiScore: 38,
    slaDue: "—",
    createdAt: "May 22",
    pepHit: false,
    sanctionsHit: true,
    documentsComplete: 2,
    documentsTotal: 4,
  },
];

export const DEMO_SCREENING_ALERTS: ScreeningAlert[] = [
  {
    id: "sa1",
    caseRef: "KYC-2026-1042",
    subject: "David Park",
    listType: "pep",
    matchStrength: 87,
    status: "open",
    source: "Global PEP registry",
    detectedAt: "2h ago",
  },
  {
    id: "sa2",
    caseRef: "KYC-2026-1035",
    subject: "Robert Klein",
    listType: "sanctions",
    matchStrength: 92,
    status: "open",
    source: "OFAC SDN",
    detectedAt: "5h ago",
  },
  {
    id: "sa3",
    caseRef: "KYC-2026-1035",
    subject: "Sterling Holdings GmbH",
    listType: "adverse_media",
    matchStrength: 74,
    status: "open",
    source: "Adverse media feed",
    detectedAt: "Yesterday",
  },
  {
    id: "sa4",
    caseRef: "KYC-2026-1026",
    subject: "Cody Fisher",
    listType: "sanctions",
    matchStrength: 95,
    status: "confirmed",
    source: "EU consolidated list",
    detectedAt: "May 22",
  },
  {
    id: "sa5",
    caseRef: "KYC-2026-1038",
    subject: "Mei Tanaka",
    listType: "pep",
    matchStrength: 45,
    status: "cleared",
    source: "PEP adjacent",
    detectedAt: "May 20",
  },
];

export const DEMO_KYC_DOCUMENTS: KycDocument[] = [
  {
    id: "d1",
    caseRef: "KYC-2026-1042",
    applicant: "David Park",
    docType: "Passport",
    status: "verified",
    liveness: true,
    ocrConfidence: 96,
    uploadedAt: "Today",
  },
  {
    id: "d2",
    caseRef: "KYC-2026-1042",
    applicant: "David Park",
    docType: "Proof of address",
    status: "pending",
    liveness: false,
    ocrConfidence: 0,
    uploadedAt: "Today",
  },
  {
    id: "d3",
    caseRef: "KYC-2026-1041",
    applicant: "Brightline Retail",
    docType: "Certificate of incorporation",
    status: "verified",
    liveness: false,
    ocrConfidence: 98,
    uploadedAt: "Today",
  },
  {
    id: "d4",
    caseRef: "KYC-2026-1041",
    applicant: "Sofia Alvarez",
    docType: "Director ID",
    status: "verified",
    liveness: true,
    ocrConfidence: 94,
    uploadedAt: "Today",
  },
  {
    id: "d5",
    caseRef: "KYC-2026-1035",
    applicant: "Robert Klein",
    docType: "Source of funds",
    status: "failed",
    liveness: false,
    ocrConfidence: 62,
    uploadedAt: "May 24",
  },
  {
    id: "d6",
    caseRef: "KYC-2026-1032",
    applicant: "NovaPay",
    docType: "UBO registry extract",
    status: "pending",
    liveness: false,
    ocrConfidence: 0,
    uploadedAt: "May 24",
  },
];

export const DEMO_MONITORING_EVENTS: MonitoringEvent[] = [
  {
    id: "m1",
    caseRef: "KYC-2026-1042",
    subject: "David Park",
    eventType: "risk_elevation",
    severity: "critical",
    message: "PEP match detected on daily rescreen",
    occurredAt: "2h ago",
  },
  {
    id: "m2",
    caseRef: "KYC-2026-1035",
    subject: "Robert Klein",
    eventType: "rescreen",
    severity: "critical",
    message: "New sanctions list hit — OFAC SDN",
    occurredAt: "5h ago",
  },
  {
    id: "m3",
    caseRef: "KYC-2026-1032",
    subject: "Lina Hassan / NovaPay",
    eventType: "document_expiry",
    severity: "warning",
    message: "Trade license expires in 14 days",
    occurredAt: "Today",
  },
  {
    id: "m4",
    caseRef: "KYC-2026-1038",
    subject: "Mei Tanaka",
    eventType: "status_change",
    severity: "info",
    message: "Periodic review completed — no change",
    occurredAt: "Yesterday",
  },
];

export const DEMO_KYC_AUDIT: AuditEntry[] = [
  {
    id: "au1",
    actor: "Priya Singh",
    action: "Case approved",
    resource: "KYC-2026-1038",
    caseRef: "KYC-2026-1038",
    ip: "10.0.4.12",
    timestamp: "Today, 11:02",
  },
  {
    id: "au2",
    actor: "Elena Rossi",
    action: "PEP alert escalated",
    resource: "KYC-2026-1042",
    caseRef: "KYC-2026-1042",
    ip: "10.0.4.28",
    timestamp: "Today, 09:45",
  },
  {
    id: "au3",
    actor: "System",
    action: "Daily rescreen completed",
    resource: "Monitoring batch",
    ip: "—",
    timestamp: "Today, 06:00",
  },
  {
    id: "au4",
    actor: "James Okon",
    action: "Document rejected",
    resource: "KYC-2026-1035",
    caseRef: "KYC-2026-1035",
    ip: "10.0.4.19",
    timestamp: "May 24, 16:20",
  },
  {
    id: "au5",
    actor: "Priya Singh",
    action: "Case rejected",
    resource: "KYC-2026-1026",
    caseRef: "KYC-2026-1026",
    ip: "10.0.4.12",
    timestamp: "May 22, 14:08",
  },
];

export const KYC_MODULES = [
  { id: "cases", label: "Case queue", description: "Review, approve, and escalate verification cases" },
  { id: "identity", label: "Identity", description: "Individual KYC and corporate KYB workflows" },
  { id: "screening", label: "PEP & sanctions", description: "Watchlist and adverse media screening" },
  { id: "documents", label: "Documents", description: "OCR, liveness, and document forensics" },
  { id: "monitoring", label: "Ongoing monitoring", description: "Continuous rescreening and alerts" },
  { id: "audit", label: "Audit trail", description: "Regulator-ready activity log" },
] as const;

export type KycModuleId = (typeof KYC_MODULES)[number]["id"];
