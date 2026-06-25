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
import { Check, MoreVertical, X } from "lucide-react";
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

const stageHeaderTone: Record<LeadBoardStage["tone"], string> = {
  blue: "bg-gradient-to-r from-blue-50/60 to-white text-blue-900 border-b-blue-100 dark:from-blue-950/40 dark:to-slate-900/80 dark:text-blue-200 dark:border-b-blue-950/40",
  amber: "bg-gradient-to-r from-amber-50/70 to-white text-amber-900 border-b-amber-100 dark:from-amber-950/40 dark:to-slate-900/80 dark:text-amber-200 dark:border-b-amber-950/40",
  emerald: "bg-gradient-to-r from-emerald-50/70 to-white text-emerald-900 border-b-emerald-100 dark:from-emerald-950/40 dark:to-slate-900/80 dark:text-emerald-200 dark:border-b-emerald-950/40",
  slate: "bg-gradient-to-r from-slate-50/70 to-white text-slate-900 border-b-slate-100 dark:from-slate-800/40 dark:to-slate-900/80 dark:text-slate-200 dark:border-b-slate-850/40",
  rose: "bg-gradient-to-r from-rose-50/70 to-white text-rose-900 border-b-rose-100 dark:from-rose-950/40 dark:to-slate-900/80 dark:text-rose-200 dark:border-b-rose-950/40",
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
  isOwner?: boolean;
  onRenameStage?: (stageId: string, name: string) => void;
  onDeleteStage?: (stageId: string) => void;
  className?: string;
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
  isOwner,
  onRenameStage,
  onDeleteStage,
}: {
  stage: LeadBoardStage;
  leads: LeadRecord[];
  onSelect: (lead: LeadRecord) => void;
  highlighted?: boolean;
  columnRef?: (node: HTMLDivElement | null) => void;
  isOwner?: boolean;
  onRenameStage?: (stageId: string, name: string) => void;
  onDeleteStage?: (stageId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: { type: "column", stageId: stage.id },
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(stage.name);

  useEffect(() => {
    setEditName(stage.name);
  }, [stage.name]);

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = editName.trim();
    if (trimmed && trimmed !== stage.name) {
      onRenameStage?.(stage.id, trimmed);
    }
    setIsEditing(false);
  };

  const atRisk = leads.filter((l) => l.slaStatus !== "on_track").length;

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        columnRef?.(node);
      }}
      className={cn(
        "flex w-[min(100%,288px)] h-full min-h-0 shrink-0 flex-col rounded-xl border border-slate-200/80 border-t-[3px] bg-slate-50/40 dark:border-slate-800 dark:bg-slate-950/30",
        stageAccent[stage.tone],
        isOver && "ring-2 ring-[#2277FF]/25 ring-offset-1",
        highlighted && "ring-2 ring-[#2277FF]/40 ring-offset-2",
      )}
    >
      <div className={cn(
        "flex shrink-0 items-center justify-between gap-2 border-b px-3.5 py-3 rounded-t-xl",
        stageHeaderTone[stage.tone]
      )}>
        {isEditing ? (
          <form onSubmit={handleSaveRename} className="flex items-center gap-1.5 w-full bg-white/95 dark:bg-slate-900/95 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
            <input
              autoFocus
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 min-w-0 bg-transparent text-xs font-semibold text-slate-850 outline-none dark:text-white"
            />
            <button
              type="submit"
              className="rounded p-0.5 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950/40"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditName(stage.name);
              }}
              className="rounded p-0.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </form>
        ) : (
          <>
            <div className="min-w-0">
              <h3 className="truncate text-[13px] font-extrabold leading-tight">{stage.name}</h3>
              {atRisk > 0 ? (
                <p className="mt-0.5 text-[10px] font-bold text-amber-850 dark:text-amber-300">
                  ⚠️ {atRisk} need follow-up
                </p>
              ) : (
                <p className="mt-0.5 text-[10px] opacity-75">
                  {leads.length === 1 ? "1 lead" : `${leads.length} leads`}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={cn(
                "inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-[10.5px] font-extrabold tabular-nums text-white shadow-sm",
                stage.tone === "blue" ? "bg-blue-650" : stage.tone === "amber" ? "bg-amber-650" : stage.tone === "emerald" ? "bg-emerald-650" : stage.tone === "rose" ? "bg-rose-650" : "bg-slate-650"
              )}>
                {leads.length}
              </span>
              {isOwner && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>
                  {isMenuOpen && (
                    <>
                      <button
                        type="button"
                        className="fixed inset-0 z-10 cursor-default bg-transparent"
                        aria-label="Close menu"
                        onClick={() => setIsMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-7 z-20 w-32 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(true);
                            setIsMenuOpen(false);
                          }}
                          className="w-full rounded px-2.5 py-1.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-250 dark:hover:bg-slate-800"
                        >
                          Rename Stage
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            if (confirm(`Are you sure you want to delete the stage "${stage.name}"?`)) {
                              onDeleteStage?.(stage.id);
                            }
                          }}
                          className="w-full rounded px-2.5 py-1.5 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-450 dark:hover:bg-rose-950/20"
                        >
                          Delete Stage
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-y-contain p-2.5">
          {leads.length === 0 ? (
            <p className="flex h-full min-h-[200px] items-center justify-center rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-400 dark:border-slate-700">
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
  isOwner = false,
  onRenameStage,
  onDeleteStage,
  className,
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
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full min-h-0 items-stretch gap-3 overflow-x-auto overflow-y-hidden px-1 pb-1">
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
            isOwner={isOwner}
            onRenameStage={onRenameStage}
            onDeleteStage={onDeleteStage}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
        {activeLead ? <LeadKanbanCard lead={activeLead} isDragging onSelect={() => {}} /> : null}
      </DragOverlay>
      </DndContext>
    </div>
  );
}
