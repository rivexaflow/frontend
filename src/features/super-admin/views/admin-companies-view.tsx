"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2 } from "lucide-react";

import { fetchAdminCompanies } from "@/lib/api/admin";
import { formatCount } from "@/lib/api/admin-normalize";
import type { AdminCompany } from "@/types/admin";
import { StatusBadge } from "@/components/shared/status-badge/status-badge";
import {
  AdminAlert,
  AdminEmptyState,
  AdminPanel,
  AdminSearchInput,
  AdminSkeletonRows,
  AdminTable,
  AdminTableFooter,
  AdminTableWrap,
  AdminTd,
  AdminTh,
  AdminThead,
  AdminToolbar,
  AdminTr,
  AdminTbody,
  adminSelectClass,
} from "@/features/super-admin/components/admin-ui";
import { SuperAdminAppShell } from "@/features/super-admin/components/super-admin-app-shell";

function companyTone(s: AdminCompany["status"]): "success" | "warning" | "danger" | "neutral" {
  if (s === "ACTIVE") return "success";
  if (s === "TRIAL") return "warning";
  return "danger";
}

const planColors: Record<string, string> = {
  Enterprise: "bg-[#191970]/10 text-[#191970]",
  Growth: "bg-[#2277FF]/10 text-[#2277FF]",
  Starter: "bg-slate-100 text-slate-700",
};

export function AdminCompaniesView() {
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState<AdminCompany["status"] | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAdminCompanies();
        if (!cancelled) setCompanies(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load companies");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const plans = useMemo(() => [...new Set(companies.map((c) => c.plan))].sort(), [companies]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return companies.filter((c) => {
      if (plan && c.plan !== plan) return false;
      if (status && c.status !== status) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q)
      );
    });
  }, [companies, search, plan, status]);

  return (
    <SuperAdminAppShell
      title="Companies"
      description="Registered tenants across regions and plans — monitor membership, commercial tier, and account status."
    >
      {error ? <AdminAlert>{error}</AdminAlert> : null}

      <AdminToolbar>
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Search company, slug, region…" />
        <select value={plan} onChange={(e) => setPlan(e.target.value)} className={adminSelectClass}>
          <option value="">All plans</option>
          {plans.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as AdminCompany["status"] | "")}
          className={adminSelectClass}
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="TRIAL">TRIAL</option>
          <option value="SUSPENDED">SUSPENDED</option>
        </select>
      </AdminToolbar>

      <AdminPanel title="Company registry" description={`${companies.length} organizations registered`}>
        <AdminTableWrap>
          <AdminTable minWidth="880px">
            <AdminThead>
              <AdminTh>Company</AdminTh>
              <AdminTh>Plan</AdminTh>
              <AdminTh>Region</AdminTh>
              <AdminTh>Members</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh>Created</AdminTh>
            </AdminThead>
            <AdminTbody>
              {loading ? (
                <AdminSkeletonRows cols={6} />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <AdminEmptyState
                      icon={Building2}
                      title="No companies found"
                      description="Adjust your search or filters to view registered organizations."
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <AdminTr key={c.id}>
                    <AdminTd>
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 text-xs font-bold text-[#191970] ring-1 ring-slate-200/80">
                          {c.name.slice(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-semibold text-[#191970]">{c.name}</p>
                          <p className="font-mono text-xs text-slate-500">{c.slug}</p>
                        </div>
                      </div>
                    </AdminTd>
                    <AdminTd>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${planColors[c.plan] ?? "bg-slate-100 text-slate-700"}`}
                      >
                        {c.plan}
                      </span>
                    </AdminTd>
                    <AdminTd className="text-slate-600">{c.region}</AdminTd>
                    <AdminTd className="font-medium text-slate-700">{formatCount(c.memberCount)}</AdminTd>
                    <AdminTd>
                      <StatusBadge label={c.status} tone={companyTone(c.status)} />
                    </AdminTd>
                    <AdminTd className="text-xs text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </AdminTd>
                  </AdminTr>
                ))
              )}
            </AdminTbody>
          </AdminTable>
        </AdminTableWrap>
        {!loading ? (
          <AdminTableFooter
            left={
              <>
                Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of{" "}
                <span className="font-semibold text-slate-700">{companies.length}</span> companies
              </>
            }
          />
        ) : null}
      </AdminPanel>
    </SuperAdminAppShell>
  );
}
