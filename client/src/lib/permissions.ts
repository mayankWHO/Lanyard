export const PROJECT_ROLES = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
  VIEWER: "VIEWER",
} as const;

export type ProjectRole = (typeof PROJECT_ROLES)[keyof typeof PROJECT_ROLES];

export const ROLE_LABELS: Record<ProjectRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
  VIEWER: "Viewer",
};

const ROLE_RANK: Record<ProjectRole, number> = {
  OWNER: 4,
  ADMIN: 3,
  MEMBER: 2,
  VIEWER: 1,
};

export function normalizeRole(role?: string | null): ProjectRole {
  switch ((role ?? "").toUpperCase()) {
    case PROJECT_ROLES.OWNER:
      return PROJECT_ROLES.OWNER;
    case PROJECT_ROLES.ADMIN:
    case "PROJECT_ADMIN":
      return PROJECT_ROLES.ADMIN;
    case PROJECT_ROLES.VIEWER:
      return PROJECT_ROLES.VIEWER;
    case PROJECT_ROLES.MEMBER:
    default:
      return PROJECT_ROLES.MEMBER;
  }
}

export function checkPermission(
  userRole?: string | null,
  requiredRole: ProjectRole = PROJECT_ROLES.VIEWER,
) {
  return ROLE_RANK[normalizeRole(userRole)] >= ROLE_RANK[requiredRole];
}

export function canManageProjectSettings(role?: string | null) {
  return checkPermission(role, PROJECT_ROLES.ADMIN);
}

export function canManageMembers(role?: string | null) {
  return checkPermission(role, PROJECT_ROLES.ADMIN);
}

export function canMutateTasks(role?: string | null) {
  return checkPermission(role, PROJECT_ROLES.MEMBER);
}

export function canUseProjectAi(role?: string | null) {
  return checkPermission(role, PROJECT_ROLES.MEMBER);
}

export function canConfigureProjectAi(role?: string | null) {
  return checkPermission(role, PROJECT_ROLES.ADMIN);
}

export function isViewer(role?: string | null) {
  return normalizeRole(role) === PROJECT_ROLES.VIEWER;
}
