import type { PayrollRunDetail } from "@/types/hrm";
import { formatPayrollAmount } from "@/features/workspace/data/hrm-payroll-demo";
import { PAYSLIP_EMBEDDED_STYLES } from "@/lib/hrm/payslip-styles";

const BASE_BODY_STYLES = `
  * { box-sizing: border-box; }
  body { margin: 0; padding: 24px; font-family: Inter, system-ui, sans-serif; background: #e2e8f0; color: #0f172a; }
  @page { size: A4; margin: 12mm; }
  @media print { body { background: white; padding: 0; } }
`;

function wrapPayslipHtml(title: string, elementHtml: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>${BASE_BODY_STYLES}${PAYSLIP_EMBEDDED_STYLES}</style>
</head>
<body>${elementHtml}</body>
</html>`;
}

export function printPayslipElement(element: HTMLElement, title: string) {
  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=1100");
  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(wrapPayslipHtml(title, element.outerHTML));
  printWindow.document.close();
  printWindow.focus();
  printWindow.onload = () => {
    printWindow.print();
  };
}

export function downloadPayslipHtml(detail: PayrollRunDetail, element: HTMLElement) {
  const filename = `payslip-${detail.employeeCode}-${detail.period.replace(/\s+/g, "-")}.html`;
  const title = `Payslip · ${detail.employeeName} · ${detail.period}`;
  const html = wrapPayslipHtml(title, element.outerHTML);

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function openPayslipInNewTab(detail: PayrollRunDetail, element: HTMLElement) {
  const printWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!printWindow) return;
  const title = `Payslip · ${detail.employeeName} · ${detail.period}`;
  printWindow.document.write(wrapPayslipHtml(title, element.outerHTML));
  printWindow.document.close();
}

export function payslipDocumentTitle(detail: PayrollRunDetail) {
  return `Payslip · ${detail.employeeName} · ${detail.period}`;
}

export function formatSlipAmount(amount: number, currency: string) {
  return formatPayrollAmount(amount, currency);
}
