# 第三章：資料結構規格書 (03_data.md)

本文件定義專案內使用的資料結構、TypeScript 型別以及儲存在瀏覽器 `localStorage` 中的 JSON Schema。

---

## 1. 使用者個人檔案 (User Profile)

### 1.1 TypeScript 型別定義 (`src/types.ts`)
```typescript
export type UserRole = 'architect' | 'admin' | 'staff';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  office?: string;
}
```

### 1.2 LocalStorage 鍵值與格式
- **Key**: `archclock_user` (目前登入的使用者)
- **Key**: `archclock_users_[uid]` (已註冊的本地使用者檔案)
- **範例**:
```json
{
  "uid": "local-user-id",
  "displayName": "James Peng",
  "email": "local@office.lan",
  "role": "architect",
  "office": "Taipei Headquarters"
}
```

---

## 2. 打卡紀錄 (Attendance Record)

### 2.1 TypeScript 型別定義 (`src/types.ts`)
```typescript
export interface AttendanceLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  siteName?: string;
}

export interface AttendanceRecord {
  id?: string;
  userId: string;
  timestamp: any; // 本地轉換為 MockTimestamp 物件以提供 .toDate()
  type: 'clock_in' | 'clock_out';
  isField: boolean;
  location?: AttendanceLocation;
  note?: string;
}
```

### 2.2 LocalStorage 鍵值與格式
- **Key**: `archclock_attendance`
- **結構**: JSON 陣列 (Array)
- **範例**:
```json
[
  {
    "id": "q8fnd3a",
    "userId": "local-user-id",
    "timestamp": "2026-08-15T09:00:00.000Z",
    "type": "clock_in",
    "isField": true,
    "location": {
      "latitude": 25.033,
      "longitude": 121.565,
      "accuracy": 10,
      "siteName": "信義區建案工地"
    },
    "note": "今日上午巡檢"
  }
]
```

---

## 3. 看板任務 (Kanban Task)

### 3.1 元件內型別定義 (`src/components/KanbanBoard.tsx`)
```typescript
interface KanbanTask {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  column: 'backlog' | 'in_progress' | 'review' | 'done';
  createdAt: string;
}
```

### 3.2 LocalStorage 鍵值與格式
- **Key**: `archclock_kanban_tasks`
- **結構**: JSON 陣列 (Array)
- **範例**:
```json
[
  {
    "id": "x8y9z0a",
    "title": "結構技師會勘",
    "description": "與技師確認地下室剪力牆配筋",
    "assignee": "James Peng",
    "priority": "high",
    "dueDate": "2026-08-18",
    "column": "in_progress",
    "createdAt": "2026-08-15T12:00:00.000Z"
  }
]
```
