"use client";

import { useMemo, useState } from "react";
import { Download, RefreshCw } from "lucide-react";

import {
  CrmChartCard,
  CrmDateRangeBar,
  CrmDonutChart,
  CrmHorizontalBarChart,
  CrmKpiStrip,
  CrmReportTabBar,
  CrmTrendChart,
  CrmVerticalBarChart,
} from "@/features/workspace/components/crm/reports/crm-analytics-charts";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import { CrmShell } from "@/features/workspace/components/crm/crm-panel";
import { CrmGhostButton, CrmPrimaryButton } from "@/features/workspace/components/crm/crm-ui-primitives";
import { CrmPageHeader } from "@/features/workspace/components/crm/crm-workspace-header";
import {
  CRM_REPORT_MONTH_OPTIONS,
  CRM_REPORT_TABS,
  getCrmReportDataset,
  getMonthlySeries,
  type CrmReportEntity,
  type CrmReportTab,
} from "@/features/workspace/data/crm-reports-demo";
import { cn } from "@/lib/utils/cn";

const DATE_PRESETS = [
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "Quarter" },
  { id: "ytd", label: "YTD" },
] as const;

type Props = {
  entity: CrmReportEntity;
};

export function CrmAnalyticsReportView({ entity }: Props) {
  const dataset = useMemo(() => getCrmReportDataset(entity), [entity]);
  const monthlySeries = useMemo(() => getMonthlySeries(entity), [entity]);
  const tabs = CRM_REPORT_TABS[entity];

  const [activeTab, setActiveTab] = useState<CrmReportTab>("general");
  const [month, setMonth] = useState("May 2026");
  const [datePreset, setDatePreset] = useState<(typeof DATE_PRESETS)[number]["id"]>("30d");
  const [fromDate, setFromDate] = useState("2026-05-01");
  const [toDate, setToDate] = useState("2026-05-31");
  const [staffGenerated, setStaffGenerated] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const entityLabel = entity === "lead" ? "Lead" : "Deal";
  const weeklyTitle = entity === "lead" ? "Weekly lead conversions" : "Weekly deal conversions";
  const sourceTitle = entity === "lead" ? "Lead source analysis" : "Source conversion";
  const monthlyTitle = entity === "lead" ? "Monthly lead volume" : "Monthly deal volume";

  const handleRefresh = () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <div className="pb-8">
      <CrmPageHeader
        eyebrow={`CRM · Report · ${entityLabel}`}
        title="Report"
        description={
          entity === "lead"
            ? "Conversion trends, source ROI, team performance, and pipeline intake."
            : "Revenue pipeline analytics, win rates, rep performance, and account breakdown."
        }
        metrics={dataset.kpis.slice(0, 3).map((k) => ({ label: k.label, value: k.value }))}
        actions={
          <div className="flex flex-wrap gap-2">
            <CrmGhostButton onClick={handleRefresh}>
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
              Refresh
            </CrmGhostButton>
            <CrmPrimaryButton>
              <Download className="h-3.5 w-3.5" />
              Export
            </CrmPrimaryButton>
          </div>
        }
      />

      <CrmShell className="overflow-hidden">
        <CrmReportTabBar
          tabs={tabs}
          active={activeTab}
          onChange={(id) => setActiveTab(id as CrmReportTab)}
        />

        <div className="space-y-6 p-4 md:p-6">
          {activeTab === "general" ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex rounded-xl border border-slate-200/80 bg-slate-50/80 p-1 dark:border-slate-700 dark:bg-slate-950/40">
                  {DATE_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setDatePreset(p.id)}
                      className={cn(
                        "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition",
                        datePreset === p.id
                          ? "bg-white text-[#191970] shadow-sm dark:bg-slate-900 dark:text-indigo-300"
                          : "text-slate-500 hover:text-slate-700",
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  Showing <span className="font-semibold text-slate-700">{entityLabel.toLowerCase()}</span> metrics · demo data
                </p>
              </div>

              <CrmKpiStrip items={dataset.kpis} />

              <div className="grid gap-5 xl:grid-cols-2">
                <CrmChartCard title={weeklyTitle} subtitle="Share of volume by weekday" accent>
                  <CrmDonutChart
                    data={dataset.weeklyConversion}
                    centerLabel="This week"
                    centerValue={String(dataset.weeklyConversion.reduce((s, d) => s + d.value, 0))}
                  />
                </CrmChartCard>

                <CrmChartCard title={sourceTitle} subtitle="Top acquisition channels" accent>
                  <CrmVerticalBarChart
                    data={dataset.sourceBreakdown}
                    yLabel={entity === "lead" ? "Leads" : "Deals"}
                    xLabel="Source"
                    maxBars={8}
                    variant="compact"
                  />
                </CrmChartCard>
              </div>

              <CrmChartCard
                title={monthlyTitle}
                subtitle="Volume trend across the fiscal year"
                accent
                action={
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className={cn(crm.select, "h-9 rounded-lg px-3 text-sm")}
                  >
                    {CRM_REPORT_MONTH_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                }
              >
                <CrmTrendChart data={monthlySeries} />
                {dataset.monthlyVolume[month] ? (
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-[#191970]/10 bg-[#191970]/[0.03] px-4 py-3">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Highlight · {month}
                    </span>
                    <span className="text-lg font-bold tabular-nums text-[#191970] dark:text-indigo-300">
                      {dataset.monthlyVolume[month]![0]!.value.toLocaleString()}{" "}
                      <span className="text-sm font-semibold text-slate-500">
                        {entity === "lead" ? "leads" : "deals"}
                      </span>
                    </span>
                  </div>
                ) : null}
              </CrmChartCard>
            </>
          ) : null}

          {activeTab === "staff" ? (
            <>
              <CrmDateRangeBar
                fromDate={fromDate}
                toDate={toDate}
                onFromChange={setFromDate}
                onToChange={setToDate}
                onGenerate={() => setStaffGenerated(true)}
              />

              {staffGenerated ? (
                <div className="grid gap-5 xl:grid-cols-5">
                  <CrmChartCard
                    className="xl:col-span-3"
                    title={`${entityLabel} volume by owner`}
                    subtitle={`${fromDate} → ${toDate}`}
                    accent
                  >
                    <CrmVerticalBarChart
                      data={dataset.staffPerformance}
                      yLabel={entity === "lead" ? "Leads" : "Deals"}
                      xLabel="Team member"
                      maxBars={10}
                    />
                  </CrmChartCard>
                  <CrmChartCard
                    className="xl:col-span-2"
                    title="Leaderboard"
                    subtitle="Ranked by assigned volume"
                    accent
                  >
                    <CrmHorizontalBarChart data={dataset.staffPerformance.slice(0, 6)} showRank />
                  </CrmChartCard>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 py-20 text-center dark:border-slate-700">
                  <p className="text-sm font-medium text-slate-600">Select a date range and generate the report</p>
                  <p className="mt-1 text-xs text-slate-400">Staff performance updates based on your filter</p>
                </div>
              )}
            </>
          ) : null}

          {activeTab === "pipelines" ? (
            <div className="grid gap-5 xl:grid-cols-2">
              <CrmChartCard
                title="Pipeline distribution"
                subtitle={entity === "lead" ? "Leads by pipeline" : "Open deals by pipeline"}
                accent
              >
                <CrmVerticalBarChart
                  data={dataset.pipelineVolume}
                  yLabel={entity === "lead" ? "Leads" : "Deals"}
                  xLabel="Pipeline"
                  maxBars={6}
                />
              </CrmChartCard>
              <CrmChartCard title="Pipeline share" subtitle="Relative volume by pipeline" accent>
                <CrmDonutChart
                  data={dataset.pipelineVolume}
                  centerLabel="Total"
                  centerValue={String(dataset.pipelineVolume.reduce((s, d) => s + d.value, 0))}
                />
              </CrmChartCard>
            </div>
          ) : null}

          {activeTab === "clients" && entity === "deal" && dataset.clientBreakdown ? (
            <div className="grid gap-5 xl:grid-cols-5">
              <CrmChartCard className="xl:col-span-3" title="Clients report" subtitle="Deals grouped by account" accent>
                <CrmVerticalBarChart data={dataset.clientBreakdown} yLabel="Deals" xLabel="Account" maxBars={8} />
              </CrmChartCard>
              <CrmChartCard className="xl:col-span-2" title="Top accounts" subtitle="By deal count" accent>
                <CrmHorizontalBarChart data={dataset.clientBreakdown} showRank />
              </CrmChartCard>
            </div>
          ) : null}
        </div>
      </CrmShell>
    </div>
  );
}
