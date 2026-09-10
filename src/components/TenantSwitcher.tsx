/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { getTenants, Tenant } from '../lib/store';
import { backendUp, apiGet } from '../lib/api';

export default function TenantSwitcher({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [tenants, setTenants] = useState<Tenant[]>(getTenants());
  useEffect(() => {
    let on = true;
    (async () => {
      try {
        if (await backendUp()) {
          const r = await apiGet<{ items: Tenant[] }>('/tenants');
          if (on && r.items.length > 0) setTenants(r.items);
        }
      } catch { /* 退回本地 */ }
    })();
    return () => { on = false; };
  }, []);
  if (tenants.length === 0) return null;
  return (
    <label className="hidden md:flex items-center space-x-2 pr-4 border-r border-neutral-100" title="切換租戶（驗證資料隔離）">
      <Building2 className="h-4 w-4 text-neutral-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-xs font-medium bg-transparent focus:outline-none cursor-pointer max-w-[160px]"
      >
        <option value="all">全部租戶</option>
        {tenants.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
    </label>
  );
}
