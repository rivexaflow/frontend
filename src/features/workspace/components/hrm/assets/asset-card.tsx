"use client";

import { MapPin, Tag, User } from "lucide-react";

import { AssetProductThumbnail } from "@/features/workspace/components/hrm/assets/asset-product-thumbnail";
import { StatusPill } from "@/features/workspace/components/hrm/hrm-module-table";
import {
  ASSET_STATUS_LABEL,
  formatAssetValueFull,
  initials,
  type HrmAssetRecord,
} from "@/features/workspace/data/hrm-assets-demo";
import { getAssetImageUrl } from "@/features/workspace/data/hrm-asset-images";
import { cn } from "@/lib/utils/cn";

const STATUS_ACCENT: Record<HrmAssetRecord["status"], string> = {
  assigned: "from-emerald-500/20 to-transparent",
  available: "from-[#2277ff]/20 to-transparent",
  repair: "from-amber-500/20 to-transparent",
};

type Props = {
  asset: HrmAssetRecord;
  selected?: boolean;
  onSelect: () => void;
};

export function AssetCard({ asset, selected, onSelect }: Props) {
  const hasCustodian = asset.custodian && asset.custodian !== "—";
  const imageUrl = getAssetImageUrl(asset);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "group flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_2px_12px_rgba(15,23,42,0.05)] transition-all duration-200",
        selected
          ? "border-[#2277ff] ring-2 ring-[#2277ff]/20 shadow-[0_12px_32px_rgba(25,25,112,0.12)]"
          : "border-slate-200/80 hover:-translate-y-1 hover:border-[#2277ff]/30 hover:shadow-[0_16px_40px_rgba(25,25,112,0.1)]",
      )}
    >
      <div className="relative overflow-hidden bg-slate-100">
        <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-t", STATUS_ACCENT[asset.status])} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={asset.name}
          className="h-36 w-full object-cover object-center transition duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute left-3 top-3">
          <StatusPill
            label={ASSET_STATUS_LABEL[asset.status]}
            tone={asset.status === "assigned" ? "success" : asset.status === "repair" ? "warning" : "default"}
          />
        </div>
        <div className="absolute right-3 top-3 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-bold text-[#191970] shadow-sm backdrop-blur-sm">
          {asset.category}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start gap-2">
          <AssetProductThumbnail asset={asset} size="md" className="hidden sm:block" />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              <Tag className="h-3 w-3" />
              {asset.tag}
            </p>
            <h3 className="mt-0.5 truncate text-sm font-bold text-slate-900">{asset.name}</h3>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-base font-bold tabular-nums text-[#191970]">{formatAssetValueFull(asset.value)}</p>
          <StatusPill
            label={asset.condition}
            tone={asset.condition === "Good" ? "success" : asset.condition === "Fair" ? "warning" : "danger"}
          />
        </div>

        <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
          {hasCustodian ? (
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#191970] text-[9px] font-bold text-white">
                {initials(asset.custodian)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-800">{asset.custodian}</p>
                <p className="truncate text-[10px] text-slate-400">{asset.custodianRole}</p>
              </div>
            </div>
          ) : (
            <p className="flex items-center gap-1.5 text-xs font-medium text-[#2277ff]">
              <User className="h-3.5 w-3.5" />
              Available in pool
            </p>
          )}
          <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <MapPin className="h-3 w-3 shrink-0" />
            {asset.location}
          </p>
        </div>
      </div>
    </article>
  );
}
