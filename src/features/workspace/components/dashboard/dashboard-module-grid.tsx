"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import type { DashboardModuleDef } from "@/features/workspace/data/dashboard-modules";
import { cn } from "@/lib/utils/cn";

const colorMap: Record<string, string> = {
  blue: "from-blue-500 to-indigo-600",
  purple: "from-purple-500 to-violet-600",
  amber: "from-amber-500 to-orange-600",
  indigo: "from-indigo-500 to-blue-600",
  rose: "from-rose-500 to-pink-600",
  emerald: "from-emerald-500 to-teal-600",
  sky: "from-sky-500 to-cyan-600",
  slate: "from-slate-500 to-slate-700",
  violet: "from-violet-500 to-purple-600",
};

type DashboardModuleGridProps = {
  modules: DashboardModuleDef[];
};

export function DashboardModuleGrid({ modules }: DashboardModuleGridProps) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Your active modules</h3>
          <p className="mt-1 text-sm text-slate-500">
            Panels configured during onboarding — open any module to continue work.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((mod, i) => (
          <motion.div
            key={mod.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={mod.href}
              className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <div
                className={cn(
                  "mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md",
                  colorMap[mod.color] ?? colorMap.blue,
                )}
              >
                <mod.icon className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">{mod.label}</h4>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{mod.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-600">
                Open module
                <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
