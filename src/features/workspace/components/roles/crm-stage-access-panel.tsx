"use client";

import { Fragment } from "react";

import {
  CRM_PIPELINE_STAGES,
  type CrmStageAccess,
} from "@/features/workspace/data/workspace-permissions-catalog";
import type { StageAccessRule } from "@/features/workspace/data/workspace-roles-demo";
import { cn } from "@/lib/utils/cn";

type Props = {
  stageAccess: Record<string, StageAccessRule>;
  onChange: (next: Record<string, StageAccessRule>) => void;
};

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative mx-auto h-6 w-11 rounded-full transition",
        checked ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
          checked ? "left-[22px]" : "left-0.5",
        )}
      />
    </button>
  );
}

export function CrmStageAccessPanel({ stageAccess, onChange }: Props) {
  const groups = CRM_PIPELINE_STAGES.reduce<Record<string, CrmStageAccess[]>>((acc, stage) => {
    if (!acc[stage.group]) acc[stage.group] = [];
    acc[stage.group].push(stage);
    return acc;
  }, {});

  const patch = (stageId: string, patchRule: Partial<StageAccessRule>) => {
    const current = stageAccess[stageId] ?? { view: false, move: false, edit: false };
    onChange({
      ...stageAccess,
      [stageId]: { ...current, ...patchRule },
    });
  };

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Default stage access</h3>
        <p className="mt-1 text-xs text-slate-500">Control pipeline stage visibility and actions for this role.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="bg-blue-600 text-xs font-bold uppercase tracking-wider text-white">
              <th className="px-4 py-3">Stage name</th>
              <th className="px-4 py-3 text-center">Can view</th>
              <th className="px-4 py-3 text-center">Can move</th>
              <th className="px-4 py-3 text-center">Can edit</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groups).map(([group, stages]) => (
              <Fragment key={group}>
                <tr className="bg-slate-100/90 dark:bg-slate-800/80">
                  <td colSpan={4} className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                    {group}
                  </td>
                </tr>
                {stages.map((stage, i) => {
                  const rule = stageAccess[stage.id] ?? { view: false, move: false, edit: false };
                  return (
                    <tr
                      key={stage.id}
                      className={cn(
                        "border-t border-slate-100 dark:border-slate-800",
                        i % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/80 dark:bg-slate-950/40",
                      )}
                    >
                      <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-200">{stage.label}</td>
                      <td className="px-4 py-2.5 text-center">
                        <Toggle checked={rule.view} onChange={(v) => patch(stage.id, { view: v })} />
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <Toggle checked={rule.move} onChange={(v) => patch(stage.id, { move: v })} />
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <Toggle checked={rule.edit} onChange={(v) => patch(stage.id, { edit: v })} />
                      </td>
                    </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
