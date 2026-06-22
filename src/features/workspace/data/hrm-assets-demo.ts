import { DEMO_HRM_ASSETS, type HrmAssetRecord } from "@/features/workspace/data/hrm-modules-demo";

export type { HrmAssetRecord };
export { DEMO_HRM_ASSETS };

export type AssetTab = "all" | "assigned" | "available" | "repair";

export function getAssetStats(assets: HrmAssetRecord[]) {
  const assigned = assets.filter((a) => a.status === "assigned").length;
  const available = assets.filter((a) => a.status === "available").length;
  const repair = assets.filter((a) => a.status === "repair").length;
  const totalValue = assets.reduce((s, a) => s + a.value, 0);
  const categories = [...new Set(assets.map((a) => a.category))].sort();
  return { total: assets.length, assigned, available, repair, totalValue, categories };
}

export function formatAssetValue(value: number) {
  if (value >= 1_000_000) return `₹${(value / 100_000).toFixed(1)}L`;
  if (value >= 1_000) return `₹${Math.round(value / 1000)}K`;
  return `₹${value.toLocaleString("en-IN")}`;
}

export function formatAssetValueFull(value: number) {
  return `₹ ${value.toLocaleString("en-IN")}`;
}

export function nextAssetTag(assets: HrmAssetRecord[]) {
  const nums = assets
    .map((a) => Number(a.tag.replace(/\D/g, "")))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 1000) + 1;
  return `AST-${next}`;
}

export function initials(name: string) {
  if (!name || name === "—") return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const ASSET_STATUS_LABEL: Record<HrmAssetRecord["status"], string> = {
  assigned: "Assigned",
  available: "Available",
  repair: "In repair",
};
