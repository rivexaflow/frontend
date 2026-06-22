"use client";

import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowLeft, GripVertical, Mail, Star } from "lucide-react";

import {
  HRM_DASHBOARD_COLORS,
  HRM_RECRUITMENT_STAGES,
  type HrmCandidate,
  type HrmRecruitmentStage,
} from "@/features/workspace/data/hrm-dashboard-demo";
import { cn } from "@/lib/utils/cn";

const stageBorder: Record<string, string> = {
  blue: "border-t-[#2277ff]",
  sky: "border-t-[#0ea5e9]",
  green: "border-t-emerald-500",
};

type Props = {
  candidates: HrmCandidate[];
  onChange: (next: HrmCandidate[]) => void;
  focusStage?: HrmRecruitmentStage | null;
  onClose: () => void;
  embedded?: boolean;
};

function CandidateCard({ candidate, isDragging }: { candidate: HrmCandidate; isDragging?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200/90 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900",
        isDragging && "rotate-1 shadow-lg ring-2 ring-[#2277ff]/30",
      )}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 cursor-grab text-slate-300 active:cursor-grabbing" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{candidate.name}</p>
          <p className="mt-0.5 text-xs text-slate-500">{candidate.role}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {candidate.email.split("@")[0]}
            </span>
            {candidate.score != null ? (
              <span className="inline-flex items-center gap-0.5 font-semibold text-[#2277ff]">
                <Star className="h-3 w-3 fill-[#2277ff]" />
                {candidate.score}
              </span>
            ) : null}
            <span>Applied {candidate.appliedAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SortableCandidateCard({ candidate }: { candidate: HrmCandidate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: candidate.id,
    data: { type: "candidate", candidate },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      {...attributes}
      {...listeners}
    >
      <CandidateCard candidate={candidate} />
    </div>
  );
}

function StageColumn({
  stageId,
  name,
  tone,
  candidates,
  focused,
}: {
  stageId: HrmRecruitmentStage;
  name: string;
  tone: string;
  candidates: HrmCandidate[];
  focused?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stageId, data: { type: "column", stageId } });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-[min(100%,280px)] shrink-0 flex-col rounded-2xl border border-slate-200/80 border-t-4 bg-gradient-to-b from-slate-50/80 to-white shadow-sm dark:border-slate-800 dark:from-slate-950/30 dark:to-slate-900",
        stageBorder[tone],
        isOver && "ring-2 ring-[#2277ff]/40",
        focused && "ring-2 ring-[#191970]/25",
      )}
    >
      <div className="border-b border-slate-100/80 px-4 py-3 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{name}</h3>
          <span className="rounded-full bg-[#191970] px-2 py-0.5 text-[10px] font-bold text-white">{candidates.length}</span>
        </div>
      </div>
      <SortableContext items={candidates.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-[140px] flex-1 flex-col gap-2.5 p-3">
          {candidates.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-xs text-slate-400">Drop candidates here</p>
          ) : (
            candidates.map((c) => <SortableCandidateCard key={c.id} candidate={c} />)
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function HrmDashboardRecruitmentBoard({
  candidates,
  onChange,
  focusStage,
  onClose,
  embedded = false,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const byStage = useMemo(() => {
    const map: Record<HrmRecruitmentStage, HrmCandidate[]> = {
      applicant: [],
      interviewed: [],
      hired: [],
    };
    for (const c of candidates) map[c.stageId].push(c);
    return map;
  }, [candidates]);

  const active = activeId ? candidates.find((c) => c.id === activeId) : null;

  const findStage = useCallback((id: string) => candidates.find((c) => c.id === id)?.stageId, [candidates]);

  const moveToStage = (candidateId: string, stageId: HrmRecruitmentStage) => {
    onChange(candidates.map((c) => (c.id === candidateId ? { ...c, stageId } : c)));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active: a, over } = event;
    if (!over) return;
    const candidateId = String(a.id);
    const overId = String(over.id);
    let target = HRM_RECRUITMENT_STAGES.find((s) => s.id === overId)?.id;
    if (!target) target = findStage(overId);
    const current = findStage(candidateId);
    if (!target || !current || target === current) return;
    moveToStage(candidateId, target);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active: a, over } = event;
    setActiveId(null);
    if (!over) return;
    const candidateId = String(a.id);
    const overId = String(over.id);
    let target = HRM_RECRUITMENT_STAGES.find((s) => s.id === overId)?.id;
    if (!target) target = findStage(overId);
    if (target) moveToStage(candidateId, target);
  };

  const board = (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-2">
        {HRM_RECRUITMENT_STAGES.map((stage) => (
          <StageColumn
            key={stage.id}
            stageId={stage.id}
            name={stage.name}
            tone={stage.tone}
            candidates={byStage[stage.id]}
            focused={focusStage === stage.id}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
        {active ? <CandidateCard candidate={active} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );

  if (embedded) {
    return <div className="rounded-xl border border-slate-200/80 p-3 dark:border-slate-800">{board}</div>;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#2277ff]/20 bg-white shadow-[0_4px_24px_rgba(34,119,255,0.08)] dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div>
          <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">Recruitment pipeline</h3>
          <p className="mt-0.5 text-xs text-slate-500">Drag candidates between Applicant, Interviewed, and Hired</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </button>
      </div>
      <div className="p-4">{board}</div>
      <p className="border-t border-slate-100 px-5 py-2 text-[10px] text-slate-400 dark:border-slate-800">
        Tip: moving to <strong className="text-emerald-600">Hired</strong> updates headcount metrics ·{" "}
        <span style={{ color: HRM_DASHBOARD_COLORS.blue }}>Interviewed</span> syncs with schedule
      </p>
    </section>
  );
}
