"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon, BrainCircuitIcon, Loader2Icon, SaveIcon, SparklesIcon, UserPlusIcon } from "lucide-react";
import RoleBadge from "@/components/RoleBadge";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionContext";
import { aiApi, notesApi, projectsApi, tasksApi } from "@/lib/api";
import {
  PROJECT_ROLES,
  type ProjectRole,
  canConfigureProjectAi,
  canManageMembers,
  canManageProjectSettings,
  canMutateTasks,
  canUseProjectAi,
  normalizeRole,
} from "@/lib/permissions";

type Tab = "overview" | "tasks" | "notes" | "members";
type TaskStatus = "todo" | "in_progress" | "done";
type Priority = "low" | "medium" | "high" | "critical";
type Project = { id: string; name: string; description: string; status: string; target_end_date?: string | null; current_user_role?: string; ai_system_prompt?: string | null };
type Member = { id: string; user_id: string; role: ProjectRole; full_name?: string | null };
type Subtask = { id: string; title: string; is_completed: boolean };
type Task = { id: string; title: string; description?: string | null; status: TaskStatus; priority?: Priority | null; goal?: string | null; expected_outcome?: string | null; definition_of_done?: string | null; due_date?: string | null; is_critical?: boolean; subtasks?: Subtask[] };
type Note = { id: string; title: string; content: string; is_pinned?: boolean; is_decision?: boolean; ai_summary?: string | null; ai_action_items?: string[]; ai_decisions_extracted?: string[]; created_at: string };

const emptyTask = { title: "", description: "", priority: "medium" as Priority, due_date: "", goal: "", expected_outcome: "", definition_of_done: "", is_critical: false };
const emptyNote = { title: "", content: "", is_pinned: false, is_decision: false };

export default function ProjectWorkspacePage() {
  const { user } = useAuth();
  const { setProjectRole } = usePermissions();
  const params = useParams<{ projectId: string }>();
  const projectId = params?.projectId as string;
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [noteForm, setNoteForm] = useState(emptyNote);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [editNoteId, setEditNoteId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<ProjectRole>(PROJECT_ROLES.MEMBER);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ summary: string; recommendations: string[] } | null>(null);
  const [risk, setRisk] = useState<{ riskScore: number; riskLevel: string; reasons: string[]; actions: string[] } | null>(null);
  const [workload, setWorkload] = useState<{ bottlenecks: string[]; recommendations: string[] } | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setBusy("load");
      try {
        const [p, t, n, m, c] = await Promise.all([
          projectsApi.get(projectId),
          tasksApi.list(projectId),
          notesApi.list(projectId),
          projectsApi.listMembers(projectId),
          aiApi.getProjectConfig(projectId),
        ]);
        if (!p.success || !p.data) return router.push("/dashboard/projects");
        const nextProject = { ...(p.data as Project), ai_system_prompt: c.data?.ai_system_prompt ?? null };
        setProject(nextProject);
        setTasks((t.data as Task[] | undefined) ?? []);
        setNotes((n.data as Note[] | undefined) ?? []);
        setMembers((m.data as Member[] | undefined) ?? []);
        setProjectRole(projectId, nextProject.current_user_role);
      } catch {
        router.push("/dashboard/projects");
      } finally {
        setBusy(null);
      }
    };
    void load();
  }, [projectId, router, setProjectRole, user]);

  const role = normalizeRole(project?.current_user_role);
  const canEdit = canMutateTasks(role);
  const canInvite = canManageMembers(role);
  const canSettings = canManageProjectSettings(role);
  const canAi = canUseProjectAi(role);
  const canAiConfig = canConfigureProjectAi(role);
  const metrics = useMemo(() => {
    const done = tasks.filter((t) => t.status === "done").length;
    const overdue = tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "done").length;
    return { done, overdue, completion: tasks.length ? Math.round((done / tasks.length) * 100) : 0 };
  }, [tasks]);

  const flash = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2500);
  };

  const saveTask = async () => {
    if (!project || !canEdit || !taskForm.title.trim()) return;
    setBusy("task");
    const payload = { ...taskForm, due_date: taskForm.due_date || null };
    const res = editTaskId ? await tasksApi.update(project.id, editTaskId, payload) : await tasksApi.create(project.id, payload);
    if (res.success && res.data) {
      const next = { ...(res.data as Task), subtasks: editTaskId ? tasks.find((t) => t.id === editTaskId)?.subtasks ?? [] : [] };
      setTasks((current) => (editTaskId ? current.map((t) => (t.id === editTaskId ? next : t)) : [next, ...current]));
      setTaskForm(emptyTask);
      setEditTaskId(null);
      flash(editTaskId ? "Task updated." : "Task created.");
    }
    setBusy(null);
  };

  const saveNote = async () => {
    if (!project || !canEdit || !noteForm.title.trim() || !noteForm.content.trim()) return;
    setBusy("note");
    const res = editNoteId ? await notesApi.update(project.id, editNoteId, noteForm) : await notesApi.create(project.id, noteForm);
    if (res.success && res.data) {
      const next = res.data as Note;
      setNotes((current) => (editNoteId ? current.map((n) => (n.id === editNoteId ? next : n)) : [next, ...current]));
      setNoteForm(emptyNote);
      setEditNoteId(null);
      flash(editNoteId ? "Note updated." : "Note created.");
    }
    setBusy(null);
  };

  const runTaskAi = async () => {
    if (!project || !canAi || !taskForm.title.trim()) return;
    setBusy("task-ai");
    const res = await aiApi.taskBreakdown({ ...taskForm, projectName: project.name, projectId: project.id });
    if (res.success && res.data) {
      const data = res.data;
      setTaskForm((current) => ({ ...current, goal: data.goal, expected_outcome: data.expected_outcome, definition_of_done: data.definition_of_done, description: current.description || data.subtasks.join("\n") }));
      flash("Task draft enriched with Gemini.");
    }
    setBusy(null);
  };

  const runSummary = async () => {
    if (!project || !canAi) return;
    setBusy("summary");
    const res = await aiApi.projectSummary(project.id);
    if (res.success && res.data) setSummary({ summary: res.data.summary, recommendations: res.data.recommendations });
    setBusy(null);
  };

  const runRisk = async () => {
    if (!project || role === PROJECT_ROLES.VIEWER) return;
    setBusy("risk");
    const res = await aiApi.projectRisk(project.id);
    if (res.success && res.data) setRisk(res.data);
    setBusy(null);
  };

  const runWorkload = async () => {
    if (!project || role === PROJECT_ROLES.VIEWER) return;
    setBusy("workload");
    const res = await aiApi.projectWorkload(project.id);
    if (res.success && res.data) setWorkload({ bottlenecks: res.data.bottlenecks, recommendations: res.data.recommendations });
    setBusy(null);
  };

  if (busy === "load") {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2Icon className="animate-spin text-stone-400" size={32} /></div>;
  }
  if (!project) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/dashboard/projects" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900"><ArrowLeftIcon size={14} /> Back to Projects</Link>
          <div className="flex items-center gap-3"><h1 className="text-3xl font-bold tracking-tight text-stone-900">{project.name}</h1><RoleBadge role={role} /></div>
          <p className="mt-2 max-w-3xl text-sm text-stone-500">{project.description || "Use this workspace to track execution, decisions, and AI insight."}</p>
        </div>
        {message && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">{message}</div>}
      </div>

      <div className="flex items-center gap-6 border-b border-stone-200">
        {(["overview", "tasks", "notes", "members"] as Tab[]).map((item) => (
          <button key={item} onClick={() => setTab(item)} className={`border-b-2 pb-3 text-sm font-semibold ${tab === item ? "border-stone-900 text-stone-900" : "border-transparent text-stone-500 hover:border-stone-300 hover:text-stone-700"}`}>{item[0].toUpperCase() + item.slice(1)}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="grid gap-4 md:grid-cols-4">
              <Card title="Completion" value={`${metrics.completion}%`} text={`${metrics.done}/${tasks.length} tasks done`} />
              <Card title="Overdue" value={`${metrics.overdue}`} text="Tasks needing follow-up" />
              <Card title="Notes" value={`${notes.length}`} text={`${notes.filter((n) => n.is_decision).length} decisions logged`} />
              <Card title="Team" value={`${members.length}`} text="Project members" />
            </div>
            <Panel title="Execution Summary" action={canAi ? <button onClick={() => void runSummary()} className="text-sm font-semibold text-stone-600 hover:text-stone-900">{busy === "summary" ? "Generating..." : "Refresh"}</button> : null}>
              {summary ? <><p className="rounded-xl bg-stone-50 px-4 py-4 text-sm leading-relaxed text-stone-600">{summary.summary}</p><Info title="Recommendations" items={summary.recommendations} /></> : <Empty text="Generate the AI summary to get a project-level execution snapshot." />}
            </Panel>
            <div className="grid gap-6 md:grid-cols-2">
              <Panel title="Risk" action={role !== PROJECT_ROLES.VIEWER ? <button onClick={() => void runRisk()} className="text-sm font-semibold text-stone-600 hover:text-stone-900">{busy === "risk" ? "Refreshing..." : "Refresh"}</button> : null}>
                {risk ? <><p className="text-3xl font-bold text-stone-900">{risk.riskScore}</p><p className="text-sm font-semibold capitalize text-stone-600">{risk.riskLevel} risk</p><Info title="Reasons" items={risk.reasons} /><Info title="Actions" items={risk.actions} /></> : <Empty text="Run risk analysis to score execution health." />}
              </Panel>
              <Panel title="Workload" action={role !== PROJECT_ROLES.VIEWER ? <button onClick={() => void runWorkload()} className="text-sm font-semibold text-stone-600 hover:text-stone-900">{busy === "workload" ? "Analyzing..." : "Analyze"}</button> : null}>
                {workload ? <><Info title="Bottlenecks" items={workload.bottlenecks} /><Info title="Recommendations" items={workload.recommendations} /></> : <Empty text="Analyze workload to spot imbalance and bottlenecks." />}
              </Panel>
            </div>
          </div>
          <div className="space-y-6">
            <Panel title="Pinned Notes">
              {notes.filter((n) => n.is_pinned).slice(0, 3).map((note) => <div key={note.id} className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3"><p className="text-sm font-semibold text-stone-900">{note.title}</p><p className="mt-1 line-clamp-3 text-xs text-stone-500">{note.content}</p></div>)}
              {notes.filter((n) => n.is_pinned).length === 0 && <Empty text="Pin important notes to surface them here." />}
            </Panel>
            <Panel title="Project Settings">
              <div className="space-y-3">
                <Field label="Name"><input value={project.name} onChange={(e) => setProject((current) => current ? { ...current, name: e.target.value } : current)} disabled={!canSettings} className="input-base" /></Field>
                <Field label="Description"><textarea value={project.description || ""} onChange={(e) => setProject((current) => current ? { ...current, description: e.target.value } : current)} disabled={!canSettings} rows={3} className="input-base resize-none" /></Field>
                <Field label="AI System Prompt"><textarea value={project.ai_system_prompt || ""} onChange={(e) => setProject((current) => current ? { ...current, ai_system_prompt: e.target.value } : current)} disabled={!canAiConfig} rows={5} className="input-base resize-none" /></Field>
                {canSettings ? <button onClick={async () => { setBusy("settings"); await projectsApi.update(project.id, { name: project.name, description: project.description, status: project.status, target_end_date: project.target_end_date || null }); if (canAiConfig) await aiApi.updateProjectConfig(project.id, { ai_system_prompt: project.ai_system_prompt || "" }); setBusy(null); flash("Project settings saved."); }} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800">{busy === "settings" ? <Loader2Icon size={16} className="animate-spin" /> : <SaveIcon size={16} />} Save Settings</button> : <Empty text="Only admins and owners can change project settings or AI configuration." />}
              </div>
            </Panel>
          </div>
        </div>
      )}

      {tab === "tasks" && (
        <div className="space-y-6">
          <Panel title={editTaskId ? "Edit Task" : "Create Task"} action={canAi ? <button onClick={() => void runTaskAi()} disabled={!taskForm.title.trim()} className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-700 hover:border-stone-300 hover:bg-stone-100 disabled:opacity-60">{busy === "task-ai" ? <Loader2Icon size={16} className="animate-spin" /> : <SparklesIcon size={16} />} AI Assist</button> : null}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Title"><input value={taskForm.title} onChange={(e) => setTaskForm((c) => ({ ...c, title: e.target.value }))} disabled={!canEdit} className="input-base" /></Field>
              <Field label="Priority"><select value={taskForm.priority} onChange={(e) => setTaskForm((c) => ({ ...c, priority: e.target.value as Priority }))} disabled={!canEdit} className="input-base"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></Field>
              <Field label="Description"><textarea value={taskForm.description} onChange={(e) => setTaskForm((c) => ({ ...c, description: e.target.value }))} disabled={!canEdit} rows={3} className="input-base resize-none" /></Field>
              <Field label="Goal"><textarea value={taskForm.goal} onChange={(e) => setTaskForm((c) => ({ ...c, goal: e.target.value }))} disabled={!canEdit} rows={3} className="input-base resize-none" /></Field>
              <Field label="Expected Outcome"><textarea value={taskForm.expected_outcome} onChange={(e) => setTaskForm((c) => ({ ...c, expected_outcome: e.target.value }))} disabled={!canEdit} rows={3} className="input-base resize-none" /></Field>
              <Field label="Definition of Done"><textarea value={taskForm.definition_of_done} onChange={(e) => setTaskForm((c) => ({ ...c, definition_of_done: e.target.value }))} disabled={!canEdit} rows={3} className="input-base resize-none" /></Field>
            </div>
            {canEdit ? <div className="mt-4 flex items-center gap-3"><button onClick={() => void saveTask()} className="rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800">{busy === "task" ? "Saving..." : editTaskId ? "Save Task" : "Create Task"}</button>{editTaskId && <button onClick={() => { setTaskForm(emptyTask); setEditTaskId(null); }} className="rounded-lg border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:border-stone-300 hover:bg-stone-50">Cancel</button>}</div> : <Empty text="Viewers can review tasks but cannot create or edit them." />}
          </Panel>
          <div className="grid gap-4 xl:grid-cols-3">
            {(["todo", "in_progress", "done"] as TaskStatus[]).map((status) => <Panel key={status} title={status.replace("_", " ")}>{tasks.filter((t) => t.status === status).map((task) => <div key={task.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-stone-900">{task.title}</p><p className="mt-1 text-xs text-stone-500">{task.description || "No description yet."}</p></div><span className="rounded-md bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-stone-500 ring-1 ring-stone-200">{task.priority || "medium"}</span></div><div className="mt-4 flex flex-wrap gap-2">{canEdit && <select value={task.status} onChange={async (e) => { const res = await tasksApi.update(project.id, task.id, { status: e.target.value }); if (res.success && res.data) setTasks((current) => current.map((item) => item.id === task.id ? { ...(res.data as Task), subtasks: item.subtasks ?? [] } : item)); }} className="input-base max-w-[150px]"><option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="done">Done</option></select>}<button onClick={() => { setEditTaskId(task.id); setTaskForm({ title: task.title, description: task.description || "", priority: task.priority || "medium", due_date: task.due_date || "", goal: task.goal || "", expected_outcome: task.expected_outcome || "", definition_of_done: task.definition_of_done || "", is_critical: Boolean(task.is_critical) }); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:border-stone-300 hover:bg-stone-50">Edit</button>{canEdit && <button onClick={async () => { const res = await tasksApi.delete(project.id, task.id); if (res.success) setTasks((current) => current.filter((item) => item.id !== task.id)); }} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100">Delete</button>}</div></div>) }{tasks.filter((t) => t.status === status).length === 0 && <Empty text="No tasks here yet." />}</Panel>)}
          </div>
        </div>
      )}

      {tab === "notes" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Panel title={editNoteId ? "Edit Note" : "Create Note"} action={canAi ? <button onClick={async () => { if (!notes.length) return; setBusy("decisions"); const res = await aiApi.extractDecisions({ notes: notes.slice(0, 12).map((note) => ({ title: note.title, content: note.content })) }); if (res.success) flash(`${res.data?.decisions.length || 0} decision signals extracted.`); setBusy(null); }} className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-700 hover:border-stone-300 hover:bg-stone-100"><BrainCircuitIcon size={16} /> Extract Decisions</button> : null}>
            <div className="space-y-4">
              <Field label="Title"><input value={noteForm.title} onChange={(e) => setNoteForm((c) => ({ ...c, title: e.target.value }))} disabled={!canEdit} className="input-base" /></Field>
              <Field label="Content"><textarea value={noteForm.content} onChange={(e) => setNoteForm((c) => ({ ...c, content: e.target.value }))} disabled={!canEdit} rows={10} className="input-base resize-none" /></Field>
              <label className="flex items-center gap-2 text-sm font-medium text-stone-600"><input type="checkbox" checked={noteForm.is_pinned} onChange={(e) => setNoteForm((c) => ({ ...c, is_pinned: e.target.checked }))} disabled={!canEdit} /> Pin note</label>
              <label className="flex items-center gap-2 text-sm font-medium text-stone-600"><input type="checkbox" checked={noteForm.is_decision} onChange={(e) => setNoteForm((c) => ({ ...c, is_decision: e.target.checked }))} disabled={!canEdit} /> Mark as decision</label>
              {canEdit ? <div className="flex items-center gap-3"><button onClick={() => void saveNote()} className="rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800">{busy === "note" ? "Saving..." : editNoteId ? "Save Note" : "Create Note"}</button>{editNoteId && <button onClick={() => { setNoteForm(emptyNote); setEditNoteId(null); }} className="rounded-lg border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:border-stone-300 hover:bg-stone-50">Cancel</button>}</div> : <Empty text="Viewers can read notes but cannot create or edit them." />}
            </div>
          </Panel>
          <div className="space-y-4">
            {notes.map((note) => <Panel key={note.id} title={note.title} action={<div className="flex items-center gap-2">{canAi && <button onClick={async () => { setBusy(`note-${note.id}`); const res = await aiApi.summarizeNotes({ noteId: note.id, title: note.title, content: note.content }); if (res.success && res.data) { const data = res.data; setNotes((current) => current.map((item) => item.id === note.id ? { ...item, ai_summary: data.summary, ai_action_items: data.actionItems, ai_decisions_extracted: data.decisions } : item)); } setBusy(null); }} className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-700 hover:border-stone-300 hover:bg-stone-100">{busy === `note-${note.id}` ? "Summarizing..." : "Summarize"}</button>}{canEdit && <button onClick={() => { setEditNoteId(note.id); setNoteForm({ title: note.title, content: note.content, is_pinned: Boolean(note.is_pinned), is_decision: Boolean(note.is_decision) }); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:border-stone-300 hover:bg-stone-50">Edit</button>}{canEdit && <button onClick={async () => { const res = await notesApi.delete(project.id, note.id); if (res.success) setNotes((current) => current.filter((item) => item.id !== note.id)); }} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100">Delete</button>}</div>}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-600">{note.content}</p>
              {note.ai_summary && <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3"><p className="text-xs font-bold uppercase tracking-widest text-stone-400">AI Summary</p><p className="mt-2 text-sm text-stone-600">{note.ai_summary}</p><Info title="Action Items" items={note.ai_action_items || []} /><Info title="Decisions" items={note.ai_decisions_extracted || []} /></div>}
            </Panel>)}
            {notes.length === 0 && <Empty text="Create the first note to build a running decision log." />}
          </div>
        </div>
      )}

      {tab === "members" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Panel title="Team">
            <div className="space-y-3">
              {members.map((member) => <div key={member.user_id} className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 md:flex-row md:items-center md:justify-between"><div><p className="text-sm font-semibold text-stone-900">{member.full_name || "Unnamed user"}</p><p className="text-xs text-stone-400">{member.user_id}</p></div><div className="flex items-center gap-2"><RoleBadge role={normalizeRole(member.role)} />{canInvite && <select value={normalizeRole(member.role)} onChange={async (e) => { const nextRole = normalizeRole(e.target.value); const res = await projectsApi.updateMember(project.id, member.user_id, { role: nextRole }); if (res.success) setMembers((current) => current.map((item) => item.user_id === member.user_id ? { ...item, role: nextRole } : item)); }} className="input-base max-w-[130px]"><option value="OWNER">Owner</option><option value="ADMIN">Admin</option><option value="MEMBER">Member</option><option value="VIEWER">Viewer</option></select>}{canInvite && <button onClick={async () => { const res = await projectsApi.removeMember(project.id, member.user_id); if (res.success) setMembers((current) => current.filter((item) => item.user_id !== member.user_id)); }} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100">Remove</button>}</div></div>)}
            </div>
          </Panel>
          <div className="space-y-6">
            <Panel title="Invite Member">
              {canInvite ? <div className="space-y-4"><Field label="Email"><input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="input-base" placeholder="teammate@company.com" /></Field><Field label="Role"><select value={inviteRole} onChange={(e) => setInviteRole(normalizeRole(e.target.value))} className="input-base"><option value="MEMBER">Member</option><option value="VIEWER">Viewer</option><option value="ADMIN">Admin</option></select></Field><button onClick={async () => { setBusy("invite"); const res = await projectsApi.addMember(project.id, { email: inviteEmail, role: inviteRole }); if (res.success) { const refreshed = await projectsApi.listMembers(project.id); setMembers((refreshed.data as Member[] | undefined) ?? []); setInviteEmail(""); flash("Member added."); } setBusy(null); }} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800">{busy === "invite" ? <Loader2Icon size={16} className="animate-spin" /> : <UserPlusIcon size={16} />} Add Member</button></div> : <Empty text="Only admins and owners can invite or manage members." />}
            </Panel>
            <Panel title="AI Access Rules"><Info title="Rules" items={["Owners and admins can edit the project AI system prompt.", "Members can use AI task and note assistance.", "Viewers stay read-only and cannot trigger Gemini routes."]} /></Panel>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, value, text }: { title: string; value: string; text: string }) {
  return <div className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-widest text-stone-400">{title}</p><p className="mt-3 text-3xl font-bold tracking-tight text-stone-900">{value}</p><p className="mt-1 text-sm text-stone-500">{text}</p></div>;
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <div className="rounded-2xl border border-stone-200/70 bg-white p-6 shadow-sm"><div className="mb-4 flex items-center justify-between gap-3"><h3 className="text-lg font-bold text-stone-900">{title}</h3>{action}</div><div className="space-y-4">{children}</div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-semibold text-stone-700">{label}</span>{children}</label>;
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-stone-200 px-4 py-5 text-center text-sm text-stone-500">{text}</div>;
}

function Info({ title, items }: { title: string; items: string[] }) {
  return <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3"><p className="text-xs font-bold uppercase tracking-widest text-stone-400">{title}</p><div className="mt-2 space-y-2">{items.length ? items.map((item, index) => <p key={`${title}-${index}`} className="text-sm text-stone-600">{item}</p>) : <p className="text-sm text-stone-500">Nothing to show yet.</p>}</div></div>;
}
