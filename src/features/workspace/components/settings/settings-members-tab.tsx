"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import { cn } from "@/lib/utils/cn";
import { Users, Mail, Award, Target, Activity, Clock, Shield } from "lucide-react";

type Props = {
  companyId: string;
};

type Member = {
  id: string;
  userId: string;
  role: string;
  status: string;
  joinedAt: string | null;
  department: string | null;
  jobTitle: string | null;
  onlineStatus: "online" | "away" | "offline";
  lastActiveAt: string | null;
  user: {
    id: string;
    fullName: string | null;
    email: string;
    avatar: string | null;
    username: string;
  };
  stats: {
    totalLeads: number;
    wonLeads: number;
  };
};

type Stats = {
  total: number;
  online: number;
  away: number;
  offline: number;
  totalLeads: number;
  totalWon: number;
};

type OrgData = {
  members: Member[];
  stats: Stats;
  byDepartment: Record<string, Member[]>;
};

function formatRelativeTime(dateStr: string | null) {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function SettingsMembersTab({ companyId }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orgData, setOrgData] = useState<OrgData | null>(null);

  useEffect(() => {
    async function loadTeamData() {
      try {
        setLoading(true);
        const { data } = await apiClient.get(`/company/${companyId}/org`);
        if (data.success && data.data) {
          setOrgData({
            members: data.data.members || [],
            stats: data.data.stats || { total: 0, online: 0, away: 0, offline: 0, totalLeads: 0, totalWon: 0 },
            byDepartment: data.data.byDepartment || {},
          });
        }
      } catch (err: unknown) {
        const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || (err as Error).message || "Failed to load team dashboard.";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }
    loadTeamData();
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <svg className="h-8 w-8 animate-spin text-[#191970]" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.4" strokeOpacity="0.3" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  const stats = orgData?.stats || { total: 0, online: 0, away: 0, offline: 0, totalLeads: 0, totalWon: 0 };
  const members = orgData?.members || [];

  const teamCards = [
    {
      title: "Total Team",
      value: stats.total,
      icon: Users,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400",
    },
    {
      title: "Online Now",
      value: stats.online,
      icon: Activity,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400",
    },
    {
      title: "Away",
      value: stats.away,
      icon: Clock,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400",
    },
    {
      title: "Offline",
      value: stats.offline,
      icon: Shield,
      color: "text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-400",
    },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 dark:border-rose-950/30 dark:bg-rose-950/20">
          {error}
        </div>
      )}

      {/* Team Stats Summary */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {teamCards.map((c) => (
          <div key={c.title} className={cn(crm.panel, "p-4 flex items-center gap-3.5 hover:shadow-md transition")}>
            <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", c.color)}>
              <c.icon className="h-4.5 w-4.5" />
            </span>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{c.title}</span>
              <span className="block text-xl font-black text-slate-800 dark:text-white mt-0.5">{c.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Team Member Listing Dashboard */}
      <div className={cn(crm.panel, "p-6")}>
        <div className="border-b border-slate-100 pb-4 dark:border-slate-800 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Team Directory</h2>
            <p className="text-xs text-slate-500">Track active sessions, platform role permissions, and CRM metrics.</p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200/90 dark:border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/90 bg-slate-50/70 text-xs font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-900/50">
                <th className="px-6 py-3.5">Member</th>
                <th className="px-6 py-3.5">Status & Seen</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Leads / Won</th>
                <th className="px-6 py-3.5">Conv. Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 font-medium">
                    No team members found in this workspace.
                  </td>
                </tr>
              ) : (
                members.map((member) => {
                  const roleColors: Record<string, string> = {
                    OWNER: "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30",
                    ADMIN: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30",
                    MANAGER: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30",
                    MEMBER: "bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700/50",
                    VIEWER: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
                  };

                  const convRate = member.stats.totalLeads > 0 
                    ? Math.round((member.stats.wonLeads / member.stats.totalLeads) * 100)
                    : 0;

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition">
                      {/* Member Info */}
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#191970] to-[#2277ff] text-xs font-bold text-white shadow-sm">
                          {member.user.avatar ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={member.user.avatar}
                              alt={member.user.fullName || "User"}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            (member.user.fullName || member.user.username || "?").slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <span className="block font-semibold text-slate-800 dark:text-slate-200">
                            {member.user.fullName || "Unnamed Member"}
                          </span>
                          <span className="block text-[11px] text-slate-400 font-medium flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {member.user.email}
                          </span>
                        </div>
                      </td>

                      {/* Online Status & Last Seen */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full",
                              member.onlineStatus === "online"
                                ? "bg-emerald-500 animate-pulse"
                                : member.onlineStatus === "away"
                                ? "bg-amber-500"
                                : "bg-slate-300"
                            )}
                          />
                          <div>
                            <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                              {member.onlineStatus}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-medium">
                              {member.onlineStatus === "online" ? "Active now" : formatRelativeTime(member.lastActiveAt)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* System Role */}
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide shadow-sm",
                            roleColors[member.role] || "bg-slate-50 text-slate-700 border-slate-100"
                          )}
                        >
                          {member.role === "OWNER" && <Award className="h-3 w-3 shrink-0" />}
                          {member.role}
                        </span>
                      </td>

                      {/* Department / Position */}
                      <td className="px-6 py-4">
                        <div>
                          <span className="block font-semibold text-slate-700 dark:text-slate-300">
                            {member.department || "General"}
                          </span>
                          <span className="block text-[11px] text-slate-400">
                            {member.jobTitle || "No Title"}
                          </span>
                        </div>
                      </td>

                      {/* CRM leads conversion stats */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                          <Target className="h-3.5 w-3.5 text-blue-500" />
                          <span>{member.stats.totalLeads}</span>
                          <span className="text-slate-300">/</span>
                          <span className="text-emerald-600 dark:text-emerald-400">{member.stats.wonLeads} won</span>
                        </div>
                      </td>

                      {/* Conversion Rate conversion rate */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{convRate}%</span>
                          <div className="h-1.5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shrink-0">
                            <div 
                              className={cn(
                                "h-full rounded-full",
                                convRate >= 50 
                                  ? "bg-emerald-500" 
                                  : convRate >= 25 
                                  ? "bg-blue-500" 
                                  : "bg-amber-500"
                              )} 
                              style={{ width: `${convRate}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
