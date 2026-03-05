"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { projectsApi } from "@/lib/api";
import { PlusIcon, CheckCircle2Icon, AlertCircleIcon, PlayIcon, FolderOpenIcon, Loader2Icon } from "lucide-react";

interface Project {
    id: string;
    name: string;
    description: string;
    status: string;
    project_members?: any[];
    created_at?: string;
    target_end_date?: string;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);

    useEffect(() => {
        const loadProjects = async () => {
            try {
                const res = await projectsApi.list();
                if (res.success && res.data) {
                    setProjects(res.data as Project[]);
                }
            } catch (err) {
                console.error("Failed to load projects:", err);
            } finally {
                setIsLoadingProjects(false);
            }
        };

        if (user) {
            loadProjects();
        }
    }, [user]);

    if (!user) return null;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ── Header Section ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-stone-200/60">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-stone-900">
                        Welcome back, {(user.user_metadata?.full_name as string)?.split(" ")[0] || "User"}
                    </h1>
                    <p className="text-stone-500 mt-1.5 font-medium">
                        Here's an overview of your workspace today.
                    </p>
                </div>
                <button className="bg-stone-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-stone-800 transition-colors flex items-center gap-2 shadow-sm">
                    <PlusIcon size={16} />
                    Create Project
                </button>
            </div>

            {/* ── Global Metrics ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:border-stone-300 transition-all">
                    <div className="flex items-center justify-between mb-2 z-10 relative">
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Completed</p>
                        <CheckCircle2Icon size={18} className="text-emerald-500" />
                    </div>
                    <div className="z-10 relative">
                        <h3 className="text-4xl font-bold tracking-tight text-stone-900 mb-1">
                            {projects.filter(p => p.status === 'completed').length}
                        </h3>
                        <p className="text-sm font-medium text-emerald-600 flex items-center gap-1.5">
                            <span className="bg-emerald-50 px-1.5 py-0.5 rounded text-xs">Updated</span>
                            <span className="text-stone-400 font-normal">this week</span>
                        </p>
                    </div>
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
                </div>

                <div className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:border-stone-300 transition-all">
                    <div className="flex items-center justify-between mb-2 z-10 relative">
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">In Progress</p>
                        <PlayIcon size={18} className="text-blue-500" />
                    </div>
                    <div className="z-10 relative">
                        <h3 className="text-4xl font-bold tracking-tight text-stone-900 mb-1">
                            {projects.filter(p => p.status === 'active').length}
                        </h3>
                        <p className="text-sm font-medium text-blue-600 flex items-center gap-1.5">
                            <span className="bg-blue-50 px-1.5 py-0.5 rounded text-xs">Active</span>
                            <span className="text-stone-400 font-normal">projects overall</span>
                        </p>
                    </div>
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
                </div>

                <div className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:border-stone-300 hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between mb-2 z-10 relative">
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">At Risk</p>
                        <AlertCircleIcon size={18} className="text-rose-500" />
                    </div>
                    <div className="z-10 relative">
                        <h3 className="text-4xl font-bold tracking-tight text-stone-900 mb-1">0</h3>
                        <p className="text-sm font-medium text-rose-600 flex items-center gap-1.5">
                            <span className="bg-rose-50 px-1.5 py-0.5 rounded text-xs">Requires attention</span>
                        </p>
                    </div>
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors" />
                </div>
            </div>

            {/* ── Active Projects ── */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
                        <FolderOpenIcon size={20} className="text-stone-400" />
                        Active Projects
                    </h2>
                    <button className="text-sm text-stone-500 hover:text-stone-900 font-medium transition-colors cursor-pointer border-b border-transparent hover:border-stone-900 pb-0.5">
                        View all projects →
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {isLoadingProjects ? (
                        <div className="col-span-full py-12 flex items-center justify-center">
                            <Loader2Icon className="animate-spin text-stone-400" size={32} />
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-stone-500 border-2 border-dashed border-stone-200 rounded-2xl">
                            <FolderOpenIcon className="mx-auto mb-3 text-stone-300" size={32} />
                            <p>No active projects found. Create one to get started!</p>
                        </div>
                    ) : (
                        projects.slice(0, 6).map((project) => {
                            const membersCount = project.project_members?.length || 1;
                            const statuses = ['on_track', 'at_risk', 'warning'] as const;
                            const risk = project.status === 'completed' ? 'on_track' : statuses[Math.floor(Math.random() * statuses.length)];
                            const progress = project.status === 'completed' ? 100 : Math.floor(Math.random() * 80) + 10;

                            return (
                                <div
                                    key={project.id}
                                    className="bg-white rounded-2xl p-6 border border-stone-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:border-stone-300 transition-all cursor-pointer group flex flex-col"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">
                                                {project.status}
                                            </p>
                                            <h3 className="text-lg font-bold tracking-tight text-stone-900 group-hover:text-stone-700 transition-colors line-clamp-1">
                                                {project.name}
                                            </h3>
                                        </div>

                                        {risk === "at_risk" && (
                                            <div className="flex h-2 w-2 relative mt-1.5 mr-1">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                            </div>
                                        )}
                                        {risk === "warning" && (
                                            <div className="h-2 w-2 rounded-full bg-amber-400 mt-1.5 mr-1" />
                                        )}
                                        {risk === "on_track" && (
                                            <div className="h-2 w-2 rounded-full bg-emerald-400 mt-1.5 mr-1" />
                                        )}
                                    </div>

                                    <p className="text-sm text-stone-500 mb-8 line-clamp-2 min-h-[40px] leading-relaxed">
                                        {project.description || "No description provided."}
                                    </p>

                                    <div className="mt-auto space-y-5">
                                        {/* Thin, elegant Progress Bar */}
                                        <div>
                                            <div className="flex items-center justify-between text-xs mb-2 font-medium">
                                                <span className="text-stone-400">Progress</span>
                                                <span className="text-stone-900">{progress}%</span>
                                            </div>
                                            <div className="w-full bg-stone-100 rounded-full h-1 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ease-out bg-stone-900`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Footer Metadata */}
                                        <div className="flex items-center justify-between pt-4 border-t border-stone-100/80">
                                            <div className="flex items-center -space-x-1.5">
                                                {[...Array(Math.min(membersCount, 3))].map((_, i) => (
                                                    <div key={i} className="w-6 h-6 rounded-full border border-white flex items-center justify-center text-[9px] font-bold text-stone-600 bg-stone-100 ring-2 ring-transparent group-hover:ring-white transition-all">
                                                        U{i + 1}
                                                    </div>
                                                ))}
                                                {membersCount > 3 && (
                                                    <div className="w-6 h-6 rounded-full border border-white bg-stone-50 flex items-center justify-center text-[9px] font-bold text-stone-500">
                                                        +{membersCount - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs font-medium text-stone-400">
                                                {project.target_end_date ? `Due ${new Date(project.target_end_date).toLocaleDateString()}` : "No set date"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
