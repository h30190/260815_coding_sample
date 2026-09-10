/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ponytail: schema 與 docs/spec/06_data-multitenant.md 同步，改表結構先改文件。

import Database from 'better-sqlite3';
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
