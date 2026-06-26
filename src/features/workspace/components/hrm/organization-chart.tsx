"use client";

import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  GripVertical,
  Maximize2,
  RefreshCw,
  Star,
  User,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import {
  ORG_CARD_WIDTH,
  measureOrgTree,
} from "@/features/workspace/components/hrm/org-chart-layout";
import {
  countReports,
  createSubordinate,
  employeesByManager,
  type HrmEmployee,
  wouldCreateCycle,
} from "@/features/workspace/data/hrm-org-demo";
import { cn } from "@/lib/utils/cn";

type ChartProps = {
  employees: HrmEmployee[];
  onEmployeesChange: (next: HrmEmployee[]) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onReassignManager?: (employeeId: string, managerId: string) => Promise<void>;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function OrgChartCard({
  employee,
  employees,
  selected,
  isDropTarget,
  isDragging,
  onSelect,
  onToggleStar,
}: {
  employee: HrmEmployee;
  employees: HrmEmployee[];
  selected: boolean;
  isDropTarget: boolean;
  isDragging: boolean;
  onSelect: () => void;
  onToggleStar: () => void;
}) {
  const isRoot = employee.managerId === null;
  const reportCount = countReports(employees, employee.id);
  const headerLabel = employee.unitLabel ?? employee.department;

  const { attributes, listeners, setNodeRef: dragRef, transform, isDragging: dndDragging } =
    useDraggable({ id: employee.id, data: { employee } });

  const { setNodeRef: dropRef, isOver } = useDroppable({
    id: `drop-${employee.id}`,
    data: { employeeId: employee.id },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={(node) => {
        dragRef(node);
        dropRef(node);
      }}
      style={style}
      className={cn(
        "relative shrink-0 transition-all duration-200",
        (isDragging || dndDragging) && "z-30 opacity-40",
      )}
    >
      <article
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        className={cn(
          "group relative w-[252px] overflow-hidden rounded-2xl text-left",
          "bg-gradient-to-b from-slate-800/98 to-slate-950/98",
          "shadow-[0_4px_24px_rgba(0,0,0,0.35)]",
          "ring-1 ring-white/[0.06] transition-all duration-200",
          selected &&
            "ring-2 ring-blue-400 shadow-[0_0_0_1px_rgba(96,165,250,0.4),0_12px_40px_rgba(37,99,235,0.35)]",
          !selected && "hover:ring-blue-500/30 hover:shadow-[0_8px_32px_rgba(37,99,235,0.15)]",
          (isOver || isDropTarget) && "ring-2 ring-blue-300/80",
          isRoot && !selected && "ring-blue-500/25",
        )}
      >
        {selected ? (
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500" />
        ) : null}

        <header className="flex items-center justify-between gap-2 border-b border-white/[0.06] px-4 py-2.5">
          <span className="truncate text-[11px] font-semibold tracking-wide text-slate-300">
            {headerLabel}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar();
            }}
            className={cn(
              "shrink-0 rounded-lg p-1 transition",
              employee.starred
                ? "bg-amber-500/15 text-amber-400"
                : "text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-white/5 hover:text-slate-300",
            )}
            aria-label={employee.starred ? "Unpin" : "Pin unit"}
          >
            <Star className={cn("h-3.5 w-3.5", employee.starred && "fill-current")} />
          </button>
        </header>

        {employee.vacant ? (
          <div className="border-b border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-center text-[10px] font-semibold text-amber-300/90">
            No head assigned
          </div>
        ) : null}

        <div className="flex flex-col items-center px-4 py-5">
          <div
            className={cn(
              "relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl text-base font-bold shadow-inner",
              isRoot
                ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white ring-2 ring-blue-400/40"
                : "bg-gradient-to-br from-slate-600 to-slate-800 text-slate-100 ring-1 ring-white/10",
            )}
          >
            {employee.vacant ? (
              <User className="h-7 w-7 text-slate-400" />
            ) : (
              initials(employee.name)
            )}
            {isRoot ? (
              <span className="absolute -bottom-1.5 rounded-md bg-blue-600 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">
                Root
              </span>
            ) : null}
          </div>
          <p className="mt-3 line-clamp-2 text-center text-[15px] font-semibold leading-snug text-white">
            {employee.vacant ? "Vacant role" : employee.name}
          </p>
          <p className="mt-1 line-clamp-2 text-center text-xs font-medium text-slate-400">
            {employee.designation}
          </p>
          {employee.roleType ? (
            <span className="mt-2.5 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[9px] font-bold tracking-wider text-blue-300 uppercase">
              {employee.roleType.replace('_', ' ')}
            </span>
          ) : null}
        </div>

        <footer className="flex items-center justify-between border-t border-white/[0.06] bg-black/25 px-4 py-2.5">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[10px] font-medium text-slate-500 truncate">
              <span className="font-semibold text-slate-400">{reportCount}</span>{" "}
              {reportCount === 1 ? "report" : "reports"}
            </span>
            {employee.leadCount !== undefined ? (
              <span className="text-[10px] font-medium text-slate-500 truncate">
                <span className="font-semibold text-blue-400">{employee.leadCount}</span> leads
              </span>
            ) : null}
          </div>
          <button
            type="button"
            {...listeners}
            {...attributes}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[10px] font-medium text-slate-400 transition hover:border-blue-500/30 hover:text-blue-300 active:cursor-grabbing"
            aria-label="Drag to reassign manager"
          >
            <GripVertical className="h-3 w-3" />
            Move
          </button>
        </footer>

        {selected ? (
          <p className="border-t border-blue-500/20 bg-blue-500/10 py-1.5 text-center text-[10px] font-semibold text-blue-300">
            Click to open profile
          </p>
        ) : null}
      </article>
    </div>
  );
}

function ConnectorDown({ childCount }: { childCount: number }) {
  if (childCount === 0) return null;
  const lineWidth = Math.max(0, (childCount - 1) * (ORG_CARD_WIDTH + 40));

  return (
    <div className="flex w-full flex-col items-center" aria-hidden>
      <div className="h-9 w-px bg-gradient-to-b from-blue-400/50 to-slate-500/30" />
      {childCount > 1 ? (
        <div
          className="h-px bg-gradient-to-r from-transparent via-slate-400/50 to-transparent"
          style={{ width: lineWidth + ORG_CARD_WIDTH }}
        />
      ) : null}
    </div>
  );
}

function OrgTreeNode({
  employee,
  employees,
  selectedId,
  dropTargetId,
  draggingId,
  onSelect,
  onToggleStar,
}: {
  employee: HrmEmployee;
  employees: HrmEmployee[];
  selectedId: string | null;
  dropTargetId: string | null;
  draggingId: string | null;
  onSelect: (id: string) => void;
  onToggleStar: (id: string) => void;
}) {
  const children = employeesByManager(employees, employee.id);

  return (
    <div className="flex flex-col items-center">
      <OrgChartCard
        employee={employee}
        employees={employees}
        selected={selectedId === employee.id}
        isDropTarget={dropTargetId === employee.id}
        isDragging={draggingId === employee.id}
        onSelect={() => onSelect(employee.id)}
        onToggleStar={() => onToggleStar(employee.id)}
      />

      {children.length > 0 ? (
        <>
          <ConnectorDown childCount={children.length} />
          <div className="flex items-start justify-center gap-10">
            {children.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="h-9 w-px bg-slate-500/40" aria-hidden />
                <OrgTreeNode
                  employee={child}
                  employees={employees}
                  selectedId={selectedId}
                  dropTargetId={dropTargetId}
                  draggingId={draggingId}
                  onSelect={onSelect}
                  onToggleStar={onToggleStar}
                />
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function OrganizationChart({
  employees,
  onEmployeesChange,
  selectedId,
  onSelect,
  onReassignManager,
}: ChartProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [scale, setScale] = useState(0.9);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const roots = useMemo(() => employeesByManager(employees, null), [employees]);
  const { canvasWidth, canvasHeight } = useMemo(
    () => measureOrgTree(employees),
    [employees],
  );

  const scaledW = canvasWidth * scale;
  const scaledH = canvasHeight * scale;

  const draggingEmployee = draggingId
    ? employees.find((e) => e.id === draggingId)
    : null;

  const handleDragEnd = async (event: DragEndEvent) => {
    setDraggingId(null);
    setDropTargetId(null);
    const draggedId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : null;
    if (!overId?.startsWith("drop-")) return;

    const newManagerId = overId.replace("drop-", "");
    if (draggedId === newManagerId) return;
    if (wouldCreateCycle(employees, draggedId, newManagerId)) return;

    const previous = employees;
    const optimistic = employees.map((e) =>
      e.id === draggedId ? { ...e, managerId: newManagerId } : e,
    );
    onEmployeesChange(optimistic);
    onSelect(draggedId);

    if (onReassignManager) {
      try {
        await onReassignManager(draggedId, newManagerId);
      } catch {
        onEmployeesChange(previous);
      }
    }
  };

  const toggleStar = useCallback(
    (id: string) => {
      onEmployeesChange(
        employees.map((e) => (e.id === id ? { ...e, starred: !e.starred } : e)),
      );
    },
    [employees, onEmployeesChange],
  );

  const fitView = () => setScale(0.85);

  return (
    <div className="flex h-full min-h-[680px] flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-white/[0.06] bg-slate-950/80 px-4 py-3 backdrop-blur-md">
        <p className="mr-auto hidden text-[11px] text-slate-500 sm:block">
          Pan with scroll · click a card for details · drag <strong className="text-slate-400">Move</strong> to reassign
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center rounded-xl border border-white/[0.08] bg-slate-900/90 p-0.5 shadow-sm">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.5, +(s - 0.1).toFixed(2)))}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="min-w-[3.25rem] text-center text-[11px] font-semibold tabular-nums text-slate-400">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(1.25, +(s + 0.1).toFixed(2)))}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={fitView}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              aria-label="Fit view"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        className="relative min-h-0 flex-1 overflow-auto overscroll-contain"
        style={{
          background:
            "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.09) 1px, transparent 0) 0 0 / 22px 22px, linear-gradient(180deg, #070b14 0%, #0f172a 42%, #0a0f1a 100%)",
        }}
        onClick={() => onSelect(null)}
      >
        <DndContext
          sensors={sensors}
          onDragStart={(e: DragStartEvent) => setDraggingId(String(e.active.id))}
          onDragEnd={handleDragEnd}
          onDragOver={(event) => {
            const over = event.over?.id ? String(event.over.id) : null;
            setDropTargetId(over?.replace("drop-", "") ?? null);
          }}
        >
          <div
            style={{ width: scaledW, height: scaledH, minWidth: "100%", minHeight: "100%" }}
            className="relative"
          >
            <div
              className="absolute left-0 top-0 origin-top-left p-16 pb-24"
              style={{
                width: canvasWidth,
                height: canvasHeight,
                transform: `scale(${scale})`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex min-h-full min-w-full flex-col items-center justify-start">
                {roots.map((root) => (
                  <OrgTreeNode
                    key={root.id}
                    employee={root}
                    employees={employees}
                    selectedId={selectedId}
                    dropTargetId={dropTargetId}
                    draggingId={draggingId}
                    onSelect={onSelect}
                    onToggleStar={toggleStar}
                  />
                ))}
              </div>
            </div>
          </div>

          <DragOverlay dropAnimation={null}>
            {draggingEmployee ? (
              <div className="w-[252px] rounded-2xl border-2 border-blue-400 bg-slate-900 p-4 shadow-2xl">
                <p className="text-center text-sm font-bold text-white">{draggingEmployee.name}</p>
                <p className="mt-1 text-center text-xs text-slate-400">Drop onto new manager</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

export function OrgChartToolbar({
  onRefresh,
  onAddRoot,
}: {
  onRefresh: () => void;
  onAddRoot?: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onRefresh}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        <RefreshCw className="h-4 w-4" />
        Reset chart
      </button>
    </div>
  );
}

/** Used by parent when panel is open */
export function addReportToManager(
  employees: HrmEmployee[],
  managerId: string,
): { next: HrmEmployee[]; newId: string } {
  const sub = createSubordinate(employees, managerId);
  return { next: [...employees, sub], newId: sub.id };
}
