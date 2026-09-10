# HJPLUS.DESIGN 管理系統開發範例

用來展示前端工程實踐的開發範例專案：打卡、工時統計、看板專案管理、RFI 議題追蹤，前後端分離架構。

## 技術棧

- **前端**：React 19 + TypeScript + Vite 6 + Tailwind CSS + motion/react + Lucide
- **後端**：Express 4 + better-sqlite3（REST API，單租戶）
- **資料層**：localStorage（前端 fallback）+ SQLite（後端正式）

## 快速開始

```bat
scripts\start.bat           # 一鍵啟動（後端 :3001 + 前端 :3000 + 開瀏覽器）
```

或手動：`npm install` → `npm run dev`（`npm run build` 打包、`npm run lint` 型別檢查）。

## 帳號分流

| 帳號 | 密碼 | 說明 |
| :--- | :--- | :--- |
| `demo` | `demo` | 載入教學假資料到前端（localStorage） |
| `dev` | `dev` | 開發模式：後端有資料，前端從 API 拉，不自動塞 localStorage |
| `admin` | `admin` | 乾淨系統，首次登入強制改帳號密碼 |

## 教學假資料

`scripts\start.bat` 啟動時自動灌入：1 租戶、9 使用者、4 專案、22 張看板卡、15 筆 RFI（含逾期示範）、11 筆回覆。

## 文件索引

| 文件 | 內容 |
| :--- | :--- |
| `AGENTS.md` | 專案架構、規範、AI 助理運作準則 |
| `DESIGN.md` | 設計原則、配色、組件、儲存結構 |
| `docs/spec/` | 功能規格、API 設計、資料模型 |

## 授權

Apache-2.0（修改程式碼時請保留既有 `@license` 宣告）。
