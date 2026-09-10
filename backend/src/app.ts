/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ponytail: 單檔 routes，不分層；單租戶，tenantId 固定 't-default'。

import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { db, hashPassword, verifyPassword } from './db';
import { runSeed } from './seed';

const PORT = Number(process.env.BACKEND_PORT || 3001);
const TENANT = 't-default';
const app = express();
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'data', 'uploads')));

const uid = () => Math.random().toString(36).substring(2, 9);
const J = (s: any, fb: any = []) => { try { return JSON.parse(s || 'null') ?? fb; } catch { return fb; } };

// ---- 基礎 ----
app.get('/api/v1/tenants', (_req, res) => res.json({ items: db.prepare('SELECT * FROM tenants').all() }));
app.patch('/api/v1/tenants/:id', (req, res) => {
  const { name, office } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'name 必填' });
  db.prepare('UPDATE tenants SET name = ?, office = ? WHERE id = ?').run(name.trim(), office || '', req.params.id);
  res.json({ ok: true });
});

// ---- 使用者 ----
app.get('/api/v1/users', (_req, res) => {
  res.json({ items: db.prepare('SELECT uid, tenantId, displayName, email, role, office FROM users').all() });
});
app.post('/api/v1/users', (req, res) => {
  const { uid: wantUid, displayName, email, role, office, password } = req.body;
  if (!displayName?.trim()) return res.status(400).json({ error: 'displayName 必填' });
  const u = wantUid || 'u-' + uid();
  try {
    db.prepare('INSERT INTO users (uid, tenantId, displayName, email, role, office, password_hash, must_change) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
      u, TENANT, displayName.trim(), email || '', role || 'staff', office || '', password ? hashPassword(password) : null, password ? 0 : 1);
  } catch { return res.status(409).json({ error: '帳號已存在' }); }
  res.status(201).json({ uid: u });
});
app.patch('/api/v1/users/:uid/role', (req, res) => {
  const { role } = req.body;
  if (!['admin', 'architect', 'staff'].includes(role)) return res.status(400).json({ error: 'role 必須是 admin/architect/staff' });
  const r = db.prepare('UPDATE users SET role = ? WHERE uid = ?').run(role, req.params.uid);
  if (r.changes === 0) return res.status(404).json({ error: '找不到使用者' });
  res.json({ ok: true });
});

// ---- 專案 ----
app.get('/api/v1/projects', (_req, res) => {
  res.json({ items: db.prepare('SELECT * FROM projects WHERE tenantId = ?').all(TENANT) });
});
app.post('/api/v1/projects', (req, res) => {
  const { name, code } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'name 必填' });
  const p = 'p-' + uid();
  db.prepare('INSERT INTO projects (id, tenantId, name, code, status) VALUES (?, ?, ?, ?, ?)').run(p, TENANT, name.trim(), code || '', 'active');
  res.status(201).json({ id: p });
});

app.post('/api/v1/seed', (_req, res) => res.json(runSeed()));
app.post('/api/v1/reset', (_req, res) => res.json(runSeed()));

// ---- 登入：demo/demo 自動帶假資料，admin/admin 正式用 ----
app.post('/api/v1/login', (req, res) => {
  const { account, password } = req.body;
  const u = db.prepare('SELECT uid, tenantId, displayName, role, password_hash, must_change FROM users WHERE uid = ?').get(account) as any;

  // demo 帳號：自動灌資料再登入
  if (account === 'demo' && password === 'demo') {
    if (!u) {
      runSeed();
      const du = db.prepare('SELECT uid, tenantId, displayName, role FROM users WHERE uid = ?').get('demo') as any;
      if (!du) return res.status(500).json({ error: 'demo seed 失敗' });
      return res.json({
        uid: du.uid, displayName: du.displayName, role: du.role,
        tenantId: TENANT, tenantName: 'OO建築師事務所', mustChange: false,
        demoData: {
          projects: db.prepare('SELECT * FROM projects WHERE tenantId = ?').all(TENANT),
          kanban: db.prepare('SELECT * FROM kanban_tasks WHERE tenantId = ?').all(TENANT),
          rfis: (db.prepare('SELECT * FROM rfis WHERE tenantId = ?').all(TENANT) as any[]).map((row) => ({
            ...row, cc: J(row.cc), linkedDrawings: J(row.linkedDrawings),
            replies: db.prepare('SELECT byUser AS by, text, at FROM rfi_replies WHERE rfiId = ? ORDER BY id').all(row.id),
            attachments: db.prepare('SELECT id, fileName, mime, size, uploadedBy, createdAt FROM attachments WHERE rfiId = ?').all(row.id),
          })),
        },
      });
    }
    const t = db.prepare('SELECT name FROM tenants WHERE id = ?').get(u.tenantId) as any;
    return res.json({
      uid: u.uid, displayName: u.displayName, role: u.role,
      tenantId: u.tenantId, tenantName: t?.name || '', mustChange: false,
      demoData: {
        projects: db.prepare('SELECT * FROM projects WHERE tenantId = ?').all(u.tenantId),
        kanban: db.prepare('SELECT * FROM kanban_tasks WHERE tenantId = ?').all(u.tenantId),
        rfis: (db.prepare('SELECT * FROM rfis WHERE tenantId = ?').all(u.tenantId) as any[]).map((row) => ({
          ...row, cc: J(row.cc), linkedDrawings: J(row.linkedDrawings),
          replies: db.prepare('SELECT byUser AS by, text, at FROM rfi_replies WHERE rfiId = ? ORDER BY id').all(row.id),
          attachments: db.prepare('SELECT id, fileName, mime, size, uploadedBy, createdAt FROM attachments WHERE rfiId = ?').all(row.id),
        })),
      },
    });
  }

  // 一般登入
  if (!u || !u.password_hash || !verifyPassword(password || '', u.password_hash)) {
    return res.status(401).json({ error: '帳號或密碼錯誤' });
  }
  const t = db.prepare('SELECT name FROM tenants WHERE id = ?').get(u.tenantId) as any;
  res.json({ uid: u.uid, displayName: u.displayName, role: u.role, tenantId: u.tenantId, tenantName: t?.name || '', mustChange: (u.must_change || 0) === 1 });
});

// ---- 改密碼（含改帳號） ----
app.post('/api/v1/change-password', (req, res) => {
  const { account, oldPassword, newPassword, newUid } = req.body;
  if (!newPassword || newPassword.length < 4) return res.status(400).json({ error: '新密碼至少 4 碼' });
  const u = db.prepare('SELECT password_hash FROM users WHERE uid = ?').get(account) as any;
  if (!u || !verifyPassword(oldPassword || '', u.password_hash)) {
    return res.status(401).json({ error: '舊密碼錯誤' });
  }
  const t = db.transaction(() => {
    db.prepare('UPDATE users SET password_hash = ?, must_change = 0 WHERE uid = ?').run(hashPassword(newPassword), account);
    if (newUid && newUid.trim() && newUid.trim() !== account) {
      const n = (db.prepare('SELECT COUNT(*) AS c FROM users WHERE uid = ?').get(newUid.trim()) as any).c;
      if (n > 0) return res.status(409).json({ error: '帳號已存在' });
      db.prepare('UPDATE users SET uid = ? WHERE uid = ?').run(newUid.trim(), account);
      db.prepare('UPDATE kanban_tasks SET assignee = ? WHERE assignee = ?').run(newUid.trim(), account);
      db.prepare('UPDATE rfis SET askedBy = ? WHERE askedBy = ?').run(newUid.trim(), account);
      db.prepare('UPDATE rfis SET assignedTo = ? WHERE assignedTo = ?').run(newUid.trim(), account);
      db.prepare('UPDATE rfi_replies SET byUser = ? WHERE byUser = ?').run(newUid.trim(), account);
      db.prepare('UPDATE attachments SET uploadedBy = ? WHERE uploadedBy = ?').run(newUid.trim(), account);
    }
  });
  try {
    t();
    res.json({ ok: true, uid: newUid?.trim() || account });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ---- 看板 ----
app.get('/api/v1/kanban', (req, res) => {
  const { projectId } = req.query;
  const rows = projectId
    ? db.prepare('SELECT * FROM kanban_tasks WHERE tenantId = ? AND projectId = ?').all(TENANT, projectId)
    : db.prepare('SELECT * FROM kanban_tasks WHERE tenantId = ?').all(TENANT);
  res.json({ items: rows });
});
app.post('/api/v1/kanban', (req, res) => {
  const { projectId, title, description, assignee, priority, dueDate, column } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'title 必填' });
  const id = uid();
  db.prepare('INSERT INTO kanban_tasks (id, tenantId, projectId, title, description, assignee, priority, dueDate, col, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, TENANT, projectId || null, title.trim(), description || '', assignee || '未分配', priority || 'medium', dueDate || new Date().toISOString().split('T')[0], column || 'backlog', new Date().toISOString());
  res.status(201).json({ id });
});
app.patch('/api/v1/kanban/:id', (req, res) => {
  const cols = ['title', 'description', 'assignee', 'priority', 'dueDate', 'projectId'];
  const sets: string[] = [];
  const vals: any[] = [];
  if (req.body.column) { sets.push('col = ?'); vals.push(req.body.column); }
  cols.forEach((c) => { if (req.body[c] !== undefined) { sets.push(`${c} = ?`); vals.push(req.body[c]); } });
  if (sets.length === 0) return res.status(400).json({ error: '無可更新欄位' });
  const r = db.prepare(`UPDATE kanban_tasks SET ${sets.join(', ')} WHERE id = ? AND tenantId = ?`).run(...vals, req.params.id, TENANT);
  if (r.changes === 0) return res.status(404).json({ error: '找不到任務' });
  res.json({ ok: true });
});
app.delete('/api/v1/kanban/:id', (req, res) => {
  const r = db.prepare('DELETE FROM kanban_tasks WHERE id = ? AND tenantId = ?').run(req.params.id, TENANT);
  if (r.changes === 0) return res.status(404).json({ error: '找不到任務' });
  res.json({ ok: true });
});

// ---- RFI ----
function rfiDetail(row: any) {
  return {
    ...row,
    cc: J(row.cc), linkedDrawings: J(row.linkedDrawings),
    replies: db.prepare('SELECT byUser AS by, text, at FROM rfi_replies WHERE rfiId = ? ORDER BY id').all(row.id),
    attachments: db.prepare('SELECT id, fileName, mime, size, path, uploadedBy, createdAt FROM attachments WHERE rfiId = ?').all(row.id)
      .map((a: any) => ({ ...a, url: `/uploads/${path.basename(a.path)}` })),
  };
}
app.get('/api/v1/rfis', (req, res) => {
  const { projectId, status } = req.query;
  let sql = 'SELECT * FROM rfis WHERE tenantId = ?';
  const vals: any[] = [TENANT];
  if (projectId) { sql += ' AND projectId = ?'; vals.push(projectId); }
  if (status) { sql += ' AND status = ?'; vals.push(status); }
  const rows = (db.prepare(sql).all(...vals) as any[]).map(rfiDetail);
  res.json({ items: rows, total: rows.length });
});
app.get('/api/v1/rfis/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM rfis WHERE id = ? AND tenantId = ?').get(req.params.id, TENANT) as any;
  if (!row) return res.status(404).json({ error: '找不到 RFI' });
  res.json(rfiDetail(row));
});
app.post('/api/v1/rfis', (req, res) => {
  const { projectId, title, description, askedBy, assignedTo, dueDate, linkedDrawings, priority } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'title 必填' });
  const maxId = (db.prepare("SELECT id FROM rfis WHERE id LIKE 'RFI-%' ORDER BY id DESC LIMIT 1").get() as any)?.id;
  const next = `RFI-2026-${String((maxId ? parseInt(maxId.split('-').pop()!, 10) : 0) + 1).padStart(3, '0')}`;
  const now = new Date().toISOString();
  db.prepare('INSERT INTO rfis (id, tenantId, projectId, title, description, askedBy, assignedTo, cc, status, priority, dueDate, linkedDrawings, version, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(next, TENANT, projectId || null, title.trim(), description || '', askedBy || '', assignedTo || '未分配', '[]', 'open', priority || 'medium', dueDate || now.split('T')[0], JSON.stringify(linkedDrawings || []), 1, now);
  res.status(201).json({ id: next });
});
app.patch('/api/v1/rfis/:id', (req, res) => {
  const sets: string[] = [];
  const vals: any[] = [];
  ['title', 'description', 'assignedTo', 'status', 'priority', 'dueDate', 'projectId'].forEach((c) => {
    if (req.body[c] !== undefined) { sets.push(`${c} = ?`); vals.push(req.body[c]); }
  });
  if (req.body.cc !== undefined) { sets.push('cc = ?'); vals.push(JSON.stringify(req.body.cc)); }
  if (req.body.linkedDrawings !== undefined) { sets.push('linkedDrawings = ?'); vals.push(JSON.stringify(req.body.linkedDrawings)); }
  if (sets.length === 0) return res.status(400).json({ error: '無可更新欄位' });
  sets.push('version = version + 1');
  const r = db.prepare(`UPDATE rfis SET ${sets.join(', ')} WHERE id = ? AND tenantId = ?`).run(...vals, req.params.id, TENANT);
  if (r.changes === 0) return res.status(404).json({ error: '找不到 RFI' });
  res.json({ ok: true });
});
app.post('/api/v1/rfis/:id/replies', (req, res) => {
  const { by, text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'text 必填' });
  const row = db.prepare('SELECT id FROM rfis WHERE id = ? AND tenantId = ?').get(req.params.id, TENANT);
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
  const row = db.prepare('SELECT id FROM rfis WHERE id = ? AND tenantId = ?').get(req.params.id, TENANT) as any;
  if (!row) return res.status(404).json({ error: '找不到 RFI' });
  if (!req.file) return res.status(400).json({ error: '只收圖片（≤5MB）' });
  const n = (db.prepare('SELECT COUNT(*) AS c FROM attachments WHERE rfiId = ?').get(req.params.id) as any).c;
  if (n >= 10) return res.status(400).json({ error: '單 RFI 上限 10 件' });
  const id = uid();
  const ext = path.extname(req.file.originalname) || '.png';
  const final = path.join(path.dirname(req.file.path), `${id}${ext}`);
  fs.renameSync(req.file.path, final);
  db.prepare('INSERT INTO attachments (id, rfiId, fileName, mime, size, path, uploadedBy, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, req.params.id, req.file.originalname, req.file.mimetype, req.file.size, final, req.header('X-User-Id') || '', new Date().toISOString());
  res.status(201).json({ id, fileName: req.file.originalname, url: `/uploads/${id}${ext}` });
});

app.listen(PORT, () => console.log(`archclock-backend on :${PORT}`));
