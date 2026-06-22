"use client";

import { ChevronRight } from "lucide-react";

import { AssetProductThumbnail } from "@/features/workspace/components/hrm/assets/asset-product-thumbnail";
import { StatusPill } from "@/features/workspace/components/hrm/hrm-module-table";
import {
  ASSET_STATUS_LABEL,
  formatAssetValueFull,
  initials,
  type HrmAssetRecord,
} from "@/features/workspace/data/hrm-assets-demo";
import { cn } from "@/lib/utils/cn";

type Props = {
  assets: HrmAssetRecord[];
  selectedId: string | null;
  onSelect: (asset: HrmAssetRecord) => void;
};

export function AssetsTable({ assets, selectedId, onSelect }: Props) {
  if (assets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 py-14 text-center text-sm text-slate-500">
        No assets match your filters.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              <th className="px-4 py-3">Asset</th>
              <th className="px-4 py-3">Tag / Serial</th>
              <th className="px-4 py-3">Custodian</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Condition</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Status</th>
              <th className="w-10 px-2 py-3" aria-hidden />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {assets.map((row) => {
              const selected = selectedId === row.id;
              const hasCustodian = row.custodian && row.custodian !== "—";
              return (
                <tr
                  key={row.id}
                  onClick={() => onSelect(row)}
                  className={cn(
                    "cursor-pointer transition hover:bg-[#2277ff]/[0.03]",
                    selected && "bg-[#2277ff]/[0.06]",
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <AssetProductThumbnail asset={row} />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">{row.name}</p>
                        <p className="text-[11px] text-slate-500">{row.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs font-semibold text-slate-800">{row.tag}</p>
                    <p className="font-mono text-[11px] text-slate-400">{row.serial}</p>
                  </td>
                  <td className="px-4 py-3">
                    {hasCustodian ? (
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#191970] text-[9px] font-bold text-white">
                          {initials(row.custodian)}
                        </span>
                        <div>
                          <p className="font-medium text-slate-800">{row.custodian}</p>
                          <p className="text-[11px] text-slate-500">{row.custodianRole}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-[#2277ff]">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{row.department !== "—" ? row.department : "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{row.location}</td>
                  <td className="px-4 py-3">
                    <StatusPill
                      label={row.condition}
                      tone={row.condition === "Good" ? "success" : row.condition === "Fair" ? "warning" : "danger"}
                    />
                  </td>
                  <td className="px-4 py-3 tabular-nums font-semibold text-slate-800">
                    {formatAssetValueFull(row.value)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill
                      label={ASSET_STATUS_LABEL[row.status]}
                      tone={row.status === "assigned" ? "success" : row.status === "repair" ? "warning" : "default"}
                    />
                  </td>
                  <td className="px-2 py-3">
                    <ChevronRight className="h-4 w-4 text-[#2277ff]" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
