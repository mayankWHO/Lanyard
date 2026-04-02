import { ROLE_LABELS, type ProjectRole } from "@/lib/permissions";

const ROLE_STYLES: Record<ProjectRole, string> = {
  OWNER: "bg-amber-50 text-amber-700 ring-amber-500/20",
  ADMIN: "bg-blue-50 text-blue-700 ring-blue-500/20",
  MEMBER: "bg-stone-100 text-stone-600 ring-stone-500/10",
  VIEWER: "bg-zinc-100 text-zinc-500 ring-zinc-500/10",
};

export default function RoleBadge({ role }: { role: ProjectRole }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] ring-1 ${ROLE_STYLES[role]}`}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}
