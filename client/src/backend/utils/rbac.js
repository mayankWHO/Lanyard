export const PROJECT_ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
};

const ROLE_RANK = {
  [PROJECT_ROLES.OWNER]: 4,
  [PROJECT_ROLES.ADMIN]: 3,
  [PROJECT_ROLES.MEMBER]: 2,
  [PROJECT_ROLES.VIEWER]: 1,
};

export const normalizeRole = (role) => {
  switch ((role || '').toUpperCase()) {
    case PROJECT_ROLES.OWNER:
      return PROJECT_ROLES.OWNER;
    case PROJECT_ROLES.ADMIN:
    case 'PROJECT_ADMIN':
      return PROJECT_ROLES.ADMIN;
    case PROJECT_ROLES.VIEWER:
      return PROJECT_ROLES.VIEWER;
    case PROJECT_ROLES.MEMBER:
    default:
      return PROJECT_ROLES.MEMBER;
  }
};

export const checkPermission = (userRole, requiredRole = PROJECT_ROLES.VIEWER) =>
  ROLE_RANK[normalizeRole(userRole)] >= ROLE_RANK[requiredRole];

export const canManageProjectSettings = (role) =>
  checkPermission(role, PROJECT_ROLES.ADMIN);

export const canManageMembers = (role) =>
  checkPermission(role, PROJECT_ROLES.ADMIN);

export const canMutateTasks = (role) =>
  checkPermission(role, PROJECT_ROLES.MEMBER);

export const canUseProjectAi = (role) =>
  checkPermission(role, PROJECT_ROLES.MEMBER);

export const canConfigureProjectAi = (role) =>
  checkPermission(role, PROJECT_ROLES.ADMIN);
