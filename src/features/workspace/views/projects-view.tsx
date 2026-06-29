"use client";

import { useEffect, useState, useCallback } from "react";
import { Briefcase, Plus, Folder, Calendar, User, Clock, CheckCircle, RefreshCw, Trash2, ArrowLeft } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";

type Project = {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  startDate?: string;
  dueDate?: string;
  completion: number;
  budget?: number;
};

type Task = {
  id: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "BLOCKED";
  priority: string;
  dueDate?: string;
  assignedTo?: string;
};

export function ProjectsView() {
  const companyId = useHrCompanyId();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [kanban, setKanban] = useState<Record<string, Task[]>>({
    TODO: [],
    IN_PROGRESS: [],
    IN_REVIEW: [],
    DONE: [],
    BLOCKED: [],
  });
  
  const [loading, setLoading] = useState(true);
  const [projectModal, setProjectModal] = useState(false);
  const [taskModal, setTaskModal] = useState(false);

  // Form states
  const [newProject, setNewProject] = useState({ name: "", description: "", priority: "MEDIUM", status: "PLANNING", budget: "" });
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "MEDIUM", status: "TODO" });

  const loadProjects = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/projects/${companyId}`);
      if (res.data?.success) {
        setProjects(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const loadProjectKanban = useCallback(async (projectId: string) => {
    try {
      const res = await apiClient.get(`/projects/${companyId}/${projectId}`);
      if (res.data?.success) {
        const board = res.data.data.kanban || {
          TODO: [],
          IN_PROGRESS: [],
          IN_REVIEW: [],
          DONE: [],
          BLOCKED: [],
        };
        setKanban(board);
      }
    } catch (err) {
      console.error(err);
    }
  }, [companyId]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    loadProjectKanban(project.id);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post(`/projects/${companyId}`, {
        ...newProject,
        budget: newProject.budget ? parseFloat(newProject.budget) : undefined
      });
      setProjectModal(false);
      setNewProject({ name: "", description: "", priority: "MEDIUM", status: "PLANNING", budget: "" });
      loadProjects();
    } catch (err) {
      alert("Failed to create project");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      await apiClient.post(`/projects/${companyId}/${selectedProject.id}/tasks`, newTask);
      setTaskModal(false);
      setNewTask({ title: "", description: "", priority: "MEDIUM", status: "TODO" });
      loadProjectKanban(selectedProject.id);
    } catch (err) {
      alert("Failed to create task");
    }
  };

  const handleMoveTask = async (task: Task, newStatus: string) => {
    if (!selectedProject) return;
    try {
      await apiClient.patch(`/projects/${companyId}/${selectedProject.id}/tasks/${task.id}`, {
        status: newStatus
      });
      loadProjectKanban(selectedProject.id);
    } catch (err) {
      alert("Failed to move task");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {selectedProject ? `Project: ${selectedProject.name}` : "Projects & Tasks Workspace"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {selectedProject ? selectedProject.description : "Manage team workflows, prioritize tasks, and track project deadlines."}
          </p>
        </div>
        <div className="flex gap-2">
          {selectedProject ? (
            <>
              <button onClick={() => setSelectedProject(null)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                <ArrowLeft className="h-4 w-4" /> All Projects
              </button>
              <button onClick={() => setTaskModal(true)} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                Create Task
              </button>
            </>
          ) : (
            <button onClick={() => setProjectModal(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              <Plus className="h-4 w-4" /> New Project
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : !selectedProject ? (
        // Grid of Projects
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
              <Briefcase className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No projects found</h3>
              <p className="mt-2 text-sm text-slate-500">Start by creating a new project with milestones and columns.</p>
            </div>
          ) : (
            projects.map((proj) => (
              <div key={proj.id} onClick={() => handleSelectProject(proj)} className="cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition-all">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-slate-950 dark:text-white hover:text-indigo-600">{proj.name}</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${proj.priority === "HIGH" ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-800"}`}>
                    {proj.priority}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500 line-clamp-2">{proj.description}</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Task Completion</span>
                    <span className="font-bold">{proj.completion || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full transition-all" style={{ width: `${proj.completion || 0}%` }} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        // Kanban board view
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
          {Object.keys(kanban).map((colName) => (
            <div key={colName} className="rounded-xl border border-slate-200/60 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 mb-4 flex items-center justify-between">
                <span>{colName}</span>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                  {kanban[colName]?.length || 0}
                </span>
              </h3>
              <div className="space-y-3 min-h-[300px]">
                {kanban[colName]?.map((task: Task) => (
                  <div key={task.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{task.title}</h4>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">{task.description}</p>
                    
                    <div className="mt-4 flex flex-wrap gap-2 justify-between items-center">
                      <span className={`text-[10px] rounded px-1.5 py-0.5 font-bold ${task.priority === "HIGH" ? "bg-red-50 text-red-700" : "bg-slate-50 text-slate-600"}`}>
                        {task.priority}
                      </span>
                      {colName !== "DONE" && (
                        <select onChange={(e) => handleMoveTask(task, e.target.value)} defaultValue={colName} className="text-xs bg-slate-50 border border-slate-200 rounded p-1 dark:bg-slate-800 dark:border-slate-800">
                          <option value="TODO">TODO</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="IN_REVIEW">IN REVIEW</option>
                          <option value="DONE">DONE</option>
                          <option value="BLOCKED">BLOCKED</option>
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Creation modal */}
      {projectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreateProject} className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create Project</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500">Project Name</label>
                <input required type="text" value={newProject.name} onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500">Description</label>
                <input type="text" value={newProject.description} onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500">Priority</label>
                <select value={newProject.priority} onChange={e => setNewProject(p => ({ ...p, priority: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800 dark:bg-slate-800">
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500">Budget (INR)</label>
                <input type="number" value={newProject.budget} onChange={e => setNewProject(p => ({ ...p, budget: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setProjectModal(false)} className="rounded-lg px-4 py-2 text-sm border border-slate-200 hover:bg-slate-50">Cancel</button>
              <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Save Project</button>
            </div>
          </form>
        </div>
      )}

      {/* Task Creation modal */}
      {taskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreateTask} className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add Task</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500">Task Title</label>
                <input required type="text" value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500">Description</label>
                <input type="text" value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500">Priority</label>
                <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-800 dark:bg-slate-800">
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setTaskModal(false)} className="rounded-lg px-4 py-2 text-sm border border-slate-200 hover:bg-slate-50">Cancel</button>
              <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Add Task</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
