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
import { ChevronDown, GripVertical } from "lucide-react";

import {
  HRM_TASK_STATUSES,
  type HrmDailyTask,
} from "@/features/workspace/data/hrm-dashboard-demo";
import { cn } from "@/lib/utils/cn";

const toneBorder: Record<string, string> = {
  amber: "border-t-amber-500",
  sky: "border-t-[#0ea5e9]",
  green: "border-t-emerald-500",
};

type Props = {
  tasks: HrmDailyTask[];
  onChange: (next: HrmDailyTask[]) => void;
};

function TaskCard({ task, isDragging }: { task: HrmDailyTask; isDragging?: boolean }) {
  const visible = task.team.slice(0, 3);
  const extra = task.team.length - visible.length;

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
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{task.name}</p>
          <p className="mt-0.5 text-xs text-slate-500">Assigned by {task.assignedBy}</p>
          <div className="mt-2 flex -space-x-1.5">
            {visible.map((m, i) => (
              <span
                key={`${m.name}-${i}`}
                className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#2277ff] text-[9px] font-bold text-white"
                title={m.name}
              >
                {m.name.slice(0, 2).toUpperCase()}
              </span>
            ))}
          </div>
          {extra > 0 ? (
            <p className="mt-1 text-[10px] text-slate-400">+{extra} more</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SortableTaskCard({ task }: { task: HrmDailyTask }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task", task },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      {...attributes}
      {...listeners}
    >
      <TaskCard task={task} />
    </div>
  );
}

function StatusColumn({
  statusId,
  name,
  tone,
  tasks,
}: {
  statusId: HrmDailyTask["status"];
  name: string;
  tone: string;
  tasks: HrmDailyTask[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: statusId, data: { type: "column", statusId } });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-w-[240px] flex-1 flex-col rounded-2xl border border-slate-200/80 border-t-4 bg-gradient-to-b from-slate-50/50 to-white dark:border-slate-800 dark:from-slate-950/30 dark:to-slate-900",
        toneBorder[tone],
        isOver && "ring-2 ring-[#2277ff]/40",
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
        <h4 className="text-xs font-bold uppercase tracking-wide text-slate-600">{name}</h4>
        <span className="rounded-full bg-[#191970] px-2 py-0.5 text-[10px] font-bold text-white">{tasks.length}</span>
      </div>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-[100px] flex-col gap-2 p-2.5">
          {tasks.length === 0 ? (
            <p className="py-6 text-center text-[11px] text-slate-400">Drop tasks here</p>
          ) : (
            tasks.map((t) => <SortableTaskCard key={t.id} task={t} />)
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function HrmDashboardDailyTasks({ tasks, onChange }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const byStatus = useMemo(() => {
    const map: Record<HrmDailyTask["status"], HrmDailyTask[]> = {
      in_progress: [],
      need_review: [],
      done: [],
    };
    for (const t of tasks) map[t.status].push(t);
    return map;
  }, [tasks]);

  const active = activeId ? tasks.find((t) => t.id === activeId) : null;

  const findStatus = useCallback((id: string) => tasks.find((t) => t.id === id)?.status, [tasks]);

  const moveToStatus = (taskId: string, status: HrmDailyTask["status"]) => {
    onChange(tasks.map((t) => (t.id === taskId ? { ...t, status } : t)));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active: a, over } = event;
    if (!over) return;
    const taskId = String(a.id);
    const overId = String(over.id);
    let target = HRM_TASK_STATUSES.find((s) => s.id === overId)?.id;
    if (!target) target = findStatus(overId);
    const current = findStatus(taskId);
    if (!target || !current || target === current) return;
    moveToStatus(taskId, target);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active: a, over } = event;
    setActiveId(null);
    if (!over) return;
    const taskId = String(a.id);
    const overId = String(over.id);
    let target = HRM_TASK_STATUSES.find((s) => s.id === overId)?.id;
    if (!target) target = findStatus(overId);
    if (target) moveToStatus(taskId, target);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100/80 px-5 py-4 dark:border-slate-800">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">Daily Task</h3>
          <p className="mt-0.5 text-xs text-slate-500">Drag cards between columns to update status</p>
        </div>
        <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50">
          Filters
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </button>
      </div>

      <div className="p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3 overflow-x-auto pb-1">
            {HRM_TASK_STATUSES.map((s) => (
              <StatusColumn
                key={s.id}
                statusId={s.id}
                name={s.name}
                tone={s.tone}
                tasks={byStatus[s.id]}
              />
            ))}
          </div>
          <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
            {active ? <TaskCard task={active} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </section>
  );
}
