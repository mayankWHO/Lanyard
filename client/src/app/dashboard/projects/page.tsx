"use client";

import { useEffect, useState } from "react";
import { projectsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { PlusIcon, SearchIcon, FolderOpenIcon, MoreHorizontalIcon, Loader2Icon } from "lucide-react";

interface Project {
    id: string;
    name: string;
    description: string;
    status: string;
    created_at: string;
    project_members?: any[];
}

export default function ProjectsPage() {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Create Project State
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDesc, setNewProjectDesc] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await projectsApi.list();
                if (res.success && res.data) {
                    setProjects(res.data as Project[]);
                }
            } catch (err) {
                console.error("Failed to load projects", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) fetchProjects();
    }, [user]);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;

        setIsCreating(true);
        try {
            const res = await projectsApi.create({
                name: newProjectName,
                description: newProjectDesc
            });

            if (res.success && res.data) {
                setProjects([res.data as Project, ...projects]);
                setIsCreateModalOpen(false);
                setNewProjectName("");
                setNewProjectDesc("");
            }
        } catch (err) {
            console.error("Failed to create project", err);
        } finally {
            setIsCreating(false);
        }
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-stone-900">Projects</h1>
                    <p className="text-stone-500 mt-1 font-medium">Manage all your active and upcoming workspaces.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border border-stone-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 w-64 shadow-sm transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-stone-800 transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
                    >
                        <PlusIcon size={16} />
                        New Project
                    </button>
                </div>
            </div>

            {/* Content area */}
            <div className="bg-white rounded-2xl border border-stone-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.01)] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-stone-100 bg-stone-50/50">
                            <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-stone-400">Project Name</th>
                            <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-stone-400">Status</th>
                            <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-stone-400">Members</th>
                            <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-stone-400">Created</th>
                            <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-stone-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center">
                                    <Loader2Icon className="animate-spin text-stone-400 mx-auto" size={24} />
                                </td>
                            </tr>
                        ) : filteredProjects.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-16 text-center text-stone-500">
                                    <FolderOpenIcon className="mx-auto mb-3 text-stone-300" size={32} />
                                    <p className="font-medium text-stone-600">No projects found</p>
                                    <p className="text-sm mt-1">Get started by creating a new project.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredProjects.map((project) => (
                                <tr key={project.id} className="hover:bg-stone-50/50 transition-colors group cursor-pointer">
                                    <td className="py-4 px-6">
                                        <div className="font-bold text-stone-900 group-hover:text-stone-700 transition-colors">{project.name}</div>
                                        <div className="text-sm text-stone-500 line-clamp-1 mt-0.5 max-w-sm">{project.description || 'No description'}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${project.status === 'active' ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-500/20' :
                                                project.status === 'completed' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20' :
                                                    'bg-stone-100 text-stone-600 ring-1 ring-stone-500/20'
                                            }`}>
                                            {project.status || 'Active'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center -space-x-1.5">
                                            {[...Array(Math.min(project.project_members?.length || 1, 3))].map((_, i) => (
                                                <div key={i} className="w-7 h-7 rounded-full border border-white flex items-center justify-center text-[10px] font-bold text-stone-600 bg-stone-100">
                                                    U{i + 1}
                                                </div>
                                            ))}
                                            {(project.project_members?.length || 1) > 3 && (
                                                <div className="w-7 h-7 rounded-full border border-white bg-stone-50 flex items-center justify-center text-[9px] font-bold text-stone-500">
                                                    +{(project.project_members?.length || 1) - 3}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-stone-500 font-medium whitespace-nowrap">
                                        {new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button className="text-stone-400 hover:text-stone-900 p-2 rounded-lg hover:bg-stone-100 transition-all opacity-0 group-hover:opacity-100">
                                            <MoreHorizontalIcon size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Project Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-stone-100">
                            <h2 className="text-xl font-bold tracking-tight text-stone-900">Create New Project</h2>
                            <p className="text-sm text-stone-500 mt-1">Set up a new workspace for your team.</p>
                        </div>

                        <form onSubmit={handleCreateProject} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Project Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    className="w-full bg-white border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition-all"
                                    placeholder="e.g. Website Redesign"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Description (Optional)</label>
                                <textarea
                                    value={newProjectDesc}
                                    onChange={(e) => setNewProjectDesc(e.target.value)}
                                    rows={3}
                                    className="w-full bg-white border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition-all resize-none"
                                    placeholder="What is this project about?"
                                />
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => !isCreating && setIsCreateModalOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating || !newProjectName.trim()}
                                    className="bg-stone-900 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-stone-800 transition-colors flex items-center gap-2"
                                >
                                    {isCreating && <Loader2Icon size={16} className="animate-spin" />}
                                    Create Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
