"use client";

import type { ElementType, ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Calendar,
  Hash,
  MapPin,
  Package,
  Shield,
  Tag,
  User,
  Wrench,
  X,
} from "lucide-react";

import { StatusPill } from "@/features/workspace/components/hrm/hrm-module-table";
import { getAssetImageUrl } from "@/features/workspace/data/hrm-asset-images";
import type { HrmAssetRecord } from "@/features/workspace/data/hrm-modules-demo";
import { cn } from "@/lib/utils/cn";

type Props = {
  asset: HrmAssetRecord;
  onClose: () => void;
};

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{children}</h3>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "danger" | "brand";
}) {
  const tones = {
    default: "border-slate-200/90 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/40",
    success: "border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-900/40",
    warning: "border-amber-200/80 bg-amber-50/50 dark:border-amber-900/40",
    danger: "border-rose-200/80 bg-rose-50/50 dark:border-rose-900/40",
    brand: "border-[#191970]/15 bg-[#191970]/[0.04] dark:border-indigo-900/40",
  };

  return (
    <div className={cn("rounded-xl border p-3", tones[tone])}>
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

const STATUS_LABEL: Record<HrmAssetRecord["status"], string> = {
  assigned: "Assigned",
  available: "Available",
  repair: "In repair",
};

export function AssetDetailPanel({ asset, onClose }: Props) {
  const imageUrl = getAssetImageUrl(asset);
  const hasCustodian = asset.custodian && asset.custodian !== "—";

  return (
    <>
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-label="Close"
        className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 420, damping: 38 }}
        className="fixed inset-y-0 right-0 z-[110] flex w-full max-w-[480px] flex-col border-l border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
        role="dialog"
        aria-labelledby="asset-detail-title"
      >
        <div className="relative shrink-0 overflow-hidden border-b border-slate-200/90 dark:border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-br from-[#191970]/10 via-slate-50 to-white dark:from-indigo-950/40 dark:via-slate-950 dark:to-slate-950" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-lg bg-white/90 p-1.5 text-slate-500 shadow-sm backdrop-blur transition hover:text-slate-800 dark:bg-slate-900/90"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative px-5 pb-5 pt-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md dark:border-slate-700 dark:bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={asset.name}
                className="h-44 w-full object-cover object-center"
              />
            </div>

            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                {asset.category} · {asset.tag}
              </p>
              <h2 id="asset-detail-title" className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {asset.name}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusPill
                  label={STATUS_LABEL[asset.status]}
                  tone={asset.status === "assigned" ? "success" : asset.status === "repair" ? "warning" : "default"}
                />
                <StatusPill
                  label={asset.condition}
                  tone={asset.condition === "Good" ? "success" : asset.condition === "Fair" ? "warning" : "danger"}
                />
                <StatusPill
                  label={`${asset.custodyRisk} risk`}
                  tone={asset.custodyRisk === "Low" ? "success" : asset.custodyRisk === "Medium" ? "warning" : "danger"}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="mb-6 grid grid-cols-2 gap-2">
            <MetricTile
              label="Book value"
              value={`₹ ${asset.value.toLocaleString("en-IN")}`}
              tone="brand"
            />
            <MetricTile label="Location" value={asset.location} />
            <MetricTile
              label="Issued"
              value={asset.issuedAt}
            />
            <MetricTile
              label="Warranty"
              value={asset.warrantyUntil ?? "—"}
              tone={asset.warrantyUntil ? "success" : "default"}
            />
          </div>

          <section className="mb-6">
            <SectionTitle>Identification</SectionTitle>
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/90 px-4 dark:divide-slate-800 dark:border-slate-800">
              <InfoRow icon={Tag} label="Asset tag" value={asset.tag} />
              <InfoRow icon={Hash} label="Serial number" value={asset.serial} />
              {asset.vendor ? <InfoRow icon={Package} label="Vendor" value={asset.vendor} /> : null}
              {asset.purchaseDate ? (
                <InfoRow icon={Calendar} label="Purchase date" value={asset.purchaseDate} />
              ) : null}
            </div>
          </section>

          <section className="mb-6">
            <SectionTitle>Custody</SectionTitle>
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/90 px-4 dark:divide-slate-800 dark:border-slate-800">
              {hasCustodian ? (
                <>
                  <InfoRow icon={User} label="Custodian" value={asset.custodian} />
                  <InfoRow icon={User} label="Role" value={asset.custodianRole} />
                  <InfoRow icon={Building2} label="Department" value={asset.department} />
                </>
              ) : (
                <InfoRow icon={Package} label="Custody" value="Unassigned — available in pool" />
              )}
              <InfoRow icon={MapPin} label="Location" value={asset.location} />
            </div>
          </section>

          {asset.specs?.length ? (
            <section className="mb-6">
              <SectionTitle>Specifications</SectionTitle>
              <ul className="space-y-2 rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                {asset.specs.map((spec) => (
                  <li key={spec} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#191970]" />
                    {spec}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {asset.notes ? (
            <section className="mb-6">
              <SectionTitle>Notes</SectionTitle>
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3 text-sm leading-relaxed text-slate-600 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400">
                {asset.notes}
              </p>
            </section>
          ) : null}

          <section>
            <SectionTitle>Actions</SectionTitle>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#191970] px-4 text-xs font-semibold text-white hover:bg-[#12124a]"
              >
                Reassign asset
              </button>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                <Wrench className="h-3.5 w-3.5" />
                Send to repair
              </button>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                <Shield className="h-3.5 w-3.5" />
                Print label
              </button>
            </div>
          </section>
        </div>
      </motion.aside>
    </>
  );
}
