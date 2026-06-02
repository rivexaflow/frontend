"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { EnterpriseMetricStrip, type EnterpriseMetric } from "./enterprise-metric-strip";
import { cn } from "@/lib/utils/cn";

type Props = {
  eyebrow?: string;
  title: string;
  description: string;
  metrics?: EnterpriseMetric[];
  toolbar?: ReactNode;
  tabs?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function EnterprisePageShell({
  eyebrow,
  title,
  description,
  metrics,
  toolbar,
  tabs,
  children,
  className,
}: Props) {
  return (
    <div className={cn("space-y-6", className)}>
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            {eyebrow ? (
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-[1.65rem]">
              {title}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500">{description}</p>
          </div>
          {toolbar ? <div className="flex flex-wrap items-center gap-2">{toolbar}</div> : null}
        </div>
      </motion.header>

      {metrics && metrics.length > 0 ? <EnterpriseMetricStrip metrics={metrics} /> : null}

      {tabs ? <div>{tabs}</div> : null}

      {children}
    </div>
  );
}
