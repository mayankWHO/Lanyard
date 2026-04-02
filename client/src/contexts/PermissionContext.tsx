"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api";
import {
  PROJECT_ROLES,
  type ProjectRole,
  normalizeRole,
  checkPermission,
  canManageMembers,
  canManageProjectSettings,
  canMutateTasks,
  canUseProjectAi,
  canConfigureProjectAi,
} from "@/lib/permissions";

type ProjectRoleMap = Record<string, ProjectRole>;

interface PermissionContextValue {
  loading: boolean;
  platformRole: ProjectRole;
  projectRoles: ProjectRoleMap;
  refreshPermissions: () => Promise<void>;
  setProjectRole: (projectId: string, role?: string | null) => void;
  seedProjectRoles: (projects: ProjectRoleSource[]) => void;
  getProjectRole: (projectId?: string | null) => ProjectRole;
  hasProjectPermission: (projectId: string | null | undefined, requiredRole: ProjectRole) => boolean;
  canManageProjectMembers: (projectId?: string | null) => boolean;
  canManageProjectSettings: (projectId?: string | null) => boolean;
  canMutateProjectTasks: (projectId?: string | null) => boolean;
  canUseProjectAi: (projectId?: string | null) => boolean;
  canConfigureProjectAi: (projectId?: string | null) => boolean;
}

const PermissionContext = createContext<PermissionContextValue | null>(null);

interface ProjectRoleSource {
  id: string;
  current_user_role?: string | null;
}

export function PermissionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [platformRole, setPlatformRole] = useState<ProjectRole>(PROJECT_ROLES.MEMBER);
  const [projectRoles, setProjectRoles] = useState<ProjectRoleMap>({});

  const refreshPermissions = useCallback(async () => {
    if (!user) {
      setPlatformRole(PROJECT_ROLES.MEMBER);
      setProjectRoles({});
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const currentUserRes = await authApi.getCurrentUser();

      setPlatformRole(normalizeRole(currentUserRes.data?.profileRole));
    } catch (error) {
      console.error("Failed to refresh permissions", error);
      setPlatformRole(PROJECT_ROLES.MEMBER);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refreshPermissions();
  }, [refreshPermissions]);

  const setProjectRole = useCallback((projectId: string, role?: string | null) => {
    setProjectRoles((current) => {
      const normalizedRole = normalizeRole(role);
      if (current[projectId] === normalizedRole) {
        return current;
      }

      return {
        ...current,
        [projectId]: normalizedRole,
      };
    });
  }, []);

  const seedProjectRoles = useCallback((projects: ProjectRoleSource[]) => {
    setProjectRoles((current) => {
      const nextRoles = { ...current };
      let hasChanges = false;

      for (const project of projects) {
        const normalizedRole = normalizeRole(project.current_user_role);
        if (nextRoles[project.id] !== normalizedRole) {
          nextRoles[project.id] = normalizedRole;
          hasChanges = true;
        }
      }

      return hasChanges ? nextRoles : current;
    });
  }, []);

  const value = useMemo<PermissionContextValue>(() => {
    const getProjectRole = (projectId?: string | null) => {
      if (!projectId) return platformRole;
      return projectRoles[projectId] ?? platformRole;
    };

    const hasProjectPermission = (projectId: string | null | undefined, requiredRole: ProjectRole) =>
      checkPermission(getProjectRole(projectId), requiredRole);

    return {
      loading,
      platformRole,
      projectRoles,
      refreshPermissions,
      setProjectRole,
      seedProjectRoles,
      getProjectRole,
      hasProjectPermission,
      canManageProjectMembers: (projectId?: string | null) => canManageMembers(getProjectRole(projectId)),
      canManageProjectSettings: (projectId?: string | null) =>
        canManageProjectSettings(getProjectRole(projectId)),
      canMutateProjectTasks: (projectId?: string | null) => canMutateTasks(getProjectRole(projectId)),
      canUseProjectAi: (projectId?: string | null) => canUseProjectAi(getProjectRole(projectId)),
      canConfigureProjectAi: (projectId?: string | null) =>
        canConfigureProjectAi(getProjectRole(projectId)),
    };
  }, [loading, platformRole, projectRoles, refreshPermissions, seedProjectRoles, setProjectRole]);

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

export function usePermissions() {
  const ctx = useContext(PermissionContext);
  if (!ctx) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }

  return ctx;
}
