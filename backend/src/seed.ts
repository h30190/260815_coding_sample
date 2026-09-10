/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from './db';
import { TENANTS, USERS, PROJECTS, TASKS, RFIS, REPLIES } from './seed-data';

export function runSeed(): { tenants: number; rfis: number; tasks: number } {
  const t = db.transaction(() => {
    db.exec('DELETE FROM attachments; DELETE FROM rfi_replies; DELETE FROM rfis; DELETE FROM kanban_tasks; DELETE FROM projects; DELETE FROM users; DELETE FROM tenants;');
    const insT = db.prepare('INSERT INTO tenants (id, name, office) VALUES (?, ?, ?)');
    const insU = db.prepare('INSERT INTO users (uid, tenantId, displayName, email, role, office) VALUES (?, ?, ?, ?, ?, ?)');
    const insP = db.prepare('INSERT INTO projects (id, tenantId, name, code, status) VALUES (?, ?, ?, ?, ?)');
    const insK = db.prepare('INSERT INTO kanban_tasks (id, tenantId, projectId, title, description, assignee, priority, dueDate, col, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const insR = db.prepare('INSERT INTO rfis (id, tenantId, projectId, title, description, askedBy, assignedTo, cc, status, priority, dueDate, linkedDrawings, version, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const insRep = db.prepare('INSERT INTO rfi_replies (rfiId, byUser, text, at) VALUES (?, ?, ?, ?)');
    TENANTS.forEach((x) => insT.run(x.id, x.name, x.office));
    USERS.forEach((x) => insU.run(x.uid, x.tenantId, x.displayName, x.email, x.role, x.office));
    PROJECTS.forEach((x) => insP.run(x.id, x.tenantId, x.name, x.code, x.status));
    TASKS.forEach((x) => insK.run(x.id, x.tenantId, x.projectId, x.title, x.description, x.assignee, x.priority, x.dueDate, x.col, x.createdAt));
    RFIS.forEach((x) => insR.run(x.id, x.tenantId, x.projectId, x.title, x.description, x.askedBy, x.assignedTo, JSON.stringify(x.cc), x.status, x.priority, x.dueDate, JSON.stringify(x.linkedDrawings), x.version, x.createdAt));
    REPLIES.forEach((x) => insRep.run(x.rfiId, x.byUser, x.text, x.at));
  });
  t();
  return { tenants: TENANTS.length, rfis: RFIS.length, tasks: TASKS.length };
}

// 直接執行 `npm run seed` 時灌資料
if (require.main === module) {
  console.log(runSeed());
}
