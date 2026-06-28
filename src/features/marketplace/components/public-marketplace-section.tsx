"use client";

import React from "react";
import { MessageSquare, FileSpreadsheet, Share2, Zap, Sparkles, Check, ArrowRight } from "lucide-react";

export function PublicMarketplaceSection() {
  const tools = [
    {
      name: "WhatsApp Business CRM",
      category: "Communication",
      desc: "Instant QR login, team assignment by department heads, and CRM lead hierarchy chat security.",
      icon: MessageSquare,
      color: "from-emerald-500/20 to-teal-500/10",
      borderColor: "border-emerald-500/30",
      textColor: "text-emerald-400"
    },
    {
      name: "Google Sheets Sync",
      category: "Spreadsheets",
      desc: "Real-time collaborative spreadsheets embedded in CRM with lead data auto-synchronization.",
      icon: FileSpreadsheet,
      color: "from-emerald-600/20 to-green-500/10",
      borderColor: "border-emerald-600/30",
      textColor: "text-emerald-400"
    },
    {
      name: "Slack Integration",
      category: "Team Alerts",
      desc: "Instant channel alerts for high-value deal movements, new inbound leads, and support alerts.",
      icon: Share2,
      color: "from-purple-500/20 to-indigo-500/10",
      borderColor: "border-purple-500/30",
      textColor: "text-purple-400"
    },
    {
      name: "Zapier Connector",
      category: "Automation",
      desc: "Connect Rivexa Flow with 5,000+ web applications using multi-step automated Zaps.",
      icon: Zap,
      color: "from-amber-500/20 to-orange-500/10",
      borderColor: "border-amber-500/30",
      textColor: "text-amber-400"
    }
  ];

  return (
    <section className="py-20 bg-slate-950 text-white relative overflow-hidden border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-4 h-4" /> Integrations & Tool Marketplace
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Supercharge Your Workflow with 1-Click Tools
          </h2>
          <p className="text-slate-400 mt-4 text-base sm:text-lg">
            Company owners can instantly extend workspace capabilities by installing verified operational tools from our built-in App Marketplace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((t, idx) => {
            const Icon = t.icon;
            return (
              <div
                key={idx}
                className={`rounded-2xl p-6 bg-gradient-to-b ${t.color} border ${t.borderColor} backdrop-blur flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 shadow-xl`}
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center mb-4">
                    <Icon className={`w-6 h-6 ${t.textColor}`} />
                  </div>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${t.textColor}`}>{t.category}</span>
                  <h3 className="text-lg font-bold text-white mt-1 mb-2">{t.name}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-6">{t.desc}</p>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold pt-4 border-t border-slate-800/60">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> 1-Click Install
                  </span>
                  <span className={`${t.textColor} flex items-center gap-1`}>
                    Learn More <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
