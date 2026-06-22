"use client";

import { useState } from "react";
import { AlertCircle, Download, FileSpreadsheet, Upload } from "lucide-react";

import { CrmNotice, CrmPanel, CrmPanelBody, CrmPanelHead } from "@/features/workspace/components/crm/crm-panel";
import { CrmGhostButton, CrmPrimaryButton } from "@/features/workspace/components/crm/crm-ui-primitives";
import { CrmPageHeader } from "@/features/workspace/components/crm/crm-workspace-header";

const SAMPLE_COLUMNS = ["Full name", "Email", "Phone", "Company", "Source", "Owner"];

export function CrmImportView() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  const onFile = (file: File | undefined) => {
    setError(null);
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      setError("Only .csv files are supported.");
      setFileName(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5 MB.");
      setFileName(null);
      return;
    }
    setFileName(file.name);
    setStep(2);
  };

  return (
    <div className="pb-8">
      <CrmPageHeader
        eyebrow="Data · CRM"
        title="Bulk import"
        description="Import leads from CSV with automatic column mapping and duplicate detection."
        metrics={[
          { label: "Max rows", value: "5,000" },
          { label: "Format", value: "CSV" },
        ]}
        actions={
          <CrmGhostButton>
            <Download className="h-3.5 w-3.5" />
            Sample CSV
          </CrmGhostButton>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <CrmPanel>
          <CrmPanelHead
            title={step === 1 ? "Step 1 · Upload file" : "Step 2 · Review & import"}
            subtitle="Import leads with duplicate detection before records are created"
            accent
          />
          {step === 1 ? (
            <CrmPanelBody>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/40 px-6 py-14 transition hover:border-[#191970]/40 hover:bg-[#191970]/5 dark:border-slate-700">
                <Upload className="h-10 w-10 text-slate-400" />
                <span className="mt-3 text-sm font-medium text-slate-700">Drop CSV here or click to browse</span>
                <span className="mt-1 text-xs text-slate-500">UTF-8 encoding · max 5 MB</span>
                <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
              </label>
              {error ? (
                <p className="mt-3 flex items-center gap-1.5 text-sm text-rose-600">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              ) : null}
            </CrmPanelBody>
          ) : (
            <>
              <CrmNotice tone="info">
                File <strong>{fileName}</strong> ready. Column mapping will run automatically against your lead layout.
              </CrmNotice>
              <CrmPanelBody className="space-y-3">
                <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-sm text-emerald-800">
                  4 columns matched · 2 optional fields skipped · 0 duplicates flagged
                </div>
                <div className="flex gap-2">
                  <CrmGhostButton onClick={() => { setStep(1); setFileName(null); }}>Back</CrmGhostButton>
                  <CrmPrimaryButton className="flex-1 justify-center">Start import</CrmPrimaryButton>
                </div>
              </CrmPanelBody>
            </>
          )}
        </CrmPanel>

        <CrmPanel>
          <CrmPanelHead title="Expected columns" subtitle="Headers can appear in any order" />
          <CrmPanelBody>
            <ul className="space-y-1.5">
              {SAMPLE_COLUMNS.map((col) => (
                <li
                  key={col}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm dark:border-slate-800"
                >
                  <span className="font-medium text-slate-800">{col}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#191970]">Required</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Duplicates matched on phone or email per workspace settings.
            </p>
          </CrmPanelBody>
        </CrmPanel>
      </div>
    </div>
  );
}
