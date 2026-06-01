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
import { Building2, Calendar, GripVertical, User } from "lucide-react";

import {
  PIPELINE_STAGES,
  formatDealValue,
  sumStageValue,
  type OpportunityRecord,
  type PipelineStage,
} from "@/features/workspace/data/crm-demo";
import { cn } from "@/lib/utils/cn";

const stageTone: Record<PipelineStage["tone"], string> = {
  blue: "border-t-blue-500 bg-gradient-to-b from-blue-50/80 to-white dark:from-blue-950/30 dark:to-slate-900",
  indigo: "border-t-indigo-500 bg-gradient-to-b from-indigo-50/80 to-white dark:from-indigo-950/30 dark:to-slate-900",
  purple: "border-t-purple-500 bg-gradient-to-b from-purple-50/80 to-white dark:from-purple-950/30 dark:to-slate-900",
  amber: "border-t-amber-500 bg-gradient-to-b from-amber-50/80 to-white dark:from-amber-950/30 dark:to-slate-900",
  emerald: "border-t-emerald-500 bg-gradient-to-b from-emerald-50/80 to-white dark:from-emerald-950/30 dark:to-slate-900",
};

const priorityDot: Record<OpportunityRecord["priority"], string> = {
  high: "bg-rose-500",
  medium: "bg-amber-500",
  low: "bg-slate-400",
};

type Props = {
  opportunities: OpportunityRecord[];
  onChange: (next: OpportunityRecord[]) => void;
  searchQuery?: string;
};

function DealCard({
  deal,
  isDragging,
}: {
  deal: OpportunityRecord;
  isDragging?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-sm transition dark:border-slate-700 dark:bg-slate-900",
        isDragging && "rotate-1 shadow-lg ring-2 ring-blue-500/30",
      )}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 cursor-grab text-slate-300 active:cursor-grabbing" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold leading-snug text-slate-900 dark:text-white">{deal.title}</p>
            <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", priorityDot[deal.priority])} title={deal.priority} />
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <Building2 className="h-3 w-3" />
            {deal.company}
          </p>
          <p className="mt-2 text-base font-bold text-slate-900 dark:text-white">{formatDealValue(deal.value)}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <User className="h-3 w-3" />
              {deal.owner.split(" ")[0]}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(deal.closeDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
            <span className="font-semibold text-blue-600">{deal.probability}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SortableDealCard({ deal }: { deal: OpportunityRecord }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal.id,
    data: { type: "deal", deal },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <DealCard deal={deal} />
    </div>
  );
}

function KanbanColumn({
  stage,
  deals,
  totalValue,
}: {
  stage: PipelineStage;
  deals: OpportunityRecord[];
  totalValue: number;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: { type: "column", stageId: stage.id },
  });

  const conversion =
    stage.id === "closed_won"
      ? "—"
      : deals.length > 0
        ? `${Math.round(deals.reduce((s, d) => s + d.probability, 0) / deals.length)}%`
        : "—";

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-[min(100%,280px)] shrink-0 flex-col rounded-2xl border border-slate-200/80 border-t-4 shadow-sm dark:border-slate-800",
        stageTone[stage.tone],
        isOver && "ring-2 ring-blue-500/40",
      )}
    >
      <div className="border-b border-slate-100/80 px-4 py-3 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{stage.name}</h3>
          <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300">
            {deals.length}
          </span>
        </div>
        <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{formatDealValue(totalValue)}</p>
        <p className="text-[11px] text-slate-500">Avg probability {conversion}</p>
      </div>

      <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-[120px] flex-1 flex-col gap-2.5 p-3">
          {deals.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-xs text-slate-400 dark:border-slate-700">
              Drop deals here
            </p>
          ) : (
            deals.map((deal) => <SortableDealCard key={deal.id} deal={deal} />)
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function PipelineKanbanBoard({ opportunities, onChange, searchQuery = "" }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return opportunities;
    return opportunities.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.company.toLowerCase().includes(q) ||
        o.owner.toLowerCase().includes(q),
    );
  }, [opportunities, searchQuery]);

  const dealsByStage = useMemo(() => {
    const map: Record<string, OpportunityRecord[]> = {};
    for (const stage of PIPELINE_STAGES) {
      map[stage.id] = filtered.filter((o) => o.stageId === stage.id);
    }
    return map;
  }, [filtered]);

  const activeDeal = activeId ? opportunities.find((o) => o.id === activeId) : null;

  const findStageForDeal = useCallback(
    (dealId: string) => opportunities.find((o) => o.id === dealId)?.stageId,
    [opportunities],
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeDealId = String(active.id);
    const overId = String(over.id);

    let targetStageId: string | undefined;
    if (PIPELINE_STAGES.some((s) => s.id === overId)) {
      targetStageId = overId;
    } else {
      targetStageId = findStageForDeal(overId);
    }

    const currentStageId = findStageForDeal(activeDealId);
    if (!targetStageId || !currentStageId || targetStageId === currentStageId) return;

    onChange(
      opportunities.map((o) => (o.id === activeDealId ? { ...o, stageId: targetStageId! } : o)),
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeDealId = String(active.id);
    const overId = String(over.id);

    let targetStageId: string | undefined;
    if (PIPELINE_STAGES.some((s) => s.id === overId)) {
      targetStageId = overId;
    } else {
      targetStageId = findStageForDeal(overId);
    }

    if (!targetStageId) return;

    onChange(
      opportunities.map((o) => (o.id === activeDealId ? { ...o, stageId: targetStageId! } : o)),
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            deals={dealsByStage[stage.id] ?? []}
            totalValue={sumStageValue(filtered, stage.id)}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
        {activeDeal ? <DealCard deal={activeDeal} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
