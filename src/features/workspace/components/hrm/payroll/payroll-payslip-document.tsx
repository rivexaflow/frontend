"use client";

import type { PayrollRunDetail } from "@/types/hrm";
import { formatPayrollAmount } from "@/features/workspace/data/hrm-payroll-demo";
import { amountToIndianWords } from "@/lib/hrm/amount-in-words";
import { PAYSLIP_EMBEDDED_STYLES } from "@/lib/hrm/payslip-styles";
import { cn } from "@/lib/utils/cn";

type Props = {
  detail: PayrollRunDetail;
  className?: string;
  id?: string;
};

function PayslipLogo() {
  return (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect width="44" height="44" rx="10" fill="#166534" />
      <circle cx="16" cy="18" r="6" fill="#dc2626" opacity="0.9" />
      <path d="M26 30c4-6 8-10 12-14" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M8 32c3-4 7-8 12-12" stroke="#86efac" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function WatermarkLogo() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="40" cy="48" r="22" fill="#166534" />
      <circle cx="38" cy="46" r="14" fill="#dc2626" opacity="0.85" />
      <path d="M62 88c12-18 24-32 40-48" stroke="#166534" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

export function PayrollPayslipDocument({ detail, className, id = "payslip-document" }: Props) {
  const earnings = detail.earningLines ?? [];
  const deductions = detail.deductionLines ?? [];
  const gross = earnings.reduce((s, l) => s + l.amount, 0) || detail.grossPay;
  const totalDeductions = deductions.reduce((s, l) => s + l.amount, 0) || detail.deductions;
  const netWords = detail.currency === "INR" ? amountToIndianWords(detail.netPay) : null;

  return (
    <article id={id} className={cn("pslip", className)}>
      <style>{PAYSLIP_EMBEDDED_STYLES}</style>

      <div className="pslip-watermark">
        <WatermarkLogo />
      </div>

      <header className="pslip-header">
        <div className="pslip-brand">
          <div className="pslip-logo">
            <PayslipLogo />
          </div>
          <div>
            <h2 className="pslip-company">{detail.companyName ?? "Company"}</h2>
            <p className="pslip-address">{detail.companyAddress}</p>
          </div>
        </div>
        <div className="pslip-meta">
          <span className="pslip-badge">Salary slip</span>
          <p className="pslip-period">{detail.period}</p>
          <p className="pslip-paydate">Pay date: {detail.payDate ?? detail.paidOn ?? "—"}</p>
        </div>
      </header>

      <div className="pslip-employee">
        <Field label="Employee name" value={detail.employeeName} />
        <Field label="Employee ID" value={detail.employeeCode} />
        <Field label="Designation" value={detail.designation ?? "—"} />
        <Field label="Department" value={detail.department} />
        <Field label="PAN" value={detail.pan ?? "—"} />
        <Field label="UAN" value={detail.uan ?? "—"} />
        <Field label="Bank A/C" value={detail.bankAccountMasked ?? "—"} />
        <Field label="Payable days" value={String(detail.payableDays ?? 30)} />
        <Field label="LOP days" value={String(detail.lopDays ?? 0)} />
      </div>

      <div className="pslip-tables">
        <div className="pslip-table-col">
          <div className="pslip-table-head">
            <span>Earnings</span>
            <span>Amount</span>
          </div>
          {earnings.map((line) => (
            <div key={line.label} className="pslip-row">
              <span>{line.label}</span>
              <span>{formatPayrollAmount(line.amount, detail.currency)}</span>
            </div>
          ))}
          <div className="pslip-total-earn">
            <span>Gross earnings</span>
            <span>{formatPayrollAmount(gross, detail.currency)}</span>
          </div>
        </div>

        <div className="pslip-table-col">
          <div className="pslip-table-head">
            <span>Deductions</span>
            <span>Amount</span>
          </div>
          {deductions.map((line) => (
            <div key={line.label} className="pslip-row pslip-row-ded">
              <span>{line.label}</span>
              <span>{formatPayrollAmount(line.amount, detail.currency)}</span>
            </div>
          ))}
          <div className="pslip-total-ded">
            <span>Total deductions</span>
            <span>{formatPayrollAmount(totalDeductions, detail.currency)}</span>
          </div>
        </div>
      </div>

      <footer className="pslip-net">
        <div className="pslip-net-left">
          <p className="pslip-net-label">Net pay</p>
          {netWords ? <p className="pslip-net-words">{netWords}</p> : null}
        </div>
        <p className="pslip-net-amount">{formatPayrollAmount(detail.netPay, detail.currency)}</p>
      </footer>

      <div className="pslip-footer">
        This is a system-generated payslip. For queries contact your HR department.
      </div>
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="pslip-field-label">{label}</p>
      <p className="pslip-field-value">{value}</p>
    </div>
  );
}
