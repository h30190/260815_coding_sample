# 第二章：安全規格書 (02_security.md)

本文件說明 ArchClock 的安全性設計、資料完整性驗證以及本地端安全規範。

---

## 1. 資料不變量與防竄改 (Data Invariants)

由於系統採用完全本地化儲存（`localStorage`），安全性控制主要在前端程式碼邏輯層進行驗證，以確保打卡日誌的完整性：

1. **唯一身份綁定**：使用者的打卡紀錄在寫入時會自動帶入目前登入使用者 (`archclock_user`) 的 `uid`。系統不提供在打卡介面修改或偽造 `userId` 的功能。
2. **打卡類型限制**：`type` 欄位必須嚴格限制為 `'clock_in'`（上班）或 `'clock_out'`（下班），不允許任意字串。
3. **不可編輯性 (Immutability)**：
   - 系統**不提供任何「修改」或「刪除」打卡紀錄的 UI 介面**。
   - 打卡歷史一旦寫入，即作為永久的唯讀稽核日誌 (Audit Log)。
4. **定位資料強校驗**：外點打卡強制開啟瀏覽器地理定位 (GPS) 取得經緯度，否則拒絕寫入。
5. **備註欄位限制**：為防範緩衝區溢位或本地存儲空間惡意撐爆，打卡備註與任務描述在輸入端皆進行字數上限限制。

---

## 2. 原 Firebase 安全規則對照 (Firebase Rules Transition)

若未來本專案需要遷移回真實資料庫，以下為原定安全規格與本地端實作邏輯對照：

| 安全規則需求 | 原 Firebase 安全規則 (Firestore Rules) | 本地端 Mock 實作邏輯 |
| :--- | :--- | :--- |
| **讀寫限制** | `request.auth.uid == userId` (僅能存取自己的資料) | 邏輯層過濾：透過 `localStorage` 讀取資料時，僅查詢符合目前 `uid` 的紀錄。 |
| **時間防偽** | `request.resource.data.timestamp == request.time` | 寫入時直接取用 `new Date().toISOString()`，不接受前端表單傳入自定義時間。 |
| **唯讀日誌** | 僅允許 `create`，拒絕 `update` 與 `delete` 權限。 | `addDoc` 僅有新增邏輯，程式中不提供任何 update/delete 的資料庫介面。 |

---

## 3. 本地端儲存安全防範 (LocalStorage Guidelines)

- **防範快取清除**：`localStorage` 資料在瀏覽器清除快取或使用特定清理軟體時可能遺失。建議在辦公室使用時，定期利用瀏覽器開發者工具匯出 `archclock_attendance` 與 `archclock_kanban_tasks` 作為備份。
- **敏感資訊防護**：本機端不儲存任何明文密碼，使用者設定檔僅記錄姓名、職級與辦公室。
