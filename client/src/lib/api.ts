const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

/* ─── Types ─── */

export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    error?: string;
    data?: T;
}

export interface AuthTokens {
    access_token: string;
    refresh_token: string;
}

export interface UserData {
    id: string;
    email: string;
    user_metadata?: Record<string, unknown>;
}

export interface LoginResponse {
    user: UserData;
    session: Record<string, unknown>;
    access_token: string;
    refresh_token: string;
}

export interface RegisterResponse {
    user: UserData;
    session: Record<string, unknown> | null;
    access_token?: string | null;
    refresh_token?: string | null;
}

/* ─── Token helpers ─── */

export function getStoredTokens(): AuthTokens | null {
    if (typeof window === "undefined") return null;
    const access = localStorage.getItem("lanyard_access_token");
    const refresh = localStorage.getItem("lanyard_refresh_token");
    if (!access || !refresh) return null;
    return { access_token: access, refresh_token: refresh };
}

export function storeTokens(tokens: AuthTokens) {
    localStorage.setItem("lanyard_access_token", tokens.access_token);
    localStorage.setItem("lanyard_refresh_token", tokens.refresh_token);
}

export function clearTokens() {
    localStorage.removeItem("lanyard_access_token");
    localStorage.removeItem("lanyard_refresh_token");
}

/* ─── Core fetch wrapper ─── */

async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const tokens = getStoredTokens();

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    if (tokens?.access_token) {
        headers["Authorization"] = `Bearer ${tokens.access_token}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const json: ApiResponse<T> = await res.json();

    // On 401, try refresh once
    if (res.status === 401 && tokens?.refresh_token) {
        const refreshed = await refreshAccessToken(tokens.refresh_token);
        if (refreshed) {
            headers["Authorization"] = `Bearer ${refreshed.access_token}`;
            const retryRes = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers,
            });
            return retryRes.json();
        } else {
            clearTokens();
        }
    }

    return json;
}

/* ─── Token refresh ─── */

async function refreshAccessToken(
    refresh_token: string
): Promise<AuthTokens | null> {
    try {
        const res = await fetch(`${API_URL}/auth/refresh-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token }),
        });

        const json: ApiResponse<AuthTokens> = await res.json();

        if (json.success && json.data) {
            storeTokens(json.data);
            return json.data;
        }
        return null;
    } catch {
        return null;
    }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Auth API
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export const authApi = {
    register(payload: {
        email: string;
        password: string;
        metadata?: { full_name?: string; username?: string };
    }) {
        return apiFetch<RegisterResponse>("/auth/register", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    login(payload: { email: string; password: string }) {
        return apiFetch<LoginResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },

    logout() {
        return apiFetch("/auth/logout", { method: "POST" });
    },

    getCurrentUser() {
        return apiFetch<{ user: UserData }>("/auth/current-user");
    },

    verifyToken() {
        return apiFetch<{ user: UserData }>("/auth/verify");
    },

    forgotPassword(email: string) {
        return apiFetch("/auth/forgot-password", {
            method: "POST",
            body: JSON.stringify({ email }),
        });
    },

    resetPassword(resetToken: string, newPassword: string) {
        return apiFetch(`/auth/reset-password/${resetToken}`, {
            method: "POST",
            body: JSON.stringify({ newPassword }),
        });
    },

    changePassword(oldPassword: string, newPassword: string) {
        return apiFetch("/auth/change-password", {
            method: "POST",
            body: JSON.stringify({ oldPassword, newPassword }),
        });
    },

    refreshToken(refresh_token: string) {
        return refreshAccessToken(refresh_token);
    },
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Projects API
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export const projectsApi = {
    list() {
        return apiFetch("/projects");
    },
    create(payload: { name: string; description?: string; status?: string; start_date?: string; target_end_date?: string }) {
        return apiFetch("/projects", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },
    get(projectId: string) {
        return apiFetch(`/projects/${projectId}`);
    },
    update(projectId: string, payload: Record<string, unknown>) {
        return apiFetch(`/projects/${projectId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });
    },
    delete(projectId: string) {
        return apiFetch(`/projects/${projectId}`, { method: "DELETE" });
    },
    listMembers(projectId: string) {
        return apiFetch(`/projects/${projectId}/members`);
    },
    addMember(projectId: string, payload: { email: string; role?: string }) {
        return apiFetch(`/projects/${projectId}/members`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },
    updateMember(projectId: string, userId: string, payload: { role: string }) {
        return apiFetch(`/projects/${projectId}/members/${userId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });
    },
    removeMember(projectId: string, userId: string) {
        return apiFetch(`/projects/${projectId}/members/${userId}`, {
            method: "DELETE",
        });
    },
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Tasks API
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export const tasksApi = {
    list(projectId: string, filters?: Record<string, string>) {
        const params = filters ? "?" + new URLSearchParams(filters).toString() : "";
        return apiFetch(`/tasks/${projectId}${params}`);
    },
    create(projectId: string, payload: Record<string, unknown>) {
        return apiFetch(`/tasks/${projectId}`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },
    get(projectId: string, taskId: string) {
        return apiFetch(`/tasks/${projectId}/t/${taskId}`);
    },
    update(projectId: string, taskId: string, payload: Record<string, unknown>) {
        return apiFetch(`/tasks/${projectId}/t/${taskId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });
    },
    delete(projectId: string, taskId: string) {
        return apiFetch(`/tasks/${projectId}/t/${taskId}`, { method: "DELETE" });
    },
    createSubtask(
        projectId: string,
        taskId: string,
        payload: Record<string, unknown>
    ) {
        return apiFetch(`/tasks/${projectId}/t/${taskId}/subtasks`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },
    updateSubtask(
        projectId: string,
        subTaskId: string,
        payload: Record<string, unknown>
    ) {
        return apiFetch(`/tasks/${projectId}/st/${subTaskId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });
    },
    deleteSubtask(projectId: string, subTaskId: string) {
        return apiFetch(`/tasks/${projectId}/st/${subTaskId}`, {
            method: "DELETE",
        });
    },
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Notes API
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export const notesApi = {
    list(projectId: string, filters?: Record<string, string>) {
        const params = filters ? "?" + new URLSearchParams(filters).toString() : "";
        return apiFetch(`/notes/${projectId}${params}`);
    },
    create(projectId: string, payload: Record<string, unknown>) {
        return apiFetch(`/notes/${projectId}`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },
    get(projectId: string, noteId: string) {
        return apiFetch(`/notes/${projectId}/n/${noteId}`);
    },
    update(projectId: string, noteId: string, payload: Record<string, unknown>) {
        return apiFetch(`/notes/${projectId}/n/${noteId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });
    },
    delete(projectId: string, noteId: string) {
        return apiFetch(`/notes/${projectId}/n/${noteId}`, { method: "DELETE" });
    },
};
