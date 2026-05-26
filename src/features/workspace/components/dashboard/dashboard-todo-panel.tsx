"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, ListTodo } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export type DashboardTodo = {
  id: string;
  title: string;
  module: string;
  priority: "high" | "medium" | "low";
  done: boolean;
};

type DashboardTodoPanelProps = {
  todos: DashboardTodo[];
  workspaceSlug: string;
};

export function DashboardTodoPanel({ todos: initial, workspaceSlug }: DashboardTodoPanelProps) {
  const [todos, setTodos] = useState(initial);

  const toggle = (id: string) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const open = todos.filter((t) => !t.done).length;

  return (
    <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50">
            <ListTodo className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Priority tasks</h3>
            <p className="text-xs text-slate-500">{open} open · synced with your modules</p>
          </div>
        </div>
        <Link
          href={`/${workspaceSlug}/team`}
          className="text-xs font-bold text-blue-600 hover:underline"
        >
          View all
        </Link>
      </div>

      <ul className="space-y-3">
        {todos.map((todo) => (
          <li key={todo.id}>
            <button
              type="button"
              onClick={() => toggle(todo.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition",
                todo.done
                  ? "border-slate-100 bg-slate-50/80 opacity-70 dark:border-slate-800"
                  : "border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/30 dark:border-slate-800 dark:hover:border-blue-900",
              )}
            >
              {todo.done ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
              ) : (
                <Circle className="mt-0.5 h-5 w-5 shrink-0 text-slate-300" />
              )}
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block text-sm font-semibold text-slate-800 dark:text-slate-200",
                    todo.done && "line-through",
                  )}
                >
                  {todo.title}
                </span>
                <span className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold dark:bg-slate-800">
                    {todo.module}
                  </span>
                  <span
                    className={cn(
                      "font-bold uppercase tracking-wide",
                      todo.priority === "high" && "text-rose-600",
                      todo.priority === "medium" && "text-amber-600",
                      todo.priority === "low" && "text-slate-400",
                    )}
                  >
                    {todo.priority}
                  </span>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
