"use client";

import { getAssetImageUrl } from "@/features/workspace/data/hrm-asset-images";
import type { HrmAssetRecord } from "@/features/workspace/data/hrm-modules-demo";
import { cn } from "@/lib/utils/cn";

type Props = {
  asset: Pick<HrmAssetRecord, "id" | "name" | "category" | "imageUrl">;
  size?: "sm" | "md";
  className?: string;
};

export function AssetProductThumbnail({ asset, size = "sm", className }: Props) {
  const imageUrl = getAssetImageUrl(asset);
  const dim = size === "sm" ? "h-11 w-11" : "h-16 w-16";

  return (
    <span
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg border border-slate-200/80 bg-slate-100 shadow-sm dark:border-slate-700 dark:bg-slate-800",
        dim,
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt="" className="h-full w-full object-cover object-center" loading="lazy" />
    </span>
  );
}
