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

import { LeadKanbanCard } from "@/features/workspace/components/crm/leads/lead-kanban-card";
import {
  LEAD_BOARD_STAGES,
  resolveLeadBoardStageId,
  type LeadBoardStage,
  type LeadRecord,
  type LeadStatus,
} from "@/features/workspace/data/crm-demo";
import { cn } from "@/lib/utils/cn";

export { LEAD_BOARD_STAGES };

const stageAccent: Record<LeadBoardStage["tone"], string> = {
  blue: "border-t-[#2277FF]",
  amber: "border-t-amber-500",
  emerald: "border-t-emerald-500",
  slate: "border-t-slate-400",
  rose: "border-t-rose-500",
};

function emptyLeadsByStage(stages: LeadBoardStage[]): Record<string, LeadRecord[]> {
  const map: Record<string, LeadRecord[]> = {};
  for (const stage of stages) {
    map[stage.id] = [];
  }
  return map;
}

type Props = {
  stages: LeadBoardStage[];
  leads: LeadRecord[];
  onChange: (next: LeadRecord[]) => void;
  onSelect: (lead: LeadRecord) => void;
  searchQuery?: string;
  highlightStageId?: string | null;
};

function SortableLeadCard({
  lead,
  onSelect,
}: {
  lead: LeadRecord;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
    data: { type: "lead", lead },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      {...attributes}
      {...listeners}
    >
      <LeadKanbanCard lead={lead} onSelect={onSelect} />
    </div>
  );
}

function KanbanColumn({
  stage,
  leads,
  onSelect,
  highlighted,
  columnRef,
}: {
  stage: LeadBoardStage;
  leads: LeadRecord[];
  onSelect: (lead: LeadRecord) => void;
  highlighted?: boolean;
  columnRef?: (node: HTMLDivElement | null) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: { type: "column", stageId: stage.id },
  });

  const atRisk = leads.filter((l) => l.slaStatus !== "on_track").length;

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        columnRef?.(node);
      }}
      className={cn(
        "flex w-[min(100%,288px)] shrink-0 flex-col rounded-xl border border-slate-200/80 border-t-[3px] bg-slate-50/40 dark:border-slate-800 dark:bg-slate-950/30",
        stageAccent[stage.tone],
        isOver && "ring-2 ring-[#2277FF]/25 ring-offset-1",
        highlighted && "ring-2 ring-[#2277FF]/40 ring-offset-2",
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-200/70 bg-white/80 px-3.5 py-3 dark:border-slate-800 dark:bg-slate-900/80">
        <div className="min-w-0">
          <h3 className="truncate text-[13px] font-bold text-slate-900 dark:text-white">{stage.name}</h3>
          {atRisk > 0 ? (
            <p className="mt-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400">
              {atRisk} need follow-up
            </p>
          ) : (
            <p className="mt-0.5 text-[10px] text-slate-500">
              {leads.length === 1 ? "1 lead" : `${leads.length} leads`}
            </p>
          )}
        </div>
        <span className="inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-md bg-[#191970] px-1.5 text-[10px] font-bold tabular-nums text-white">
          {leads.length}
        </span>
      </div>

      <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <div className="flex max-h-[min(72vh,640px)] min-h-[200px] flex-col gap-2 overflow-y-auto p-2.5">
          {leads.length === 0 ? (
            <p className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-200 py-10 text-center text-xs text-slate-400 dark:border-slate-700">
              Drop leads here
            </p>
          ) : (
            leads.map((lead) => (
              <SortableLeadCard key={lead.id} lead={lead} onSelect={() => onSelect(lead)} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function LeadsKanbanBoard({
  stages,
  leads,
  onChange,
  onSelect,
  searchQuery = "",
  highlightStageId = null,
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
    if (!q) return leads;
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.owner.toLowerCase().includes(q),
    );
  }, [leads, searchQuery]);

  const stageIdSet = useMemo(() => new Set(stages.map((s) => s.id)), [stages]);

  const leadsByStage = useMemo(() => {
    const map = emptyLeadsByStage(stages);
    for (const lead of filtered) {
      const stageId = resolveLeadBoardStageId(lead, stageIdSet);
      if (map[stageId]) {
        map[stageId].push(lead);
      } else if (map.new) {
        map.new.push(lead);
      }
    }
    return map;
  }, [filtered, stages, stageIdSet]);

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  const findStageForLead = useCallback(
    (leadId: string) => {
      const lead = leads.find((l) => l.id === leadId);
      if (!lead) return undefined;
      return resolveLeadBoardStageId(lead, stageIdSet);
    },
    [leads, stageIdSet],
  );

  const moveLead = (leadId: string, targetStageId: string) => {
    const knownStatuses = new Set<string>([
      "new",
      "not_interested",
      "not_pickup_call",
      "callback",
      "interested",
      "ready_to_open_account",
      "document_pending",
      "document_received",
      "technical_error_kyc",
      "account_rejected",
      "move_to_activation",
      "nurturing",
      "qualified",
      "lost",
    ]);

    onChange(
      leads.map((l) => {
        if (l.id !== leadId) return l;
        const next: LeadRecord = {
          ...l,
          boardStage: targetStageId,
          updatedAt: "Just now",
        };
        if (knownStatuses.has(targetStageId)) {
          next.status = targetStageId as LeadStatus;
          if (targetStageId === "interested" || targetStageId === "move_to_activation") {
            next.slaStatus = "on_track";
          }
        }
        return next;
      }),
    );
  };

  const resolveDropStage = (overId: string) =>
    stageIdSet.has(overId) ? overId : findStageForLead(overId);

  const handleDragStart = (event: DragStartEvent) => setActiveId(String(event.active.id));

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const leadId = String(active.id);
    const overId = String(over.id);
    const targetStageId = resolveDropStage(overId);
    const current = findStageForLead(leadId);
    if (!targetStageId || !current || targetStageId === current) return;
    moveLead(leadId, targetStageId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const leadId = String(active.id);
    const overId = String(over.id);
    const targetStageId = resolveDropStage(overId);
    if (targetStageId) moveLead(leadId, targetStageId);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {stages.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            leads={leadsByStage[stage.id] ?? []}
            onSelect={onSelect}
            highlighted={highlightStageId === stage.id}
            columnRef={(node) => {
              if (node) columnRefs.current.set(stage.id, node);
              else columnRefs.current.delete(stage.id);
            }}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
        {activeLead ? <LeadKanbanCard lead={activeLead} isDragging onSelect={() => {}} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
