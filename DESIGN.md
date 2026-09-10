# ArchClock 專案設計與樣式規範 (DESIGN.md)

本文件定義了 ArchClock 的設計原則、UI/UX 規範、配色系統、組件架構以及本地儲存的資料結構，以維護系統視覺與邏輯的一致性。

---

## 1. 設計原則 (Design Principles)

- **極簡與現代感 (Minimal & Modern)**：採用嚴謹的格線系統，以黑、白、灰（Neutral 灰階色調）為主軸，去除繁雜裝飾，強調字體排版（Typography）與留白。
- **建築師風格 (Architect-Themed)**：使用大寫粗體、寬字距（例如 `tracking-[0.3em]`、`tracking-widest`）的無襯線字體，呈現乾淨俐落的圖紙與工程設計質感。
- **流暢與動態 (Fluid Motion)**：使用 `motion/react` (Framer Motion) 實現微互動動畫（分頁切換、卡片進入、彈窗縮放），讓單機版網頁具有原生軟體般的精緻反饋。

---

## 2. 視覺規範與樣式 (UI Style Guide)

### 2.1 配色系統 (Color Palette)
- **主要背景**：`bg-neutral-50` (米灰色，營造舒適的閱讀底色)
- **卡片與區塊**：`bg-white` (純白)
- **邊框與格線**：`border-neutral-100` / `border-neutral-200`
- **主要文字 / 按鈕**：`text-neutral-900` / `bg-neutral-900`
- **輔助狀態色**：
  - **上班/完成**：`text-green-600` / `bg-green-50` (綠色)
  - **進行中**：`text-blue-600` / `bg-blue-50` (藍色)
  - **審核中 / 中級優先度**：`text-amber-600` / `bg-amber-50` (琥珀色)
  - **高級優先度**：`text-red-700` / `bg-red-50` (紅色)

### 2.2 響應式排版 (Responsive Layout)
- **窄版置中模式 (`max-w-4xl`)**：用於「打卡面板」與「工時統計」分頁。聚焦單一內容，視覺效果緊湊。
- **寬版滿幅模式 (`max-w-7xl`)**：用於「專案管理 (Kanban)」分頁。提供四個橫向看板欄位充足的橫向展佈空間，避免卡片過度擠壓。
- **寬度切換動畫**：在切換分頁時，外層容器的寬度變化會伴隨 `transition-all duration-300` 動畫，營造流暢的視覺縮放感。

---

## 3. 組件架構與功能 (Components Guide)

### 3.1 主控台 (`src/App.tsx`)
- **功能**：系統狀態管理者。負責本地登入認證狀態追蹤、登出，並提供頂部的 Tab 切換（打卡與記錄、工時統計、專案管理）。

### 3.2 打卡面板 (`src/components/ClockPanel.tsx`)
- **功能**：提供上班打卡 (Clock In) 與下班打卡 (Clock Out) 功能。
- **互動**：支援開關「外點打卡 (Field Site)」以輸入工地名稱，並可填寫備註。會請求瀏覽器 GPS 定位資訊以記錄經緯度。

### 3.3 近期打卡清單 (`src/components/AttendanceList.tsx`)
- **功能**：以時間倒序展示最近的 20 筆打卡紀錄。上班以綠色線條指示，下班以灰色指示。

### 3.4 工時計算器 (`src/components/WorkHoursCalculator.tsx`)
- **功能**：自動加總今日與本週總工時，並分日列出上下班時間與工時明細。
- **邏輯**：如果當天只有上班打卡尚未下班，會自動將當前時間納入累計計算，並標示 `計算中 (已登入)`。

### 3.5 專案看板 (`src/components/KanbanBoard.tsx`)
- **功能**：支援待處理、進行中、審核中、已完成的任務管理。
- **互動**：支持 HTML5 拖拉卡片移動，並提供卡片底部的「推進/退回」快速按鈕。

---

## 4. 本地儲存資料結構 (Local Storage Schema)

所有資料完全儲存於本機瀏覽器的 `localStorage` 中：

### 4.1 登入使用者 (`archclock_user`)
```json
{
  "uid": "local-user-id",
  "displayName": "James Peng",
  "email": "local@office.lan",
  "role": "architect",
  "office": "台北總部"
}
```

### 4.2 打卡歷史紀錄 (`archclock_attendance`)
```json
[
  {
    "id": "abc1234",
    "userId": "local-user-id",
    "timestamp": "2026-08-15T09:00:00.000Z",
    "type": "clock_in",
    "isField": false,
    "location": {
      "latitude": 25.033,
      "longitude": 121.565,
      "accuracy": 15,
      "siteName": "Office"
    },
    "note": "準時上班"
  }
]
```

### 4.3 看板任務 (`archclock_kanban_tasks`)
```json
[
  {
    "id": "xyz7890",
    "title": "設計圖面繪製",
    "description": "繪製一樓平面圖",
    "assignee": "James Peng",
    "priority": "high",
    "dueDate": "2026-08-20",
    "column": "in_progress",
    "createdAt": "2026-08-15T10:30:00.000Z"
  }
]
```

---

## 5. 教學假資料與專管延伸 (Seed & Supervision)

- **一鍵假資料**：`src/lib/seed.ts` 灌 2 租戶 / 6 使用者 / 3 專案 / 12 看板卡 / 8 RFI / 9 打卡；登入頁按鈕載入、頂欄 `Demo` 鈕重置（詳 `docs/spec/06_data-multitenant.md`）。
- **多租戶視覺**：租戶切換維持同套 Neutral 色系，僅以專案代號（`XY-101` 等）區分，避免多租戶用多色造成雜亂。
- **RFI 狀態色**：沿用既有語彙 — 逾期用高優先級紅（`text-red-700/bg-red-50`）、待確認用琥珀色、結案用綠色。
- **附件貼圖**：`Ctrl+V` 貼上即預覽縮圖，維持卡片式陰影與細邊框，不另開新視窗。
