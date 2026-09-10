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

const headers = (tenantId: string, userId?: string): HeadersInit => {
  const h: Record<string, string> = { 'X-Tenant-Id': tenantId };
  if (userId) h['X-User-Id'] = userId;
  return h;
};

async function req<T>(path: string, tenantId: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${BASE}${path}`, { ...init, headers: { ...headers(tenantId), ...(init?.headers as any) } });
  if (!r.ok) throw new Error(`${r.status} ${path}`);
  return r.json();
}

export const apiGet = <T>(path: string, tenantId: string): Promise<T> => req<T>(path, tenantId);

/** 列表查詢：tenantId 為 'all' 時對各租戶扇出合併（教學展示用） */
export async function apiList<T>(resource: 'rfis' | 'kanban', tenantId: string): Promise<T[]> {
  if (tenantId !== 'all') {
    const r = await apiGet<{ items: T[] }>(`/${resource}`, tenantId);
    return r.items;
  }
  const t = await apiGet<{ items: { id: string }[] }>('/tenants', 'all');
  const lists = await Promise.all(
    t.items.map((x) => apiGet<{ items: T[] }>(`/${resource}`, x.id).then((r) => r.items).catch(() => [] as T[]))
  );
  return lists.flat();
}
export const apiSend = <T>(path: string, method: string, tenantId: string, body?: unknown): Promise<T> =>
  req<T>(path, tenantId, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });

export const apiUpload = (rfiId: string, tenantId: string, file: File): Promise<{ id: string; fileName: string; url: string }> => {
  const fd = new FormData();
  fd.append('file', file);
  return req(`rfis/${rfiId}/attachments`, tenantId, { method: 'POST', body: fd });
};
