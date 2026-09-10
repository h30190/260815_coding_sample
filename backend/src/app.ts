/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ponytail: 單檔 routes，不分層；租戶隔離靠 middleware 注入 tenantId，所有查詢強制帶它。

import express from 'express';
import multer from 'multer';
import path from 'node:path';
import { db, hashPassword, verifyPassword } from './db';
import { runSeed } from './seed';

const PORT = Number(process.env.BACKEND_PORT || 3001);
const app = express();
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'data', 'uploads')));

// ---- 租戶中介層：資源路由必填 X-Tenant-Id；只有建租戶/登入系免頭 ----
app.use('/api/v1', (req, res, next) => {
  const open = (req.path === '/tenants' && (req.method === 'GET' || req.method === 'POST'))
    || ['/seed', '/reset', '/login', '/change-password'].some((p) => req.path.startsWith(p));
  if (open) return next();
  const tid = req.header('X-Tenant-Id');
  if (!tid) return res.status(400).json({ error: '缺少 X-Tenant-Id' });
  (req as any).tenantId = tid;
  next();
});

const uid = () => Math.random().toString(36).substring(2, 9);
const J = (s: any, fb: any = []) => { try { return JSON.parse(s || 'null') ?? fb; } catch { return fb; } };

// ---- 基礎 ----
app.get('/api/v1/tenants', (_req, res) => res.json({ items: db.prepare('SELECT * FROM tenants').all() }));
app.post('/api/v1/tenants', (req, res) => {
  const { id, name, office } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'name 必填' });
  const tid = id || 't-' + uid();
  try {
    db.prepare('INSERT INTO tenants (id, name, office) VALUES (?, ?, ?)').run(tid, name.trim(), office || '');
  } catch { return res.status(409).json({ error: '租戶已存在' }); }
  res.status(201).json({ id: tid });
});
app.post('/api/v1/users', (req, res) => {
  const t = (req as any).tenantId;
  const { uid: wantUid, displayName, email, role, office, password } = req.body;
  if (!displayName?.trim()) return res.status(400).json({ error: 'displayName 必填' });
  const u = wantUid || 'u-' + uid();
  try {
    db.prepare('INSERT INTO users (uid, tenantId, displayName, email, role, office, password_hash, must_change) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
      u, t, displayName.trim(), email || '', role || 'staff', office || '', password ? hashPassword(password) : null, password ? 0 : 1);
  } catch { return res.status(409).json({ error: '帳號已存在' }); }
  res.status(201).json({ uid: u });
});
app.patch('/api/v1/tenants/:id', (req, res) => {
  const t = (req as any).tenantId;
  if (req.params.id !== t) return res.status(403).json({ error: '只能改自己租戶' });
  const { name, office } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'name 必填' });
  db.prepare('UPDATE tenants SET name = ?, office = ? WHERE id = ?').run(name.trim(), office || '', t);
  res.json({ ok: true });
});
app.post('/api/v1/projects', (req, res) => {
  const t = (req as any).tenantId;
  const { name, code } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'name 必填' });
  const p = 'p-' + uid();
  db.prepare('INSERT INTO projects (id, tenantId, name, code, status) VALUES (?, ?, ?, ?, ?)').run(p, t, name.trim(), code || '', 'active');
  res.status(201).json({ id: p });
});
app.get('/api/v1/projects', (req, res) => {
  const t = (req as any).tenantId;
  res.json({ items: db.prepare('SELECT * FROM projects WHERE tenantId = ?').all(t) });
});
app.get('/api/v1/users', (req, res) => {
  const t = (req as any).tenantId;
  res.json({ items: db.prepare('SELECT * FROM users WHERE tenantId = ?').all(t) });
});
app.post('/api/v1/seed', (_req, res) => res.json(runSeed()));
app.post('/api/v1/reset', (_req, res) => res.json(runSeed()));

// ---- 登入：帳號(uid)+密碼；新人/重置者 mustChange=1 擋下強制改密碼 ----
app.post('/api/v1/login', (req, res) => {
  const { account, password } = req.body;
  const u = db.prepare('SELECT uid, tenantId, displayName, role, password_hash, must_change FROM users WHERE uid = ?').get(account) as any;
  if (!u || !u.password_hash || !verifyPassword(password || '', u.password_hash)) {
    return res.status(401).json({ error: '帳號或密碼錯誤' });
  }
  const t = db.prepare('SELECT * FROM tenants WHERE id = ?').get(u.tenantId) as any;
  res.json({ uid: u.uid, displayName: u.displayName, role: u.role, tenantId: u.tenantId, tenantName: t?.name || '', mustChange: (u.must_change || 0) === 1 });
});
app.post('/api/v1/change-password', (req, res) => {
  const { account, oldPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 4) return res.status(400).json({ error: '新密碼至少 4 碼' });
  const u = db.prepare('SELECT password_hash FROM users WHERE uid = ?').get(account) as any;
  if (!u || !verifyPassword(oldPassword || '', u.password_hash)) {
    return res.status(401).json({ error: '舊密碼錯誤' });
  }
  db.prepare('UPDATE users SET password_hash = ?, must_change = 0 WHERE uid = ?').run(hashPassword(newPassword), account);
  res.json({ ok: true });
});

// ---- 看板 ----
app.get('/api/v1/kanban', (req, res) => {
  const t = (req as any).tenantId;
  const { projectId } = req.query;
  const rows = projectId
    ? db.prepare('SELECT * FROM kanban_tasks WHERE tenantId = ? AND projectId = ?').all(t, projectId)
    : db.prepare('SELECT * FROM kanban_tasks WHERE tenantId = ?').all(t);
  res.json({ items: rows });
});
app.post('/api/v1/kanban', (req, res) => {
  const t = (req as any).tenantId;
  const { projectId, title, description, assignee, priority, dueDate, column } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'title 必填' });
  const id = uid();
  db.prepare('INSERT INTO kanban_tasks (id, tenantId, projectId, title, description, assignee, priority, dueDate, col, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, t, projectId || null, title.trim(), description || '', assignee || '未分配', priority || 'medium', dueDate || new Date().toISOString().split('T')[0], column || 'backlog', new Date().toISOString());
  res.status(201).json({ id });
});
app.patch('/api/v1/kanban/:id', (req, res) => {
  const t = (req as any).tenantId;
  const cols = ['title', 'description', 'assignee', 'priority', 'dueDate', 'projectId'];
  const sets: string[] = [];
  const vals: any[] = [];
  if (req.body.column) { sets.push('col = ?'); vals.push(req.body.column); }
  cols.forEach((c) => { if (req.body[c] !== undefined) { sets.push(`${c} = ?`); vals.push(req.body[c]); } });
  if (sets.length === 0) return res.status(400).json({ error: '無可更新欄位' });
  const r = db.prepare(`UPDATE kanban_tasks SET ${sets.join(', ')} WHERE id = ? AND tenantId = ?`).run(...vals, req.params.id, t);
  if (r.changes === 0) return res.status(404).json({ error: '找不到任務（可能跨租戶）' });
  res.json({ ok: true });
});
app.delete('/api/v1/kanban/:id', (req, res) => {
  const t = (req as any).tenantId;
  const r = db.prepare('DELETE FROM kanban_tasks WHERE id = ? AND tenantId = ?').run(req.params.id, t);
  if (r.changes === 0) return res.status(404).json({ error: '找不到任務' });
  res.json({ ok: true });
});

// ---- RFI ----
function rfiDetail(row: any) {
  return {
    ...row,
    column: undefined,
    cc: J(row.cc), linkedDrawings: J(row.linkedDrawings),
    replies: db.prepare('SELECT byUser AS by, text, at FROM rfi_replies WHERE rfiId = ? ORDER BY id').all(row.id),
    attachments: db.prepare('SELECT id, fileName, mime, size, path, uploadedBy, createdAt FROM attachments WHERE rfiId = ?').all(row.id)
      .map((a: any) => ({ ...a, url: `/uploads/${path.basename(a.path)}` })),
  };
}

app.get('/api/v1/rfis', (req, res) => {
  const t = (req as any).tenantId;
  const { projectId, status } = req.query;
  let sql = 'SELECT * FROM rfis WHERE tenantId = ?';
  const vals: any[] = [t];
  if (projectId) { sql += ' AND projectId = ?'; vals.push(projectId); }
  if (status) { sql += ' AND status = ?'; vals.push(status); }
  const rows = (db.prepare(sql).all(...vals) as any[]).map(rfiDetail);
  res.json({ items: rows, total: rows.length });
});
app.get('/api/v1/rfis/:id', (req, res) => {
  const t = (req as any).tenantId;
  const row = db.prepare('SELECT * FROM rfis WHERE id = ? AND tenantId = ?').get(req.params.id, t) as any;
  if (!row) return res.status(404).json({ error: '找不到 RFI' });
  res.json(rfiDetail(row));
});
app.post('/api/v1/rfis', (req, res) => {
  const t = (req as any).tenantId;
  const { projectId, title, description, askedBy, assignedTo, dueDate, linkedDrawings, priority } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'title 必填' });
  const maxId = (db.prepare("SELECT id FROM rfis WHERE id LIKE 'RFI-%' ORDER BY id DESC LIMIT 1").get() as any)?.id;
  const next = `RFI-2026-${String((maxId ? parseInt(maxId.split('-').pop()!, 10) : 0) + 1).padStart(3, '0')}`;
  const now = new Date().toISOString();
  db.prepare('INSERT INTO rfis (id, tenantId, projectId, title, description, askedBy, assignedTo, cc, status, priority, dueDate, linkedDrawings, version, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(next, t, projectId || null, title.trim(), description || '', askedBy || '', assignedTo || '未分配', '[]', 'open', priority || 'medium', dueDate || now.split('T')[0], JSON.stringify(linkedDrawings || []), 1, now);
  res.status(201).json({ id: next });
});
app.patch('/api/v1/rfis/:id', (req, res) => {
  const t = (req as any).tenantId;
  const sets: string[] = [];
  const vals: any[] = [];
  ['title', 'description', 'assignedTo', 'status', 'priority', 'dueDate', 'projectId'].forEach((c) => {
    if (req.body[c] !== undefined) { sets.push(`${c} = ?`); vals.push(req.body[c]); }
  });
  if (req.body.cc !== undefined) { sets.push('cc = ?'); vals.push(JSON.stringify(req.body.cc)); }
  if (req.body.linkedDrawings !== undefined) { sets.push('linkedDrawings = ?'); vals.push(JSON.stringify(req.body.linkedDrawings)); }
  if (sets.length === 0) return res.status(400).json({ error: '無可更新欄位' });
  sets.push('version = version + 1');
  const r = db.prepare(`UPDATE rfis SET ${sets.join(', ')} WHERE id = ? AND tenantId = ?`).run(...vals, req.params.id, t);
  if (r.changes === 0) return res.status(404).json({ error: '找不到 RFI' });
  res.json({ ok: true });
});
app.post('/api/v1/rfis/:id/replies', (req, res) => {
  const t = (req as any).tenantId;
  const { by, text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'text 必填' });
  const row = db.prepare('SELECT id FROM rfis WHERE id = ? AND tenantId = ?').get(req.params.id, t);
  if (!row) return res.status(404).json({ error: '找不到 RFI' });
  db.prepare('INSERT INTO rfi_replies (rfiId, byUser, text, at) VALUES (?, ?, ?, ?)').run(req.params.id, by || '', text.trim(), new Date().toISOString());
  db.prepare('UPDATE rfis SET version = version + 1 WHERE id = ?').run(req.params.id);
  res.status(201).json({ ok: true });
});

// ---- 附件（圖片 ≤5MB、單 RFI ≤10 件） ----
const upload = multer({
  dest: path.join(__dirname, '..', 'data', 'uploads'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith('image/')),
});
app.post('/api/v1/rfis/:id/attachments', upload.single('file'), (req, res) => {
  const t = (req as any).tenantId;
  const row = db.prepare('SELECT id FROM rfis WHERE id = ? AND tenantId = ?').get(req.params.id, t) as any;
  if (!row) return res.status(404).json({ error: '找不到 RFI' });
  if (!req.file) return res.status(400).json({ error: '只收圖片（≤5MB）' });
  const n = (db.prepare('SELECT COUNT(*) AS c FROM attachments WHERE rfiId = ?').get(req.params.id) as any).c;
  if (n >= 10) return res.status(400).json({ error: '單 RFI 上限 10 件' });
  const id = uid();
  const ext = path.extname(req.file.originalname) || '.png';
  const final = path.join(path.dirname(req.file.path), `${id}${ext}`);
  require('node:fs').renameSync(req.file.path, final);
  db.prepare('INSERT INTO attachments (id, rfiId, fileName, mime, size, path, uploadedBy, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, req.params.id, req.file.originalname, req.file.mimetype, req.file.size, final, req.header('X-User-Id') || '', new Date().toISOString());
  res.status(201).json({ id, fileName: req.file.originalname, url: `/uploads/${id}${ext}` });
});

app.listen(PORT, () => console.log(`archclock-backend on :${PORT}`));
