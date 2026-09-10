# 第六章：多租戶資料規格書 (06_data-multitenant.md)

教學對照：前端 localStorage 鍵 = 後端 SQLite 表，同名同欄。

## 1. localStorage 鍵（`src/lib/seed.ts` 灌入）

| Key | 內容 | 筆數 |
| :--- | :--- | :--- |
| archclock_tenants | 2 租戶 | 2 |
| archclock_projects | 3 專案 | 3 |
| archclock_kanban_tasks | 看板 4 欄各 3 張 | 12 |
| archclock_rfi | 完整版 RFI | 8 |
| archclock_attendance | 本週打卡（週三外點） | 9 |
| archclock_users_* / archclock_user | 6 使用者 + 登入態 | 6+1 |

一鍵載入：登入頁「一鍵載入教學假資料」→ `seedDemoData()`；頂欄 `Demo` 鈕 → `resetDemoData()`。

## 2. SQLite Schema（後端實作時直接用）

```sql
CREATE TABLE tenants (id TEXT PRIMARY KEY, name TEXT NOT NULL, office TEXT);
CREATE TABLE users (uid TEXT PRIMARY KEY, tenantId TEXT NOT NULL, displayName TEXT, email TEXT, role TEXT, office TEXT,
  FOREIGN KEY (tenantId) REFERENCES tenants(id));
CREATE TABLE projects (id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, name TEXT, code TEXT, status TEXT);
CREATE TABLE kanban_tasks (id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, projectId TEXT NOT NULL,
  title TEXT, description TEXT, assignee TEXT, priority TEXT, dueDate TEXT, column TEXT, createdAt TEXT);
CREATE TABLE rfis (id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, projectId TEXT NOT NULL,
  title TEXT, description TEXT, askedBy TEXT, assignedTo TEXT, cc TEXT, -- JSON array
  status TEXT, priority TEXT, dueDate TEXT, linkedDrawings TEXT, version INTEGER, createdAt TEXT);
CREATE TABLE rfi_replies (id INTEGER PRIMARY KEY AUTOINCREMENT, rfiId TEXT NOT NULL, byUser TEXT, text TEXT, at TEXT);
CREATE TABLE attachments (id TEXT PRIMARY KEY, rfiId TEXT NOT NULL, fileName TEXT, mime TEXT, size INTEGER,
  path TEXT, uploadedBy TEXT, createdAt TEXT);
CREATE INDEX idx_tasks_tenant ON kanban_tasks(tenantId, projectId);
CREATE INDEX idx_rfi_tenant ON rfis(tenantId, projectId, status);
```

## 3. 隔離規則（必教）

- 所有 SELECT 必帶 `WHERE tenantId = ?`，由 tenant middleware 注入，不信任前端傳值。
- `seed.sql` 即 `seed.ts` 的 JSON 轉 INSERT，兩邊筆數一致以便對照教學。
- 附件檔名存 `uploads/<attachmentId>.<ext>`，不存原始路徑防 traversal。
