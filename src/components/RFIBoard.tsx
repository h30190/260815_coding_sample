/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ponytail: v1 只做唯讀列表 + 展開，資料吃 seed.ts 灌的 archclock_rfi；寫入操作下階段再加。

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Paperclip, MessageSquare, Calendar, User, Plus, X } from 'lucide-react';
import { saveList, listUsers, getProjects, getCurrentUserName, inTenant } from '../lib/store';
import { backendUp, apiList, apiSend, apiUpload } from '../lib/api';

interface RFIReply {
  by: string;
  text: string;
  at: string;
}

interface RFIAttachment {
  id: string;
  fileName: string;
  mime: string;
  size: number;
  dataUrl?: string;
  url?: string;
  uploadedBy: string;
  createdAt: string;
}

interface RFI {
  id: string;
  tenantId: string;
  projectId: string;
  title: string;
  description: string;
  askedBy: string;
  assignedTo: string;
  cc: string[];
  status: 'open' | 'answered' | 'closed';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  linkedDrawings: string[];
  version: number;
  createdAt: string;
  replies: RFIReply[];
  attachments: RFIAttachment[];
}

type Filter = 'all' | 'open' | 'answered' | 'closed' | 'overdue';

const isOverdue = (r: RFI) => r.status !== 'closed' && r.dueDate < new Date().toISOString().split('T')[0];

const statusBadge = (r: RFI) => {
  if (isOverdue(r)) return <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 rounded-sm">逾期 Overdue</span>;
  if (r.status === 'open') return <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100 rounded-sm">待回覆</span>;
  if (r.status === 'answered') return <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100 rounded-sm">已回覆待確認</span>;
  return <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-100 rounded-sm">已結案</span>;
};

export default function RFIBoard({ tenantId }: { tenantId: string }) {
  const [rfis, setRfis] = useState<RFI[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [useApi, setUseApi] = useState(false);
  // 新增表單
  const [fTitle, setFTitle] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fProject, setFProject] = useState('');
  const [fAssignee, setFAssignee] = useState('');
  const [fDue, setFDue] = useState('');
  const [fDrawings, setFDrawings] = useState('');

  const users = listUsers(tenantId);
  const projects = getProjects().filter((p) => inTenant(p, tenantId));

  // ponytail: 後端有開就吃 API（多人共用同一份），沒開退回 localStorage（單機 demo）
  useEffect(() => {
    let on = true;
    (async () => {
      try {
        if (await backendUp()) {
          const items = await apiList<RFI>('rfis', tenantId);
          if (on) { setUseApi(true); setRfis(items); return; }
        }
      } catch { /* 掉回本地 */ }
      if (on) {
        setUseApi(false);
        const saved = localStorage.getItem('archclock_rfi');
        if (saved) setRfis(JSON.parse(saved));
      }
    })();
    return () => { on = false; };
  }, [tenantId]);

  const refresh = async () => {
    try {
      setRfis(await apiList<RFI>('rfis', tenantId));
    } catch { setUseApi(false); }
  };

  // ponytail: 本地模式才整包寫回 localStorage；API 模式以後端為真相來源
  const save = (next: RFI[]) => {
    setRfis(next);
    saveList('archclock_rfi', next);
  };

  const tidOf = (id: string) => rfis.find((r) => r.id === id)?.tenantId || tenantId;

  const addReply = async (id: string) => {
    const text = replyText.trim();
    if (!text) return;
    setReplyText('');
    if (useApi) {
      try {
        await apiSend(`rfis/${id}/replies`, 'POST', tidOf(id), { by: getCurrentUserName(), text });
        await refresh();
        return;
      } catch { setUseApi(false); }
    }
    save(rfis.map((r) => (r.id === id
      ? { ...r, replies: [...r.replies, { by: getCurrentUserName(), text, at: new Date().toISOString() }], version: r.version + 1 }
      : r)));
  };

  const setStatus = async (id: string, status: RFI['status']) => {
    if (useApi) {
      try {
        await apiSend(`rfis/${id}`, 'PATCH', tidOf(id), { status });
        await refresh();
        return;
      } catch { setUseApi(false); }
    }
    save(rfis.map((r) => (r.id === id ? { ...r, status, version: r.version + 1 } : r)));
  };

  // 附件：Ctrl+V 貼圖或點選上傳（圖片 ≤5MB、單 RFI ≤10 件；API 模式存後端 uploads/，本地模式存 dataUrl）
  const addFiles = (id: string, files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024).slice(0, 10);
    if (arr.length === 0) return;
    if (useApi) {
      (async () => {
        try {
          for (const f of arr) await apiUpload(id, tidOf(id), f);
          await refresh();
        } catch { setUseApi(false); }
      })();
      return;
    }
    Promise.all(arr.map((f) => new Promise<RFIAttachment>((resolve) => {
      const rd = new FileReader();
      rd.onload = () => resolve({ id: Math.random().toString(36).substring(2, 9), fileName: f.name, mime: f.type, size: f.size, dataUrl: rd.result as string, uploadedBy: getCurrentUserName(), createdAt: new Date().toISOString() });
      rd.readAsDataURL(f);
    }))).then((atts) => {
      save(rfis.map((r) => (r.id === id ? { ...r, attachments: [...r.attachments, ...atts].slice(0, 10) } : r)));
    });
  };

  // 新增 RFI：API 模式編號由後端接續，本地模式自行接續 RFI-2026-XXX
  const createRFI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fTitle.trim()) return;
    const tid = tenantId === 'all' ? (projects[0]?.tenantId || 't-taipei') : tenantId;
    const body = {
      projectId: fProject || projects[0]?.id || '', title: fTitle.trim(), description: fDesc.trim(),
      askedBy: getCurrentUserName(), assignedTo: fAssignee || users[0]?.displayName || '未分配',
      dueDate: fDue || undefined, linkedDrawings: fDrawings.split(/[,，\s]+/).filter(Boolean), priority: 'medium',
    };
    if (useApi) {
      try {
        const { id } = await apiSend<{ id: string }>('rfis', 'POST', tid, body);
        setFTitle(''); setFDesc(''); setFProject(''); setFAssignee(''); setFDue(''); setFDrawings('');
        setIsModalOpen(false);
        await refresh();
        setExpanded(id);
        return;
      } catch { setUseApi(false); }
    }
    const nums = rfis.map((r) => parseInt(r.id.split('-').pop() || '0', 10)).filter((n) => !isNaN(n));
    const next = `RFI-2026-${String(Math.max(0, ...nums) + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const rfi: RFI = {
      id: next, tenantId: tid,
      projectId: fProject || projects[0]?.id || '', title: fTitle.trim(), description: fDesc.trim(),
      askedBy: getCurrentUserName(), assignedTo: fAssignee || users[0]?.displayName || '未分配', cc: [],
      status: 'open', priority: 'medium', dueDate: fDue || now.split('T')[0],
      linkedDrawings: fDrawings.split(/[,，\s]+/).filter(Boolean), version: 1, createdAt: now, replies: [], attachments: [],
    };
    save([...rfis, rfi]);
    setFTitle(''); setFDesc(''); setFProject(''); setFAssignee(''); setFDue(''); setFDrawings('');
    setIsModalOpen(false);
    setExpanded(next);
  };

  const visible = rfis.filter((r) => inTenant(r, tenantId)).filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return isOverdue(r);
    return r.status === filter;
  });

  const tabs: { id: Filter; label: string }[] = [
    { id: 'all', label: `全部 ${rfis.length}` },
    { id: 'open', label: '待回覆' },
    { id: 'answered', label: '待確認' },
    { id: 'overdue', label: '逾期' },
    { id: 'closed', label: '已結案' },
  ];

  if (rfis.length === 0) {
    return (
      <div className="w-full text-center py-16 border border-dashed border-neutral-300 rounded-sm">
        <p className="text-sm text-neutral-500">尚無 RFI 資料</p>
        <p className="text-xs text-neutral-400 mt-1">請先回登入頁按「一鍵載入教學假資料」</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-light tracking-tight text-neutral-900 uppercase">RFI 議題追蹤</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Request for Information</p>
        </div>
        <div className="flex items-center space-x-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-sm border transition-colors ${
                filter === t.id ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-200 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900'
              }`}
            >
              {t.label}
            </button>
          ))}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider bg-neutral-900 text-white rounded-sm hover:bg-neutral-700"
          >
            <Plus className="h-3.5 w-3.5" /><span>新增RFI</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {visible.map((r) => (
            <motion.div
              key={r.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`bg-white border rounded-sm shadow-sm ${isOverdue(r) ? 'border-red-300' : 'border-neutral-200'}`}
            >
              <button
                onClick={() => { setExpanded(expanded === r.id ? null : r.id); setReplyText(''); }}
                className="w-full text-left p-4 flex items-start justify-between space-x-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center space-x-2 mb-1.5">
                    {statusBadge(r)}
                    <span className="text-[10px] text-neutral-400 font-mono">{r.id} · v{r.version}</span>
                    {r.linkedDrawings.map((d) => (
                      <span key={d} className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded-sm font-mono">{d}</span>
                    ))}
                  </div>
                  <h4 className="text-sm font-semibold text-neutral-900 leading-snug">{r.title}</h4>
                  <div className="flex items-center space-x-4 mt-2 text-[11px] text-neutral-400">
                    <span className="flex items-center space-x-1"><User className="h-3 w-3" /><span>{r.askedBy} → {r.assignedTo}</span></span>
                    <span className="flex items-center space-x-1"><Calendar className="h-3 w-3" /><span>{r.dueDate}</span></span>
                    <span className="flex items-center space-x-1"><MessageSquare className="h-3 w-3" /><span>{r.replies.length}</span></span>
                    <span className="flex items-center space-x-1"><Paperclip className="h-3 w-3" /><span>{r.attachments.length}</span></span>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-neutral-400 shrink-0 transition-transform ${expanded === r.id ? 'rotate-180' : ''}`} />
              </button>

              {expanded === r.id && (
                <div className="px-4 pb-4 pt-1 border-t border-neutral-100 space-y-3">
                  <p className="text-xs text-neutral-600 leading-relaxed">{r.description}</p>
                  {r.replies.map((rep, i) => (
                    <div key={i} className="bg-neutral-50 border border-neutral-100 rounded-sm p-3 text-xs">
                      <p className="font-semibold text-neutral-800 mb-1">{rep.by} <span className="font-normal text-neutral-400">{rep.at.split('T')[0]}</span></p>
                      <p className="text-neutral-600">{rep.text}</p>
                    </div>
                  ))}
                  {/* 附件 + 貼圖上傳（點框框後 Ctrl+V，或點選檔案） */}
                  <div
                    tabIndex={0}
                    onPaste={(e) => { if (e.clipboardData.files.length > 0) addFiles(r.id, e.clipboardData.files); }}
                    onClick={(e) => { const input = (e.currentTarget.querySelector('input[type=file]') as HTMLInputElement); input?.click(); }}
                    className="border border-dashed border-neutral-300 rounded-sm p-3 focus:outline-none focus:border-neutral-900 cursor-pointer"
                    title="點一下後按 Ctrl+V 貼圖，或點選上傳圖片（≤5MB）"
                  >
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files) addFiles(r.id, e.target.files); e.target.value = ''; }} />
                    {r.attachments.length > 0 ? (
                      <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                        {r.attachments.map((a) => (
                          <div key={a.id} className="flex items-center space-x-2 border border-neutral-200 bg-white rounded-sm p-2">
                            {(a.dataUrl || a.url) && <img src={a.dataUrl || a.url} alt={a.fileName} className="h-8 w-8 object-cover rounded-sm border border-neutral-100" />}
                            <div className="text-[10px] text-neutral-500">
                              <p className="font-medium text-neutral-700 max-w-[120px] truncate">{a.fileName}</p>
                              <p>{a.uploadedBy}</p>
                            </div>
                          </div>
                        ))}
                        <span className="text-[10px] text-neutral-400">＋ 貼上或點選繼續加圖</span>
                      </div>
                    ) : (
                      <p className="text-[11px] text-neutral-400 text-center">📎 在此貼上截圖（Ctrl+V）或點選上傳</p>
                    )}
                  </div>
                  {/* 狀態操作 */}
                  <div className="flex items-center space-x-2 pt-1">
                    {r.status === 'open' && (
                      <button onClick={() => setStatus(r.id, 'answered')} className="px-2.5 py-1 text-[11px] font-bold bg-neutral-900 text-white rounded-sm hover:bg-neutral-700">標記已回覆</button>
                    )}
                    {r.status === 'answered' && (
                      <>
                        <button onClick={() => setStatus(r.id, 'closed')} className="px-2.5 py-1 text-[11px] font-bold bg-green-700 text-white rounded-sm hover:bg-green-600">確認結案</button>
                        <button onClick={() => setStatus(r.id, 'open')} className="px-2.5 py-1 text-[11px] font-bold border border-neutral-300 text-neutral-600 rounded-sm hover:border-neutral-900 hover:text-neutral-900">重開</button>
                      </>
                    )}
                    {r.status === 'closed' && (
                      <button onClick={() => setStatus(r.id, 'open')} className="px-2.5 py-1 text-[11px] font-bold border border-neutral-300 text-neutral-600 rounded-sm hover:border-neutral-900 hover:text-neutral-900">重開</button>
                    )}
                  </div>
                  {/* 加回覆 */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={expanded === r.id ? replyText : ''}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') addReply(r.id); }}
                      placeholder="輸入回覆…（Enter 送出，版次自動 +1）"
                      className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 text-xs focus:outline-none focus:border-neutral-900 rounded-sm"
                    />
                    <button onClick={() => addReply(r.id)} className="px-3 py-2 text-[11px] font-bold bg-neutral-900 text-white rounded-sm hover:bg-neutral-700">送出</button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {visible.length === 0 && <p className="text-center text-xs text-neutral-400 py-8">此篩選條件下無資料</p>}
      </div>

      {/* 新增 RFI */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-neutral-950/20 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white border border-neutral-200 shadow-xl rounded-sm w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-neutral-900 uppercase tracking-wider">新增 RFI</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-900"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={createRFI} className="space-y-4 text-left">
                <input required value={fTitle} onChange={(e) => setFTitle(e.target.value)} placeholder="議題標題（必填）"
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 rounded-sm" />
                <textarea value={fDesc} onChange={(e) => setFDesc(e.target.value)} placeholder="問題描述…" rows={3}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 rounded-sm resize-none" />
                <div className="grid grid-cols-2 gap-4">
                  <select value={fProject} onChange={(e) => setFProject(e.target.value)}
                    className="px-4 py-3 bg-neutral-50 border border-neutral-200 text-sm rounded-sm text-neutral-800">
                    <option value="">專案（預設首案）</option>
                    {projects.map((p) => <option key={p.id} value={p.id}>{p.code} {p.name}</option>)}
                  </select>
                  <select value={fAssignee} onChange={(e) => setFAssignee(e.target.value)}
                    className="px-4 py-3 bg-neutral-50 border border-neutral-200 text-sm rounded-sm text-neutral-800">
                    <option value="">指派給（同租戶）</option>
                    {users.map((u) => <option key={u.uid} value={u.displayName}>{u.displayName}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="date" value={fDue} onChange={(e) => setFDue(e.target.value)}
                    className="px-4 py-3 bg-neutral-50 border border-neutral-200 text-sm rounded-sm" />
                  <input value={fDrawings} onChange={(e) => setFDrawings(e.target.value)} placeholder="關聯圖說，如 S2-101（空白逗號分隔）"
                    className="px-4 py-3 bg-neutral-50 border border-neutral-200 text-sm rounded-sm" />
                </div>
                <button type="submit" className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-sm">確認新增</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
