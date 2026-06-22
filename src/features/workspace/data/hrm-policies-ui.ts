import type { HrmPolicyCategory, HrmPolicyRecord } from "@/types/hrm";

export function policyAckPct(policy: Pick<HrmPolicyRecord, "acknowledgedCount" | "totalEmployees">) {
  return policy.totalEmployees > 0
    ? Math.round((policy.acknowledgedCount / policy.totalEmployees) * 100)
    : 0;
}

export function getPolicyLibraryStats(policies: HrmPolicyRecord[]) {
  const published = policies.filter((p) => p.status === "published");
  const requiringAck = published.filter((p) => p.acknowledgmentRequired);
  const avgAck =
    requiringAck.length > 0
      ? Math.round(
          requiringAck.reduce((s, p) => s + policyAckPct(p), 0) / requiringAck.length,
        )
      : 0;
  const pendingTotal = requiringAck.reduce(
    (s, p) => s + Math.max(0, p.totalEmployees - p.acknowledgedCount),
    0,
  );

  return {
    total: policies.length,
    published: published.length,
    drafts: policies.filter((p) => p.status === "draft").length,
    avgAck,
    pendingTotal,
  };
}

export const POLICY_CATEGORY_META: Record<
  HrmPolicyCategory,
  { label: string; surface: string; border: string; accent: string; iconBg: string }
> = {
  hr: {
    label: "HR & employment",
    surface: "from-[#eef2ff] via-white to-[#f5f7ff]",
    border: "border-[#c7d2fe]/70 hover:border-[#2277ff]/45",
    accent: "text-[#191970]",
    iconBg: "from-[#191970] to-[#2277ff]",
  },
  leave: {
    label: "Leave & attendance",
    surface: "from-[#f0f9ff] via-white to-[#f8fcff]",
    border: "border-sky-200/70 hover:border-[#0056ff]/45",
    accent: "text-[#0056ff]",
    iconBg: "from-[#2277ff] to-[#0056ff]",
  },
  conduct: {
    label: "Code of conduct",
    surface: "from-slate-50 via-white to-slate-50",
    border: "border-slate-200/80 hover:border-slate-400/45",
    accent: "text-slate-800",
    iconBg: "from-slate-600 to-slate-800",
  },
  safety: {
    label: "Health & safety",
    surface: "from-[#ecfdf5] via-white to-[#f4fdf8]",
    border: "border-emerald-200/70 hover:border-emerald-400/45",
    accent: "text-emerald-900",
    iconBg: "from-emerald-600 to-teal-500",
  },
  it: {
    label: "IT & data",
    surface: "from-[#fffbeb] via-white to-[#fffdf5]",
    border: "border-amber-200/70 hover:border-amber-400/45",
    accent: "text-amber-950",
    iconBg: "from-amber-500 to-orange-500",
  },
  benefits: {
    label: "Benefits",
    surface: "from-[#fff1f2] via-white to-[#fff5f5]",
    border: "border-rose-200/70 hover:border-rose-400/45",
    accent: "text-rose-900",
    iconBg: "from-rose-500 to-pink-500",
  },
};

export function categoryMeta(category: string) {
  return POLICY_CATEGORY_META[category as HrmPolicyCategory] ?? POLICY_CATEGORY_META.hr;
}
