/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ponytail: admin 專用設定頁 — 公司改名 + 新增人員 + 人員一覽；只有後端模式才有作用。

import React, { useState, useEffect } from 'react';
import { apiGet, apiSend } from '../lib/api';
import { DemoUser } from '../lib/store';

export default function AdminSetup({ tenantId }: { tenantId: string }) {
  const [users, setUsers] = useState<DemoUser[]>([]);
  const [company, setCompany] = useState('');
  const [account, setAccount] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [msg, setMsg] = useState('');

  const refresh = async () => {
    try {
      const r = await apiGet<{ items: DemoUser[] }>('/users', tenantId);
      setUsers(r.items);
    } catch { /* 後端沒開就空白 */ }
  };
  useEffect(() => { refresh(); }, [tenantId]);

  const rename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) return;
    try {
      await apiSend(`tenants/${tenantId}`, 'PATCH', tenantId, { name: company.trim() });
      setMsg('公司名稱已更新（切換租戶即看到）');
      setCompany('');
    } catch (err: any) { setMsg(err.message); }
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password) return;
    try {
      await apiSend('/users', 'POST', tenantId, { uid: account.trim() || undefined, displayName: name.trim(), password, role });
      setMsg(`已新增 ${name.trim()}（首登需改密碼）`);
      setAccount(''); setName(''); setPassword('');
      refresh();
    } catch (err: any) { setMsg(err.message); }
  };

  const input = 'w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 rounded-sm';

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-light tracking-tight text-neutral-900 uppercase">管理員設定</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Admin Setup</p>
      </div>

      <form onSubmit={rename} className="bg-white border border-neutral-200 rounded-sm p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest">公司名稱</h3>
        <div className="flex space-x-2">
          <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="例如：OO建築師事務所" className={input} />
          <button className="px-4 py-3 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider rounded-sm shrink-0">改名</button>
        </div>
      </form>

      <form onSubmit={addUser} className="bg-white border border-neutral-200 rounded-sm p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest">新增人員（首登需改密碼）</h3>
        <div className="grid grid-cols-2 gap-4">
          <input value={account} onChange={(e) => setAccount(e.target.value)} placeholder="帳號（英文，空白自動產生）" className={input} />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="姓名（必填）" className={input} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="初始密碼（必填）" className={input} />
          <select value={role} onChange={(e) => setRole(e.target.value)} className={input}>
            <option value="staff">Staff（員工）</option>
            <option value="architect">Architect（建築師）</option>
            <option value="admin">Admin（管理員）</option>
          </select>
        </div>
        <button className="w-full py-3 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider rounded-sm">新增人員</button>
      </form>

      <div className="bg-white border border-neutral-200 rounded-sm p-6">
        <h3 className="text-sm font-bold uppercase tracking-widest mb-4">人員一覽（{users.length}）</h3>
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.uid} className="flex items-center justify-between text-sm border-b border-neutral-100 pb-2">
              <span className="font-medium">{u.displayName} <span className="text-neutral-400 font-mono text-xs">{u.uid}</span></span>
              <span className="text-[11px] uppercase tracking-wider text-neutral-400">{u.role}</span>
            </div>
          ))}
          {users.length === 0 && <p className="text-xs text-neutral-400">後端沒開或尚無人員</p>}
        </div>
      </div>

      {msg && <p className="text-xs text-center text-neutral-600">{msg}</p>}
    </div>
  );
}
