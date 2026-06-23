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

import { LeadKanbanCard } from "@/features/workspace/components/crm/leads/lead-kanban-card";
import {
  LEAD_BOARD_STAGES,
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

function emptyLeadsByStage(): Record<LeadStatus, LeadRecord[]> {
  const map = {} as Record<LeadStatus, LeadRecord[]>;
  for (const stage of LEAD_BOARD_STAGES) {
    map[stage.id] = [];
  }
  return map;
}

type Props = {
  leads: LeadRecord[];
  onChange: (next: LeadRecord[]) => void;
  onSelect: (lead: LeadRecord) => void;
  searchQuery?: string;
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
}: {
  stage: LeadBoardStage;
  leads: LeadRecord[];
  onSelect: (lead: LeadRecord) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: { type: "column", stageId: stage.id },
  });

  const atRisk = leads.filter((l) => l.slaStatus !== "on_track").length;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-[min(100%,288px)] shrink-0 flex-col rounded-xl border border-slate-200/80 border-t-[3px] bg-slate-50/40 dark:border-slate-800 dark:bg-slate-950/30",
        stageAccent[stage.tone],
        isOver && "ring-2 ring-[#2277FF]/25 ring-offset-1",
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

export function LeadsKanbanBoard({ leads, onChange, onSelect, searchQuery = "" }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

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

  const leadsByStage = useMemo(() => {
    const map = emptyLeadsByStage();
    for (const lead of filtered) {
      const stageId = LEAD_BOARD_STAGES.some((s) => s.id === lead.status) ? lead.status : "new";
      map[stageId].push(lead);
    }
    return map;
  }, [filtered]);

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  const findStageForLead = useCallback(
    (leadId: string) => leads.find((l) => l.id === leadId)?.status,
    [leads],
  );

  const moveLead = (leadId: string, targetStatus: LeadStatus) => {
    onChange(
      leads.map((l) =>
        l.id === leadId
          ? {
              ...l,
              status: targetStatus,
              updatedAt: "Just now",
              slaStatus: targetStatus === "interested" || targetStatus === "move_to_activation" ? "on_track" : l.slaStatus,
            }
          : l,
      ),
    );
  };

  const handleDragStart = (event: DragStartEvent) => setActiveId(String(event.active.id));

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const leadId = String(active.id);
    const overId = String(over.id);
    const targetStatus = LEAD_BOARD_STAGES.some((s) => s.id === overId)
      ? (overId as LeadStatus)
      : findStageForLead(overId);
    const current = findStageForLead(leadId);
    if (!targetStatus || !current || targetStatus === current) return;
    moveLead(leadId, targetStatus);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const leadId = String(active.id);
    const overId = String(over.id);
    const targetStatus = LEAD_BOARD_STAGES.some((s) => s.id === overId)
      ? (overId as LeadStatus)
      : findStageForLead(overId);
    if (targetStatus) moveLead(leadId, targetStatus);
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
        {LEAD_BOARD_STAGES.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            leads={leadsByStage[stage.id]}
            onSelect={onSelect}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
        {activeLead ? <LeadKanbanCard lead={activeLead} isDragging onSelect={() => {}} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
