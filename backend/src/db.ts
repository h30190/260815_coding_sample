/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ponytail: schema 與 docs/spec/06_data-multitenant.md 同步，改表結構先改文件。

import Database from 'better-sqlite3';
import { scryptSync, randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(path.join(DATA_DIR, 'uploads'), { recursive: true });

export const db = new Database(path.join(DATA_DIR, 'archclock.db'));

db.exec(`
CREATE TABLE IF NOT EXISTS tenants (id TEXT PRIMARY KEY, name TEXT NOT NULL, office TEXT);
CREATE TABLE IF NOT EXISTS users (uid TEXT PRIMARY KEY, tenantId TEXT NOT NULL, displayName TEXT, email TEXT, role TEXT, office TEXT,
  FOREIGN KEY (tenantId) REFERENCES tenants(id));
CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, name TEXT, code TEXT, status TEXT);
CREATE TABLE IF NOT EXISTS kanban_tasks (id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, projectId TEXT,
  title TEXT, description TEXT, assignee TEXT, priority TEXT, dueDate TEXT, col TEXT, createdAt TEXT);
CREATE TABLE IF NOT EXISTS rfis (id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, projectId TEXT,
  title TEXT, description TEXT, askedBy TEXT, assignedTo TEXT, cc TEXT,
  status TEXT, priority TEXT, dueDate TEXT, linkedDrawings TEXT, version INTEGER, createdAt TEXT);
CREATE TABLE IF NOT EXISTS rfi_replies (id INTEGER PRIMARY KEY AUTOINCREMENT, rfiId TEXT NOT NULL, byUser TEXT, text TEXT, at TEXT);
CREATE TABLE IF NOT EXISTS attachments (id TEXT PRIMARY KEY, rfiId TEXT NOT NULL, fileName TEXT, mime TEXT, size INTEGER,
  path TEXT, uploadedBy TEXT, createdAt TEXT);
CREATE INDEX IF NOT EXISTS idx_tasks_tenant ON kanban_tasks(tenantId, projectId);
CREATE INDEX IF NOT EXISTS idx_rfi_tenant ON rfis(tenantId, projectId, status);
`);

// ponytail: 密碼用 stdlib scrypt，不另加依賴；舊庫自動補欄位
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(':');
    return scryptSync(password, salt, 64).toString('hex') === hash;
  } catch {
    return false;
  }
}

const cols = db.prepare('PRAGMA table_info(users)').all() as { name: string }[];
if (!cols.some((c) => c.name === 'password_hash')) db.exec('ALTER TABLE users ADD COLUMN password_hash TEXT');
if (!cols.some((c) => c.name === 'must_change')) db.exec('ALTER TABLE users ADD COLUMN must_change INTEGER DEFAULT 0');

// 首啟動：沒有任何使用者就建預設管理員 admin/admin（首登強制改密碼）
const n = (db.prepare('SELECT COUNT(*) AS c FROM users').get() as any).c;
if (n === 0) {
  db.prepare('INSERT OR IGNORE INTO tenants (id, name, office) VALUES (?, ?, ?)').run('t-default', '預設租戶（請改名）', '');
  db.prepare('INSERT INTO users (uid, tenantId, displayName, email, role, office, password_hash, must_change) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
    'admin', 't-default', '管理員', '', 'admin', '', hashPassword('admin'), 1);
  console.log('已建立預設管理員 admin/admin（首登需改密碼）');
}
