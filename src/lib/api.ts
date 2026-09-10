/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ponytail: 薄 fetch 包裝 + 後端存活探測；後端沒開時回 false，呼叫端退回 localStorage。

const BASE = '/api/v1';
let upCache: boolean | null = null;

export async function backendUp(): Promise<boolean> {
  if (upCache !== null) return upCache;
  try {
    const r = await fetch(`${BASE}/tenants`);
    upCache = r.ok;
  } catch {
    upCache = false;
  }
  return upCache;
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${BASE}${path}`, init);
  if (!r.ok) throw new Error(`${r.status} ${path}`);
  return r.json();
}

export const apiGet = <T>(path: string): Promise<T> => req<T>(path);

export async function apiList<T>(resource: 'rfis' | 'kanban'): Promise<T[]> {
  const r = await apiGet<{ items: T[] }>(`/${resource}`);
  return r.items;
}
export const apiSend = <T>(path: string, method: string, body?: unknown): Promise<T> =>
  req<T>(path, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });

export const apiUpload = (rfiId: string, file: File): Promise<{ id: string; fileName: string; url: string }> => {
  const fd = new FormData();
  fd.append('file', file);
  return req(`rfis/${rfiId}/attachments`, { method: 'POST', body: fd });
};

export interface DemoData {
  projects: any[];
  kanban: any[];
  rfis: any[];
}

export interface Session {
  uid: string;
  displayName: string;
  role: string;
  tenantId: string;
  tenantName: string;
  mustChange: boolean;
  demoData?: DemoData;
}

export async function apiLogin(account: string, password: string): Promise<Session> {
  const r = await fetch(`${BASE}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ account, password }) });
  if (!r.ok) throw new Error((await r.json()).error || '登入失敗');
  return r.json();
}
export async function apiChangePassword(account: string, oldPassword: string, newPassword: string, newUid?: string): Promise<{ uid?: string }> {
  const r = await fetch(`${BASE}/change-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ account, oldPassword, newPassword, newUid }) });
  if (!r.ok) throw new Error((await r.json()).error || '改密碼失敗');
  return r.json();
}
export async function apiUpdateUserRole(uid: string, role: string): Promise<void> {
  const r = await fetch(`${BASE}/users/${encodeURIComponent(uid)}/role`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) });
  if (!r.ok) throw new Error((await r.json()).error || '改角色失敗');
}
export const getSession = (): Session | null => {
  try {
    return JSON.parse(localStorage.getItem('archclock_session') || 'null');
  } catch {
    return null;
  }
};
export const setSession = (s: Session | null): void => {
  if (s) localStorage.setItem('archclock_session', JSON.stringify(s));
  else localStorage.removeItem('archclock_session');
};
