# 第四章：專管系統功能規格書 (04_supervision.md)

教學範本用，定義多租戶看板 + RFI 追蹤 + 附件貼圖 + 指派。

## 1. 多租戶 (Tenant)

- 租戶 = 公司/事務所。`tenantId` 為第一隔離鍵：`t-taipei`、`t-taichung`。
- 所有資料（專案、看板、RFI、附件、使用者）必填 `tenantId`。
- 前端用 `TenantSwitcher` 切換，後端用 `X-Tenant-Id` header + middleware 強制過濾。
- 教學假資料：2 租戶、6 使用者（見 `src/lib/seed.ts`）。

## 2. 專案 (Project)

- `id / tenantId / name / code / status`，如 `p-xy101 信義商辦新建工程`。
- 看板與 RFI 一律掛 `projectId`，跨專案不可互相參照。

## 3. 看板（延伸既有 KanbanBoard）

- 沿用四欄：`backlog / in_progress / review / done`，卡片加 `tenantId + projectId`。
- 指派：`assignee` 存人名（教學簡化），後端版存 `assigneeId`；卡片顯示負責人 + 到期日 + 優先級。
- 互動不變：拖拉 + 推進/退回按鈕。

## 4. RFI 追蹤（完整版）

欄位：`id (RFI-2026-001)、tenantId、projectId、title、description、askedBy、assignedTo、cc[]、status、priority、dueDate、linkedDrawings[]、version、replies[]、attachments[]`。

- 狀態機：`open（新提問）→ answered（已回覆待確認）→ closed（結案）`，逾期（`dueDate < today && status != closed`）前端標紅，即 `RFI-2026-005` demo 件。
- 版次：每次補充說明 `version+1`，舊回覆保留在 `replies[]`。
- 關聯圖說：`linkedDrawings` 如 `S2-101`，純字串以便教學。
- 驗收：8 筆假資料涵蓋 open/answered/closed/逾期各至少 1 件。

## 5. 附件貼圖 + 指派

- 支援 `Ctrl+V 貼圖` + 拖拉上傳，`AttachmentPaste` 元件讀 `clipboardData.files` 轉 `dataUrl` 預覽後上傳。
- 前端（localStorage 教學版）：附件存 `dataUrl`（1px 佔位圖 demo）；後端版：`multipart/form-data` 存 `backend/uploads/`，DB 只存路徑。
- 限制：圖片 `png/jpeg`、單檔 ≤5MB、單 RFI ≤10 件（教學常數）。
- 指派：RFI `assignedTo` 單一負責人，下拉選同租戶使用者。

## 成功標準

- 切租戶後看不到他租戶專案/RFI/看板。
- RFI-2026-005 顯示逾期紅標；貼圖可預覽；指派下拉只列同租戶人。
