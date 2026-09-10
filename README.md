# ArchClock 教學範本

建築師事務所用的打卡 + 工時 + 看板專案管理系統，兼作開發教學範本：**完全本地化**（`localStorage`，無雲端連線），內建一鍵教學假資料。

## 技術棧

React 19 + TypeScript + Vite 6 ｜ Tailwind CSS + motion/react + Lucide ｜ 資料層 `src/lib/firebase.ts`（localStorage 模擬 Firestore API，日後可無痛切回真實資料庫）

## 快速開始

```bat
scripts\start-all.bat      # 一鍵啟動（後端 :3001 + 前端 :3000 + 開瀏覽器）
scripts\start-dev.bat      # 只開前端展示用（:3000）
scripts\start-backend.bat  # 只開後端（:3001，首次自動灌假資料）
scripts\start-preview.bat  # 驗收用（先 build 再 preview :4173）
```

或手動：`npm install` → `npm run dev`（`npm run build` 打包、`npm run lint` 型別檢查）。

## 教學假資料

登入頁按「**一鍵載入教學假資料**」（`src/lib/seed.ts`）：2 租戶、6 使用者、3 專案、12 張看板卡（4 欄各 3）、8 筆完整版 RFI（含逾期示範 `RFI-2026-005`）、9 筆打卡（含外點巡檢）。頂欄 `Demo` 鈕可一鍵重置。

## 文件索引

| 文件 | 內容 |
| :--- | :--- |
| `AGENTS.md` | 專案架構、規範、AI 助理運作準則 |
| `DESIGN.md` | 設計原則、配色、組件、儲存結構 |
| `docs/spec/01_functional.md` | 打卡、工時、看板功能規格 |
| `docs/spec/02_security.md` | 本地安全規則、Firebase 對照 |
| `docs/spec/03_data.md` | TypeScript 型別、localStorage schema |
| `docs/spec/04_supervision.md` | 專管系統：多租戶、RFI、附件貼圖、指派 |
| `docs/spec/05_api.md` | 前後端分離 REST API（Express + SQLite 規劃） |
| `docs/spec/06_data-multitenant.md` | 多租戶資料：localStorage 對照 SQLite schema |
| `docs/plan/README.md` | 後續開發路線圖 |

## 授權

Apache-2.0（修改程式碼時請保留既有 `@license` 宣告）。
