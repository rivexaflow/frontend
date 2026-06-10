import type { HrmReportFormat, HrmReportRun } from "@/features/workspace/data/hrm-reports-demo";

type ReportRow = Record<string, string | number>;

const SAMPLE_ROWS: Record<string, ReportRow[]> = {
  headcount: [
    { Department: "Executive", Location: "Mumbai, IN", Active: 2, Contractors: 0, "Open roles": 0 },
    { Department: "Revenue", Location: "Mumbai, IN", Active: 18, Contractors: 2, "Open roles": 3 },
    { Department: "Compliance", Location: "London, UK", Active: 9, Contractors: 0, "Open roles": 1 },
    { Department: "Human Resources", Location: "Singapore", Active: 6, Contractors: 0, "Open roles": 0 },
    { Department: "Operations", Location: "Bengaluru, IN", Active: 14, Contractors: 1, "Open roles": 2 },
  ],
  attrition: [
    { Employee: "Rajesh Iyer", Department: "Revenue", Tenure: "4.2 yrs", Type: "Voluntary", "Exit date": "May 2026" },
    { Employee: "Lisa Park", Department: "Operations", Tenure: "1.1 yrs", Type: "Involuntary", "Exit date": "Apr 2026" },
  ],
  payroll: [
    { Employee: "Priya Mehta", "Gross pay": 285000, Deductions: 42000, "Net pay": 243000, Currency: "INR" },
    { Employee: "Anil Yadav", "Gross pay": 165000, Deductions: 24800, "Net pay": 140200, Currency: "INR" },
    { Employee: "Marcus Webb", "Gross pay": 92000, Deductions: 18400, "Net pay": 73600, Currency: "GBP" },
  ],
  attendance: [
    { Employee: "Alex Morgan", Present: 22, Late: 1, Absent: 0, "Leave days": 1, "%": "95.7" },
    { Employee: "Neha Kapoor", Present: 20, Late: 2, Absent: 1, "Leave days": 2, "%": "87.0" },
  ],
  leave: [
    { Employee: "Elena Rossi", "Annual balance": 12, Used: 6, Accrued: 1.5, "Closing balance": 7.5 },
    { Employee: "James Okonkwo", "Annual balance": 14, Used: 3, Accrued: 1.5, "Closing balance": 12.5 },
  ],
  compliance: [
    { Policy: "Remote & Hybrid Work", Acknowledged: 118, Pending: 6, Overdue: 0 },
    { Policy: "Annual Leave & Encashment", Acknowledged: 96, Pending: 28, Overdue: 4 },
    { Policy: "Anti-Harassment & POSH", Acknowledged: 124, Pending: 0, Overdue: 0 },
  ],
};

function escapeCsv(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function rowsToCsv(rows: ReportRow[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => headers.map((h) => escapeCsv(row[h] ?? "")).join(",")),
  ];
  return `\uFEFF${lines.join("\n")}`;
}

function rowsToSpreadsheetXml(rows: ReportRow[], sheetName: string): string {
  const headers = rows.length > 0 ? Object.keys(rows[0]) : ["Column"];
  const headerCells = headers.map((h) => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join("");
  const dataRows = rows
    .map((row) => {
      const cells = headers
        .map((h) => {
          const val = row[h] ?? "";
          const type = typeof val === "number" ? "Number" : "String";
          return `<Cell><Data ss:Type="${type}">${val}</Data></Cell>`;
        })
        .join("");
      return `<Row>${cells}</Row>`;
    })
    .join("");

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="${sheetName}">
  <Table>
   <Row>${headerCells}</Row>
   ${dataRows}
  </Table>
 </Worksheet>
</Workbook>`;
}

function buildPdfHtml(run: HrmReportRun, rows: ReportRow[]): string {
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  const tableHead = headers.map((h) => `<th>${h}</th>`).join("");
  const tableBody = rows
    .map(
      (row) =>
        `<tr>${headers.map((h) => `<td>${row[h] ?? ""}</td>`).join("")}</tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${run.name}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 40px; color: #0f172a; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .meta { color: #64748b; font-size: 13px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; }
    th { background: #f8fafc; font-weight: 600; }
    .footer { margin-top: 32px; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <h1>${run.name}</h1>
  <p class="meta">Period: ${run.period} · Generated: ${run.generatedAt} · By: ${run.generatedBy}</p>
  <table>
    <thead><tr>${tableHead}</tr></thead>
    <tbody>${tableBody}</tbody>
  </table>
  <p class="footer">Rivexaflow HRM · Confidential workforce report</p>
</body>
</html>`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function safeFilename(name: string): string {
  return name.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").toLowerCase();
}

export function downloadHrmReport(run: HrmReportRun): void {
  const rows = SAMPLE_ROWS[run.category] ?? SAMPLE_ROWS.headcount;
  const base = safeFilename(`${run.name}-${run.period}`);

  if (run.format === "csv") {
    const blob = new Blob([rowsToCsv(rows)], { type: "text/csv;charset=utf-8" });
    triggerDownload(blob, `${base}.csv`);
    return;
  }

  if (run.format === "xlsx") {
    const xml = rowsToSpreadsheetXml(rows, run.name.slice(0, 31));
    const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
    triggerDownload(blob, `${base}.xls`);
    return;
  }

  const html = buildPdfHtml(run, rows);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  triggerDownload(blob, `${base}.html`);
}
