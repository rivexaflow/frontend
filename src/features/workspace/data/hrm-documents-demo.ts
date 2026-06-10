import { DEMO_HRM_EMPLOYEE_DIRECTORY } from "@/features/workspace/data/hrm-employees-demo";
import type {
  EmployeeDocumentSubmission,
  HrmDocumentCategory,
  HrmDocumentStatus,
  HrmDocumentTypeCard,
} from "@/types/hrm";

export type {
  EmployeeDocumentSubmission,
  HrmDocumentCategory,
  HrmDocumentStatus,
  HrmDocumentTypeCard,
} from "@/types/hrm";

export const HRM_DOCUMENT_TYPES: HrmDocumentTypeCard[] = [
  {
    id: "doc_type_aadhaar",
    title: "Aadhaar Card",
    shortLabel: "Aadhaar",
    category: "id_proof",
    description: "Government-issued identity proof required for payroll and statutory compliance in India.",
    mandatory: true,
    renewalMonths: 120,
  },
  {
    id: "doc_type_pan",
    title: "PAN Card",
    shortLabel: "PAN",
    category: "id_proof",
    description: "Permanent Account Number for tax deduction and Form 16 issuance.",
    mandatory: true,
  },
  {
    id: "doc_type_contract",
    title: "Employment Contract",
    shortLabel: "Contract",
    category: "contract",
    description: "Signed employment agreement with terms, compensation, and notice period.",
    mandatory: true,
  },
  {
    id: "doc_type_offer",
    title: "Offer Letter",
    shortLabel: "Offer letter",
    category: "offer_letter",
    description: "Original offer letter accepted at time of joining.",
    mandatory: true,
  },
  {
    id: "doc_type_passport",
    title: "Passport",
    shortLabel: "Passport",
    category: "id_proof",
    description: "Required for international travel approvals and visa processing.",
    mandatory: false,
    renewalMonths: 120,
  },
  {
    id: "doc_type_policy_ack",
    title: "Policy Acknowledgment Pack",
    shortLabel: "Policy ack",
    category: "policy_ack",
    description: "Signed acknowledgment of current company policy pack (annual refresh).",
    mandatory: true,
    renewalMonths: 12,
  },
];

export const HRM_DOCUMENT_CATEGORIES: { id: HrmDocumentCategory; label: string }[] = [
  { id: "contract", label: "Employment contract" },
  { id: "offer_letter", label: "Offer letter" },
  { id: "id_proof", label: "ID proof" },
  { id: "certificate", label: "Certificate" },
  { id: "policy_ack", label: "Policy acknowledgment" },
  { id: "other", label: "Other" },
];

/** Deterministic submission pattern per employee + document type. */
function buildSubmissions(): EmployeeDocumentSubmission[] {
  const records: EmployeeDocumentSubmission[] = [];
  const activeEmployees = DEMO_HRM_EMPLOYEE_DIRECTORY.filter(
    (e) => e.status === "active" || e.status === "probation" || e.status === "on_leave",
  );

  for (const emp of activeEmployees) {
    for (const docType of HRM_DOCUMENT_TYPES) {
      const seed = (emp.id.charCodeAt(emp.id.length - 1) + docType.id.length) % 10;
      const submitted =
        docType.id === "doc_type_aadhaar"
          ? seed !== 2 && seed !== 7
          : docType.id === "doc_type_pan"
            ? seed > 1
            : docType.id === "doc_type_contract"
              ? seed !== 0
              : seed > 2;

      let status: HrmDocumentStatus = "not_submitted";
      if (submitted) {
        if (seed === 3) status = "pending";
        else if (seed === 4) status = "expired";
        else if (seed === 5) status = "rejected";
        else status = "verified";
      }

      records.push({
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        employeeName: emp.name,
        department: emp.department,
        location: emp.location,
        documentTypeId: docType.id,
        submitted,
        status,
        submittedAt: submitted
          ? ["Apr 2, 2026", "May 10, 2026", "Jan 15, 2025", "Mar 8, 2026"][seed % 4]
          : undefined,
        fileName: submitted
          ? `${emp.name.toLowerCase().replace(/\s+/g, "-")}-${docType.shortLabel.toLowerCase().replace(/\s+/g, "-")}.pdf`
          : undefined,
        verifiedBy: status === "verified" ? "Sarah Chen" : undefined,
      });
    }
  }

  return records;
}

export const DEMO_EMPLOYEE_DOCUMENT_SUBMISSIONS = buildSubmissions();

export function getDocumentTypeStats(typeId: string, submissions = DEMO_EMPLOYEE_DOCUMENT_SUBMISSIONS) {
  const rows = submissions.filter((s) => s.documentTypeId === typeId);
  const submitted = rows.filter((s) => s.submitted).length;
  const verified = rows.filter((s) => s.status === "verified").length;
  const pending = rows.filter((s) => s.submitted && s.status === "pending").length;
  const missing = rows.filter((s) => !s.submitted).length;
  return { total: rows.length, submitted, verified, pending, missing };
}
