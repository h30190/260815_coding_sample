# 後續開發路線圖 (Roadmap)

> 佔位範例已清除，以下為實際待辦，按依賴順序排列。

## Phase 1：專管後端（前後端分離）

- [ ] `backend/` Express + SQLite（better-sqlite3），schema 見 `docs/spec/06_data-multitenant.md`
- [ ] tenant middleware（`X-Tenant-Id` 強制過濾）+ `/api/v1` 端點（規格見 `05_api.md`）
- [ ] Vite proxy `/api → :3001`，`src/lib/api.ts` 前端客戶端

## Phase 2：RFI 與附件 UI

- [ ] `RFIBoard`：狀態機 open → answered → closed + 逾期紅標 + 版次歷史
- [ ] `AttachmentPaste`：Ctrl+V 貼圖預覽 + 拖拉上傳（前端 dataUrl，後端 multipart）
- [ ] `TenantSwitcher` + 指派下拉（同租戶使用者）

## Phase 3：教學與品質

- [x] 一鍵教學假資料（`src/lib/seed.ts`）+ `scripts/` 啟動腳本
- [ ] 修 `npm run lint` 3 個舊型別錯誤（MockAuth / User.role）
- [ ] 打卡匯出報表（CSV）

## 已知限制

- 附件教學版存 `dataUrl` 佔 localStorage 空間，正式版走後端 `uploads/`。
- `localStorage` 清快取即遺失，重要資料請先用 F12 匯出備份。
