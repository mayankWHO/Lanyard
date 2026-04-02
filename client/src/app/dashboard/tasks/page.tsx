"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionContext";
import {
  Loader2Icon,
  CheckSquareIcon,
  ListTodoIcon,
  CalendarIcon,
  MoreHorizontalIcon,
  CircleIcon,
  CheckCircle2Icon,
  FolderOpenIcon,
} from "lucide-react";
// Import tasksApi from lib/api assuming it's exported there, or you can implement the API fetch logic explicitly
import { projectsApi } from "@/lib/api";
import { canMutateTasks } from "@/lib/permissions";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high" | "critical";
  due_date?: string;
  project_id: string;
  projectName?: string; // We'll manually populate this
}

interface Project {
  id: string;
  name: string;
  current_user_role?: string;
}

export default function TasksPage() {
  const { user } = useAuth();
  const { projectRoles, seedProjectRoles } = usePermissions();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "todo" | "completed">(
    "all",
  );
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        // First get all projects
        const projRes = await projectsApi.list();
        if (projRes.success && projRes.data) {
          const projs = projRes.data as Project[];
          seedProjectRoles(projs);

          // We don't have a global "get all my tasks" endpoint out of the box in the API client
          // So we'll fetch tasks project by project for the demo
          let allTasks: Task[] = [];
          // Using dynamic import of api to avoid circular dependencies if any
          const { tasksApi } = await import("@/lib/api");

          for (const proj of projs) {
            try {
              const taskRes = await tasksApi.list(proj.id);
              if (taskRes.success && taskRes.data) {
                const projTasks = (taskRes.data as Task[]).map((t) => ({
                  ...t,
                  projectName: proj.name,
                }));
                allTasks = [...allTasks, ...projTasks];
              }
            } catch (e) {
              console.error(`Failed to load tasks for project ${proj.id}`, e);
            }
          }
          setTasks(allTasks);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [seedProjectRoles, user]);

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === "all") return true;
    if (activeTab === "completed") return t.status === "done";
    return t.status !== "done";
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-rose-600 bg-rose-50 border-rose-200";
      case "high":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "medium":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-stone-500 bg-stone-50 border-stone-200";
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">
            My Tasks
          </h1>
          <p className="text-stone-500 mt-1 font-medium">
            Here&apos;s everything assigned to you across all projects.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-stone-200">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === "all" ? "text-stone-900 border-stone-900" : "text-stone-500 border-transparent hover:text-stone-700 hover:border-stone-300"}`}
        >
          All Tasks
        </button>
        <button
          onClick={() => setActiveTab("todo")}
          className={`px-4 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === "todo" ? "text-stone-900 border-stone-900" : "text-stone-500 border-transparent hover:text-stone-700 hover:border-stone-300"}`}
        >
          To Do
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-4 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === "completed" ? "text-stone-900 border-stone-900" : "text-stone-500 border-transparent hover:text-stone-700 hover:border-stone-300"}`}
        >
          Completed
        </button>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-2xl border border-stone-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.01)] overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-stone-400">
            <Loader2Icon className="animate-spin mb-4" size={32} />
            <p className="font-medium text-sm">Gathering your tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-stone-400">
            <ListTodoIcon className="mb-4 text-stone-300" size={48} />
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              No tasks found
            </h3>
            <p className="font-medium text-sm text-center max-w-sm">
              You don&apos;t have any tasks assigned to you right now. Go to a
              project to create one.
            </p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-stone-400">
            <CheckSquareIcon className="mb-4 text-stone-300" size={48} />
            <p className="font-medium text-sm text-center max-w-sm">
              No tasks matching this filter.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredTasks.map((task) => (
              (() => {
                const canEditTask = canMutateTasks(projectRoles[task.project_id]);

                return (
                  <div
                    key={task.id}
                    className="p-4 hover:bg-stone-50/50 transition-colors group flex items-start gap-4 cursor-pointer"
                  >
                <button className="mt-1 text-stone-300 hover:text-emerald-500 transition-colors flex-shrink-0">
                  {task.status === "done" ? (
                    <CheckCircle2Icon className="text-emerald-500" size={20} />
                  ) : (
                    <CircleIcon size={20} />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4
                      className={`text-base font-bold truncate ${task.status === "done" ? "text-stone-400 line-through" : "text-stone-900 group-hover:text-stone-700"}`}
                    >
                      {task.title}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority || "Medium"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium text-stone-500">
                    <span className="flex items-center gap-1.5 bg-stone-100 px-2 py-1 rounded-md">
                      <FolderOpenIcon size={12} />
                      <span className="truncate max-w-[150px]">
                        {task.projectName}
                      </span>
                    </span>
                    {task.due_date && (
                      <span className="flex items-center gap-1.5">
                        <CalendarIcon
                          size={12}
                          className={
                            new Date(task.due_date) < new Date() &&
                            task.status !== "done"
                              ? "text-rose-500"
                              : ""
                          }
                        />
                        <span
                          className={
                            new Date(task.due_date) < new Date() &&
                            task.status !== "done"
                              ? "text-rose-500"
                              : ""
                          }
                        >
                          {new Date(task.due_date).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" },
                          )}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative">
                  {canEditTask && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(
                            activeDropdown === task.id ? null : task.id,
                          );
                        }}
                        className="text-stone-400 hover:text-stone-900 p-2 rounded-lg hover:bg-stone-100 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontalIcon size={18} />
                      </button>
                      {activeDropdown === task.id && (
                    <div
                      className="absolute right-0 top-10 w-40 bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-stone-200 py-1 z-10 animate-in fade-in zoom-in-95 duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setActiveDropdown(null); /* Handle edit */
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 font-medium transition-colors"
                      >
                        Edit Task
                      </button>
                      <button
                        onClick={() => {
                          setActiveDropdown(null); /* Handle Change Status */
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 font-medium transition-colors"
                      >
                        Change Status
                      </button>
                      <div className="h-px bg-stone-100 my-1"></div>
                      <button
                        onClick={() => {
                          setActiveDropdown(null); /* Handle delete */
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                      >
                        Delete Task
                      </button>
                    </div>
                      )}
                    </>
                  )}
                </div>
                  </div>
                );
              })()
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
