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

type Props = {
  deals: DealRecord[];
  onChange: (next: DealRecord[]) => void;
  onSelect: (deal: DealRecord) => void;
  searchQuery?: string;
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
        "rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-sm transition dark:border-slate-700 dark:bg-slate-900",
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

function SortableDealCard({ deal, onSelect }: { deal: DealRecord; onSelect: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal.id,
    data: { type: "deal", deal },
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
}: {
  stage: DealStage;
  deals: DealRecord[];
  onSelect: (deal: DealRecord) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
    data: { type: "column", stageId: stage },
  });

  const totalValue = deals.reduce((s, d) => s + d.value, 0);
  const meta = DEAL_STAGE_META[stage];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-[min(100%,280px)] shrink-0 flex-col rounded-2xl border border-slate-200/80 border-t-4 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950",
        stageTone[stage],
        isOver && "ring-2 ring-[#191970]/30",
      )}
    >
      <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{meta.label}</h3>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {deals.length}
          </span>
        </div>
        <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
          {formatDealValue(totalValue, deals[0]?.currency ?? "USD")}
        </p>
      </div>

      <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-[120px] flex-1 flex-col gap-2.5 p-3">
          {deals.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-xs text-slate-400 dark:border-slate-700">
              Drop deals here
            </p>
          ) : (
            deals.map((deal) => (
              <SortableDealCard key={deal.id} deal={deal} onSelect={() => onSelect(deal)} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function DealsKanbanBoard({ deals, onChange, onSelect, searchQuery = "" }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

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

  const dealsByStage = useMemo(() => {
    const map = Object.fromEntries(BOARD_STAGES.map((s) => [s, [] as DealRecord[]])) as Record<
      DealStage,
      DealRecord[]
    >;
    for (const deal of filtered) {
      map[deal.stage]?.push(deal);
    }
    return map;
  }, [filtered]);

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
    const targetStage = BOARD_STAGES.includes(overId as DealStage)
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
    const targetStage = BOARD_STAGES.includes(overId as DealStage)
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
      <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
        {BOARD_STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            deals={dealsByStage[stage] ?? []}
            onSelect={onSelect}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
        {activeDeal ? <DealCard deal={activeDeal} isDragging onSelect={() => {}} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
