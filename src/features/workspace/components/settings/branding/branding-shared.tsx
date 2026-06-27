"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  Copy,
  Loader2,
  XCircle,
} from "lucide-react";

export type DnsStatus = "verified" | "pending" | "checking" | "unknown";

export function ConnectionStatusBadge({ status }: { status: DnsStatus }) {
  if (status === "checking") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-900/30 dark:bg-blue-950/20">
        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        <div>
          <p className="text-xs font-bold text-blue-700 dark:text-blue-400">Checking DNS…</p>
          <p className="text-[10px] text-blue-500">Verifying domain connection</p>
        </div>
      </div>
    );
  }

  if (status === "verified") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-900/30 dark:bg-emerald-950/20">
        <div className="relative flex h-4 w-4 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
          <CheckCircle2 className="relative h-4 w-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Domain connected</p>
          <p className="text-[10px] text-emerald-600">DNS is correctly configured</p>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900/30 dark:bg-amber-950/20">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
        <div>
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400">DNS not connected</p>
          <p className="text-[10px] text-amber-600">Add A or CNAME records at your registrar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/40">
      <CircleDot className="h-4 w-4 shrink-0 text-slate-400" />
      <div>
        <p className="text-xs font-bold text-slate-500">Not checked yet</p>
        <p className="text-[10px] text-slate-400">Click Verify DNS to check status</p>
      </div>
    </div>
  );
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ml-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 dark:hover:bg-slate-700"
      title="Copy to clipboard"
    >
      {copied ? (
        <span className="text-emerald-600">Copied</span>
      ) : (
        <>
          <Copy className="h-2.5 w-2.5" /> Copy
        </>
      )}
    </button>
  );
}

export function ImageUploadField({
  id,
  label,
  accept,
  value,
  onChange,
  onError,
  hint,
}: {
  id: string;
  label: string;
  accept: string;
  value: string;
  onChange: (value: string) => void;
  onError?: (message: string | null) => void;
  hint?: string;
}) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    onError?.(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = accept.split(",").map((t) => t.trim());
    if (!validTypes.some((t) => file.type === t || t === "image/*")) {
      onError?.("Invalid file type.");
      return;
    }

    const maxSize = 1 * 1024 * 1024;
    if (file.size > maxSize) {
      onError?.("File must be under 1 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") onChange(event.target.result);
    };
    reader.onerror = () => onError?.("Failed to read file.");
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </label>
      <input
        id={id}
        type="file"
        accept={accept}
        onChange={handleFile}
        className="w-full cursor-pointer text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-800 dark:file:text-slate-300"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or paste image URL"
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2277FF] focus:ring-2 focus:ring-[#2277FF]/15 dark:border-slate-700 dark:bg-slate-900"
      />
      {hint ? <p className="text-[10px] text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function AssetPreview({ src, alt, size = 48 }: { src: string; alt: string; size?: number }) {
  if (!src.trim()) return null;
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 dark:border-slate-700"
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="max-h-full max-w-full object-contain" />
    </div>
  );
}

export function DnsResultDetail({
  isVerified,
  aRecords,
  cnameRecords,
  aMatch,
  cnameMatch,
  platformIp,
  platformCname,
}: {
  isVerified: boolean;
  aRecords: string[];
  cnameRecords: string[];
  aMatch: boolean;
  cnameMatch: boolean;
  platformIp: string;
  platformCname: string;
}) {
  return (
    <div
      className={
        isVerified
          ? "rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 text-xs dark:border-emerald-900/30 dark:bg-emerald-950/10"
          : "rounded-xl border border-amber-200 bg-amber-50/40 p-4 text-xs dark:border-amber-900/30 dark:bg-amber-950/10"
      }
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-bold">
        {isVerified ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-emerald-700 dark:text-emerald-300">DNS verified — domain is connected</span>
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4 text-amber-500" />
            <span className="text-amber-700 dark:text-amber-300">DNS not configured yet</span>
          </>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
        <div className="rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="mb-1 flex items-center gap-1 font-bold">
            {aMatch ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <XCircle className="h-3 w-3 text-slate-400" />}
            A record
          </div>
          <p className="font-mono">{aRecords.length > 0 ? aRecords.join(", ") : "Not found"}</p>
          {aMatch ? <p className="mt-1 font-semibold text-emerald-600">Matches {platformIp}</p> : null}
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="mb-1 flex items-center gap-1 font-bold">
            {cnameMatch ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <XCircle className="h-3 w-3 text-slate-400" />}
            CNAME
          </div>
          <p className="font-mono">{cnameRecords.length > 0 ? cnameRecords.join(", ") : "Not found"}</p>
          {cnameMatch ? <p className="mt-1 font-semibold text-emerald-600">Matches {platformCname}</p> : null}
        </div>
      </div>
    </div>
  );
}
