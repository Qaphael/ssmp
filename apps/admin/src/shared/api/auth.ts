const TOKEN_KEY = 'sm_jwt_token';
const USER_KEY = 'sm_user';

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

function getApiBase(): string {
  try {
    const stored = localStorage.getItem('sm_api_url');
    return stored ? stored.replace(/\/$/, '') : (import.meta.env.VITE_API_URL || 'http://localhost:3001');
  } catch {
    return import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }
}

async function authFetch(path: string, options: RequestInit = {}): Promise<any> {
  const base = getApiBase();
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || `API error ${res.status}`);
  }
  return body;
}

export async function login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
  const data = await authFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  setUser(data.user);
  return data;
}

export async function register(email: string, password: string, firstName: string, lastName: string, role: string): Promise<{ token: string; user: AuthUser }> {
  const data = await authFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, firstName, lastName, role }),
  });
  setToken(data.token);
  setUser(data.user);
  return data;
}

export async function forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
  return authFetch('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, password: string): Promise<{ message: string }> {
  return authFetch('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

export async function getMe(): Promise<{ user: AuthUser }> {
  const token = getToken();
  return authFetch('/api/auth/me', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
  const token = getToken();
  return authFetch('/api/auth/change-password', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}

export async function updateProfile(firstName: string, lastName: string): Promise<{ user: AuthUser }> {
  const token = getToken();
  return authFetch('/api/auth/profile', {
    method: 'PUT',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify({ firstName, lastName }),
  });
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

function setUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
