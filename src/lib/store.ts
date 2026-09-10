/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ponytail: localStorage 統一出入口 + 租戶/使用者查詢，RFI/Kanban 共用，避免各元件重寫過濾邏輯。

export interface Tenant {
  id: string;
  name: string;
  office: string;
}

export interface DemoUser {
  uid: string;
  displayName: string;
  email: string;
  role: string;
  office: string;
  tenantId: string;
}

export interface Project {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  status: string;
}

const read = <T>(key: string, fallback: T): T => {
  try {
    const s = localStorage.getItem(key);
    return s ? (JSON.parse(s) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const loadList = <T>(key: string): T[] => read<T[]>(key, []);
export const saveList = (key: string, list: unknown[]): void => {
  localStorage.setItem(key, JSON.stringify(list));
};

export const getTenants = (): Tenant[] => loadList<Tenant>('archclock_tenants');
export const getProjects = (): Project[] => loadList<Project>('archclock_projects');

/** 目前租戶：'all' 表全部，教學預設看全部、切換後驗隔離 */
export const getTenantId = (): string => localStorage.getItem('archclock_tenant') || 'all';
export const setTenantId = (id: string): void => localStorage.setItem('archclock_tenant', id);

/** 同租戶使用者（供指派下拉）；舊資料無 tenantId 時全列出 */
export const listUsers = (tenantId: string): DemoUser[] => {
  const users: DemoUser[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('archclock_users_') && !k.endsWith('local-user-id')) {
      try {
        users.push(JSON.parse(localStorage.getItem(k)!));
      } catch { /* 跳過壞資料 */ }
    }
  }
  if (tenantId === 'all') return users;
  const scoped = users.filter((u) => u.tenantId === tenantId);
  return scoped.length > 0 ? scoped : users;
};

/** 目前登入人姓名（回覆署名用） */
export const getCurrentUserName = (): string => {
  const u = read<{ displayName?: string }>('archclock_user', {});
  return u.displayName || '我';
};

/** 租戶過濾：無 tenantId 的舊卡片視為共用，永遠顯示 */
export const inTenant = (item: { tenantId?: string }, tenantId: string): boolean =>
  tenantId === 'all' || !item.tenantId || item.tenantId === tenantId;
