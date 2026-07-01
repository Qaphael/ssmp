import { getAuthHeaders } from './auth';

function getApiBase(): string {
  try {
    const stored = localStorage.getItem('sm_api_url');
    return stored ? stored.replace(/\/$/, '') : (import.meta.env.VITE_API_URL || 'http://localhost:3001');
  } catch {
    return import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }
}

export interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<any> {
  const base = getApiBase();
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error ${res.status}`);
  }
  return res.json();
}

export async function listUsers(filters?: { search?: string; role?: string; page?: number }): Promise<{ data: UserData[]; pagination: any }> {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.role) params.set('role', filters.role);
  if (filters?.page) params.set('page', String(filters.page));
  const qs = params.toString();
  return apiFetch(`/api/users${qs ? '?' + qs : ''}`);
}

export async function getUser(id: string): Promise<{ data: UserData }> {
  return apiFetch(`/api/users/${id}`);
}

export async function updateUser(id: string, data: { role?: string; isActive?: boolean }): Promise<{ data: UserData }> {
  return apiFetch(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deactivateUser(id: string): Promise<{ data: UserData }> {
  return apiFetch(`/api/users/${id}`, { method: 'DELETE' });
}
