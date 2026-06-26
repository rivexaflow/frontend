"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  DEAL_STAGE_META,
  formatDealValue,
  type DealRecord,
  type DealStage,
} from "@/features/workspace/data/deals-demo";
import { cn } from "@/lib/utils/cn";

const OPEN_STAGES: DealStage[] = [
  "qualification",
  "discovery",
  "proposal",
  "negotiation",
];

const BOARD_STAGES: DealStage[] = [...OPEN_STAGES, "closed_won", "closed_lost"];

const stageTone: Record<string, string> = {
  qualification: "border-t-[#191970]",
  discovery: "border-t-blue-500",
  proposal: "border-t-purple-500",
  negotiation: "border-t-amber-500",
  closed_won: "border-t-emerald-500",
  closed_lost: "border-t-rose-400",
};

const priorityDot: Record<DealRecord["priority"], string> = {
  high: "bg-rose-500",
  medium: "bg-amber-500",
  low: "bg-slate-400",
};

const stageHeaderTone: Record<string, string> = {
  qualification: "from-blue-50/60 to-white text-blue-900 border-b-blue-100 dark:from-blue-950/40 dark:to-slate-900/80 dark:text-blue-200 dark:border-b-blue-950/40",
  discovery: "from-blue-50/60 to-white text-blue-900 border-b-blue-100 dark:from-blue-950/40 dark:to-slate-900/80 dark:text-blue-200 dark:border-b-blue-950/40",
  proposal: "from-purple-50/70 to-white text-purple-900 border-b-purple-100 dark:from-purple-950/40 dark:to-slate-900/80 dark:text-purple-200 dark:border-b-purple-100/40",
  negotiation: "from-amber-50/70 to-white text-amber-900 border-b-amber-100 dark:from-amber-950/40 dark:to-slate-900/80 dark:text-amber-200 dark:border-b-amber-100/40",
  closed_won: "from-emerald-50/70 to-white text-emerald-900 border-b-emerald-100 dark:from-emerald-950/40 dark:to-slate-900/80 dark:text-emerald-200 dark:border-b-emerald-100/40",
  closed_lost: "from-rose-50/70 to-white text-rose-900 border-b-rose-100 dark:from-rose-950/40 dark:to-slate-900/80 dark:text-rose-200 dark:border-b-rose-100/40",
};

type Props = {
  stages?: DealStage[];
  deals: DealRecord[];
  onChange: (next: DealRecord[]) => void;
  onSelect: (deal: DealRecord) => void;
  searchQuery?: string;
  highlightStageId?: string | null;
  className?: string;
  isAdmin?: boolean;
};

function DealCard({
  deal,
  isDragging,
  onSelect,
}: {
  deal: DealRecord;
  isDragging?: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-sm transition dark:border-slate-700 dark:bg-slate-900 hover:-translate-y-[3px] hover:shadow-md duration-300 ease-out",
        isDragging && "rotate-1 shadow-lg ring-2 ring-[#191970]/25",
      )}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 cursor-grab text-slate-300 active:cursor-grabbing" />
        <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold leading-snug text-slate-900 dark:text-white">{deal.title}</p>
            <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", priorityDot[deal.priority])} />
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <Building2 className="h-3 w-3" />
            {deal.company}
          </p>
          <p className="mt-2 text-base font-bold text-slate-900 dark:text-white">
            {formatDealValue(deal.value, deal.currency)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <User className="h-3 w-3" />
              {deal.owner.split(" ")[0]}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {deal.closeDate}
            </span>
            <span className="font-semibold text-[#191970] dark:text-blue-300">{deal.probability}%</span>
          </div>
        </button>
      </div>
    </div>
  );
}

function SortableDealCard({ deal, onSelect, disabled }: { deal: DealRecord; onSelect: () => void; disabled?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal.id,
    data: { type: "deal", deal },
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.45 : 1,
      }}
      {...attributes}
      {...listeners}
    >
      <DealCard deal={deal} onSelect={onSelect} />
    </div>
  );
}

function KanbanColumn({
  stage,
  deals,
  onSelect,
  isAdmin,
  highlighted,
  columnRef,
}: {
  stage: DealStage;
  deals: DealRecord[];
  onSelect: (deal: DealRecord) => void;
  isAdmin?: boolean;
  highlighted?: boolean;
  columnRef?: (node: HTMLDivElement | null) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
    data: { type: "column", stageId: stage },
  });

  const totalValue = deals.reduce((s, d) => s + d.value, 0);
  const meta = DEAL_STAGE_META[stage];

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        columnRef?.(node);
      }}
      className={cn(
        "flex w-[min(100%,280px)] h-full min-h-0 shrink-0 flex-col rounded-2xl border border-slate-200/80 border-t-4 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-950/30 shadow-sm",
        stageTone[stage],
        isOver && "ring-2 ring-[#191970]/30",
        highlighted && "ring-2 ring-[#191970]/45 ring-offset-2",
      )}
    >
      <div className={cn(
        "flex shrink-0 flex-col border-b px-4 py-3 rounded-t-2xl bg-gradient-to-r",
        stageHeaderTone[stage]
      )}>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-extrabold leading-tight">{meta.label}</h3>
          <span className={cn(
            "inline-flex h-5 min-w-5 items-center justify-center rounded-md px-1.5 text-[10px] font-extrabold tabular-nums text-white shadow-sm",
            stage === "qualification" ? "bg-[#191970]" : stage === "discovery" ? "bg-blue-600" : stage === "proposal" ? "bg-purple-600" : stage === "negotiation" ? "bg-amber-600" : stage === "closed_won" ? "bg-emerald-600" : "bg-rose-600"
          )}>
            {deals.length}
          </span>
        </div>
        <p className="mt-1 text-sm font-extrabold">
          {formatDealValue(totalValue, deals[0]?.currency ?? "USD")}
        </p>
      </div>

      <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overscroll-y-contain p-3">
          {deals.length === 0 ? (
            <p className="flex h-full min-h-[120px] items-center justify-center rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-400 dark:border-slate-700">
              Drop deals here
            </p>
          ) : (
            deals.map((deal) => (
              <SortableDealCard key={deal.id} deal={deal} onSelect={() => onSelect(deal)} disabled={!isAdmin} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function DealsKanbanBoard({
  stages = BOARD_STAGES,
  deals,
  onChange,
  onSelect,
  searchQuery = "",
  highlightStageId = null,
  className,
  isAdmin = false,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const columnRefs = useRef(new Map<string, HTMLDivElement>());

  useEffect(() => {
    if (!highlightStageId) return;
    const el = columnRefs.current.get(highlightStageId);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [highlightStageId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return deals;
    return deals.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.company.toLowerCase().includes(q) ||
        d.owner.toLowerCase().includes(q) ||
        d.reference.toLowerCase().includes(q),
    );
  }, [deals, searchQuery]);

  const stageIdSet = useMemo(() => new Set<DealStage>(stages), [stages]);

  const dealsByStage = useMemo(() => {
    const map = Object.fromEntries(stages.map((s) => [s, [] as DealRecord[]])) as Record<
      DealStage,
      DealRecord[]
    >;
    for (const deal of filtered) {
      if (stageIdSet.has(deal.stage)) {
        map[deal.stage]?.push(deal);
      }
    }
    return map;
  }, [filtered, stages, stageIdSet]);

  const activeDeal = activeId ? deals.find((d) => d.id === activeId) : null;

  const findStageForDeal = useCallback(
    (dealId: string) => deals.find((d) => d.id === dealId)?.stage,
    [deals],
  );

  const moveDeal = (dealId: string, targetStage: DealStage) => {
    onChange(
      deals.map((d) =>
        d.id === dealId
          ? {
              ...d,
              stage: targetStage,
              probability:
                targetStage === "closed_won"
                  ? 100
                  : targetStage === "closed_lost"
                    ? 0
                    : d.probability,
              lastActivity: "Just now",
            }
          : d,
      ),
    );
  };

  const handleDragStart = (event: DragStartEvent) => setActiveId(String(event.active.id));

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const dealId = String(active.id);
    const overId = String(over.id);
    const targetStage = stageIdSet.has(overId as DealStage)
      ? (overId as DealStage)
      : findStageForDeal(overId);
    const current = findStageForDeal(dealId);
    if (!targetStage || !current || targetStage === current) return;
    moveDeal(dealId, targetStage);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const dealId = String(active.id);
    const overId = String(over.id);
    const targetStage = stageIdSet.has(overId as DealStage)
      ? (overId as DealStage)
      : findStageForDeal(overId);
    if (targetStage) moveDeal(dealId, targetStage);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={cn("-mx-1 flex min-h-0 flex-1 gap-4 overflow-x-auto px-1 pb-2", className)}>
        {stages.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            deals={dealsByStage[stage] ?? []}
            onSelect={onSelect}
            isAdmin={isAdmin}
            highlighted={highlightStageId === stage}
            columnRef={(node) => {
              if (node) columnRefs.current.set(stage, node);
              else columnRefs.current.delete(stage);
            }}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
        {activeDeal ? <DealCard deal={activeDeal} isDragging onSelect={() => {}} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
