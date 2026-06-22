import type { HrmAssetRecord } from "@/features/workspace/data/hrm-modules-demo";

/** Product-style thumbnails for demo asset register */
export const ASSET_IMAGE_BY_ID: Record<string, string> = {
  a1: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&h=300&q=80",
  a2: "https://images.unsplash.com/photo-1695048133142-2581eb1346a8?auto=format&fit=crop&w=400&h=300&q=80",
  a3: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&h=300&q=80",
  a4: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&h=300&q=80",
  a5: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&h=300&q=80",
};

const CATEGORY_FALLBACK: Record<string, string> = {
  Laptop: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&h=300&q=80",
  Phone: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&h=300&q=80",
  Monitor: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&h=300&q=80",
  Accessory: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&h=300&q=80",
};

export function getAssetImageUrl(asset: Pick<HrmAssetRecord, "id" | "category" | "imageUrl">): string {
  return asset.imageUrl ?? ASSET_IMAGE_BY_ID[asset.id] ?? CATEGORY_FALLBACK[asset.category] ?? CATEGORY_FALLBACK.Laptop;
}
