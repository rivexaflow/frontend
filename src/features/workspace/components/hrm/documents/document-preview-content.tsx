"use client";

import { FileText } from "lucide-react";

import type { EmployeeDocumentSubmission, HrmDocumentTypeCard } from "@/types/hrm";

type Props = {
  type: HrmDocumentTypeCard;
  row: EmployeeDocumentSubmission;
  maskedId: string;
};

export function DocumentPreviewContent({ type, row, maskedId }: Props) {
  if (type.id === "doc_type_aadhaar") {
    return (
      <div className="w-full max-w-md rounded-2xl border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-orange-800">Government of India</div>
          <div className="rounded bg-orange-600 px-2 py-0.5 text-xs font-bold text-white">आधार</div>
        </div>
        <p className="mt-4 text-sm font-semibold text-orange-900">Aadhaar</p>
        <p className="mt-6 font-mono text-2xl font-bold tracking-widest text-slate-900">{maskedId}</p>
        <div className="mt-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Name</p>
            <p className="text-lg font-bold text-slate-900">{row.employeeName}</p>
          </div>
          <div className="flex h-20 w-16 items-center justify-center rounded-lg border border-slate-300 bg-slate-200 text-xs text-slate-500">
            Photo
          </div>
        </div>
        <p className="mt-6 text-sm text-slate-500">DOB: XX / XX / XXXX</p>
      </div>
    );
  }

  if (type.id === "doc_type_pan") {
    return (
      <div className="w-full max-w-md rounded-xl border-2 border-[#2277ff]/40 bg-gradient-to-br from-[#eef2ff] to-[#f0f9ff] p-6 shadow-md">
        <p className="text-sm font-bold text-[#191970]">INCOME TAX DEPARTMENT · GOVT. OF INDIA</p>
        <p className="mt-6 text-sm font-semibold text-slate-600">Permanent Account Number Card</p>
        <p className="mt-4 font-mono text-2xl font-bold tracking-wider text-slate-900">
          {row.employeeCode.replace("EMP", "ABCDE")}1234F
        </p>
        <p className="mt-8 text-lg font-bold text-slate-900">{row.employeeName}</p>
        <p className="mt-2 text-sm text-slate-500">Father&apos;s Name: —</p>
        <p className="mt-4 text-sm text-slate-500">Date of birth: XX / XX / XXXX</p>
      </div>
    );
  }

  if (type.category === "contract" || type.category === "offer_letter") {
    return (
      <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-8 shadow-inner">
        <p className="text-sm font-bold uppercase tracking-wide text-slate-400">Rivexaflow Pvt. Ltd.</p>
        <h4 className="mt-4 text-xl font-bold text-slate-900">{type.title}</h4>
        <p className="mt-6 text-sm leading-relaxed text-slate-700">
          This agreement is entered into between Rivexaflow Pvt. Ltd. and{" "}
          <span className="font-semibold">{row.employeeName}</span> ({row.employeeCode}), effective from the date of
          joining.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-slate-700">
          Compensation, role ({row.department}), work location ({row.location}), and notice period terms are as per the
          signed offer and company policy pack.
        </p>
        <div className="mt-10 border-t border-slate-200 pt-6">
          <p className="text-sm text-slate-500">Employee signature</p>
          <p className="mt-2 font-semibold text-slate-900">{row.employeeName}</p>
          <p className="mt-1 text-sm text-slate-500">Date: {row.submittedAt}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4 text-center">
      <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <FileText className="h-16 w-16" />
      </div>
      <p className="text-lg font-semibold text-slate-900">{type.title}</p>
      <p className="text-sm text-slate-600">{row.fileName}</p>
      <p className="text-sm text-slate-500">Uploaded by {row.employeeName}</p>
    </div>
  );
}
