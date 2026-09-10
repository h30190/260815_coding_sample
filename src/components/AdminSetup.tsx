/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ponytail: admin 設定頁 — 人員一覽 + 角色管理 + 新增人員。

import React, { useState, useEffect } from 'react';
import { apiGet, apiSend, apiUpdateUserRole } from '../lib/api';
import { DemoUser } from '../lib/store';

export default function AdminSetup() {
  const [users, setUsers] = useState<DemoUser[]>([]);
  const [account, setAccount] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [msg, setMsg] = useState('');
  const [editingRole, setEditingRole] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const r = await apiGet<{ items: DemoUser[] }>('/users');
      setUsers(r.items);
    } catch { /* 後端沒開就空白 */ }
  };
  useEffect(() => { refresh(); }, []);

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password) return;
    try {
      await apiSend('/users', 'POST', { uid: account.trim() || undefined, displayName: name.trim(), password, role });
      setMsg(`已新增 ${name.trim()}（首登需改密碼）`);
      setAccount(''); setName(''); setPassword('');
      refresh();
    } catch (err: any) { setMsg(err.message); }
  };

  const changeRole = async (uid: string, newRole: string) => {
    try {
      await apiUpdateUserRole(uid, newRole);
      setMsg(`已將 ${uid} 改為 ${newRole}`);
      setEditingRole(null);
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
              {editingRole === u.uid ? (
                <div className="flex items-center space-x-1">
                  {['staff', 'architect', 'admin'].map((r) => (
                    <button key={r} onClick={() => changeRole(u.uid, r)}
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm border transition-colors ${u.role === r ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-200 text-neutral-500 hover:border-neutral-900'}`}
                    >{r}</button>
                  ))}
                  <button onClick={() => setEditingRole(null)} className="px-2 py-0.5 text-[10px] text-neutral-400 hover:text-neutral-900">取消</button>
                </div>
              ) : (
                <button onClick={() => setEditingRole(u.uid)} className="text-[11px] uppercase tracking-wider text-neutral-400 hover:text-neutral-900 cursor-pointer">{u.role} ▾</button>
              )}
            </div>
          ))}
          {users.length === 0 && <p className="text-xs text-neutral-400">後端沒開或尚無人員</p>}
        </div>
      </div>

      {msg && <p className="text-xs text-center text-neutral-600">{msg}</p>}
    </div>
  );
}
