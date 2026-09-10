# 第五章：前後端分離 API 規格書 (05_api.md)

Base URL：前端 Vite `:3000`，後端 Express `:3001`，前端以 `/api/v1` 呼叫。

## 1. 通用約定

- Header：`X-Tenant-Id: t-taipei` 必填；後端 middleware 無此 header 回 `400`。
- 身分：教學版用 `X-User-Id: u-james` 簡化（不做 JWT）。
- 錯誤：`{ error: 'message' }` + HTTP 狀態碼。
- 分頁：`?limit=20&offset=0`，回 `{ items, total }`。

## 2. 端點一覽

| 方法 | 路徑 | 說明 |
| :--- | :--- | :--- |
| GET | /api/v1/tenants | 列出租戶 |
| GET | /api/v1/projects?tenantId= | 列出專案 |
| GET/POST | /api/v1/kanban?projectId= | 看板查詢/新增 |
| PATCH | /api/v1/kanban/:id | 搬欄/改指派 |
| GET/POST | /api/v1/rfis?projectId=&status= | RFI 查詢/新增 |
| PATCH | /api/v1/rfis/:id | 改狀態/版次+1 |
| POST | /api/v1/rfis/:id/replies | 加回覆 |
| POST | /api/v1/rfis/:id/attachments | 上傳附件（multipart） |
| POST | /api/v1/seed | 灌教學假資料（等同 seed.ts） |
| POST | /api/v1/reset | 清空重灌 |

## 3. 範例

新增 RFI：

```http
POST /api/v1/rfis
X-Tenant-Id: t-taipei
Content-Type: application/json

{ "projectId": "p-xy101", "title": "SW-3 開口補強", "askedBy": "James Peng",
  "assignedTo": "Ken Lu", "dueDate": "2026-09-16", "linkedDrawings": ["S2-101"] }
```

貼圖上傳（前端把剪貼簿轉 File 後送）：

```http
POST /api/v1/rfis/RFI-2026-001/attachments
X-Tenant-Id: t-taipei
Content-Type: multipart/form-data

file: <binary png> (≤5MB)
```

回覆：`{ items: [...], total: 8 }`，附件回 `{ id, fileName, url: "/uploads/<id>.png" }`。

## 4. 前端對接（教學）

- `src/lib/api.ts`（待建）：`fetch('/api/v1/rfis?projectId=...', { headers: { 'X-Tenant-Id': tenantId } })`。
- 開發期 Vite proxy：`server.proxy['/api'] = 'http://localhost:3001'`，正式版以後端 serve `dist/`。
