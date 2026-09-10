/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ponytail: 單一 seed 檔即教學範本全部假資料，localStorage 可直接 demo，之後 backend 直接吃同樣 JSON。

export interface DemoTenant {
  id: string;
  name: string;
  office: string;
}

export interface DemoUser extends DemoTenant {
  uid?: string;
}

export const DEMO_TENANTS: DemoTenant[] = [
  { id: 't-taipei', name: 'OO建築師事務所', office: 'Taipei Headquarters' },
  { id: 't-taichung', name: '台中分所', office: 'Taichung Office' },
];

const USERS = [
  { uid: 'u-james', displayName: 'James Peng', email: 'james@office.lan', role: 'architect', office: 'Taipei Headquarters', tenantId: 't-taipei' },
  { uid: 'u-mei', displayName: 'Mei Chen', email: 'mei@office.lan', role: 'admin', office: 'Taipei Headquarters', tenantId: 't-taipei' },
  { uid: 'u-ken', displayName: 'Ken Lu', email: 'ken@office.lan', role: 'staff', office: 'Taipei Headquarters', tenantId: 't-taipei' },
  { uid: 'u-alice', displayName: 'Alice Wang', email: 'alice@office.lan', role: 'architect', office: 'Taichung Office', tenantId: 't-taichung' },
  { uid: 'u-bob', displayName: 'Bob Lin', email: 'bob@office.lan', role: 'staff', office: 'Taichung Office', tenantId: 't-taichung' },
  { uid: 'u-carol', displayName: 'Carol Tsai', email: 'carol@office.lan', role: 'admin', office: 'Taichung Office', tenantId: 't-taichung' },
];

const PROJECTS = [
  { id: 'p-xy101', tenantId: 't-taipei', name: '信義商辦新建工程', code: 'XY-101', status: 'active' },
  { id: 'p-river', tenantId: 't-taipei', name: '河岸住宅大樓', code: 'RV-202', status: 'active' },
  { id: 'p-central', tenantId: 't-taichung', name: '台中車站共構案', code: 'TC-301', status: 'active' },
];

// 12 張看板卡：4 欄各 3 張，橫跨 2 租戶，assignee 用真實人名以便指派教學
const KANBAN = [
  { id: 'k001', tenantId: 't-taipei', projectId: 'p-xy101', title: '一樓平面圖繪製', description: '依 08/20 業主會議結論修正大廳動線', assignee: 'James Peng', priority: 'high', dueDate: '2026-09-18', column: 'backlog', createdAt: '2026-09-08T09:00:00.000Z' },
  { id: 'k002', tenantId: 't-taipei', projectId: 'p-xy101', title: '結構技師會勘', description: '確認 B1 剪力牆配筋', assignee: 'Ken Lu', priority: 'high', dueDate: '2026-09-16', column: 'backlog', createdAt: '2026-09-08T10:00:00.000Z' },
  { id: 'k003', tenantId: 't-taichung', projectId: 'p-central', title: '月台層天花檢討', description: '淨高需維持 300cm 以上', assignee: 'Alice Wang', priority: 'medium', dueDate: '2026-09-20', column: 'backlog', createdAt: '2026-09-08T11:00:00.000Z' },
  { id: 'k004', tenantId: 't-taipei', projectId: 'p-xy101', title: '帷幕牆節點大樣', description: '轉角柱 CW-07 收頭', assignee: 'James Peng', priority: 'medium', dueDate: '2026-09-17', column: 'in_progress', createdAt: '2026-09-07T09:00:00.000Z' },
  { id: 'k005', tenantId: 't-taipei', projectId: 'p-river', title: '廚房給排水套圖', description: '與水電技師對圖', assignee: 'Mei Chen', priority: 'medium', dueDate: '2026-09-15', column: 'in_progress', createdAt: '2026-09-07T10:00:00.000Z' },
  { id: 'k006', tenantId: 't-taichung', projectId: 'p-central', title: '消防排煙檢討表', description: '依建技規 §101 填寫有效開口', assignee: 'Bob Lin', priority: 'high', dueDate: '2026-09-14', column: 'in_progress', createdAt: '2026-09-06T09:00:00.000Z' },
  { id: 'k007', tenantId: 't-taipei', projectId: 'p-river', title: '外牆磁磚送審', description: '二丁掛 3 色版送業主選樣', assignee: 'Ken Lu', priority: 'low', dueDate: '2026-09-19', column: 'review', createdAt: '2026-09-05T09:00:00.000Z' },
  { id: 'k008', tenantId: 't-taipei', projectId: 'p-xy101', title: 'B2 機電管線綜合圖', description: '管上緣需留 10cm 維修空間', assignee: 'Mei Chen', priority: 'medium', dueDate: '2026-09-13', column: 'review', createdAt: '2026-09-05T10:00:00.000Z' },
  { id: 'k009', tenantId: 't-taichung', projectId: 'p-central', title: '無障礙坡道修正', description: '坡度 1/12、扶手雙側', assignee: 'Alice Wang', priority: 'medium', dueDate: '2026-09-12', column: 'review', createdAt: '2026-09-04T09:00:00.000Z' },
  { id: 'k010', tenantId: 't-taipei', projectId: 'p-xy101', title: '建照圖說彙整', description: 'A1 摺圖 + 目錄', assignee: 'James Peng', priority: 'low', dueDate: '2026-09-05', column: 'done', createdAt: '2026-09-01T09:00:00.000Z' },
  { id: 'k011', tenantId: 't-taipei', projectId: 'p-river', title: '日照陰影模擬', description: '冬至 9:00/12:00/15:00', assignee: 'Ken Lu', priority: 'low', dueDate: '2026-09-04', column: 'done', createdAt: '2026-09-01T10:00:00.000Z' },
  { id: 'k012', tenantId: 't-taichung', projectId: 'p-central', title: '月台門招標規範', description: 'L 章 03410 併入', assignee: 'Carol Tsai', priority: 'medium', dueDate: '2026-09-03', column: 'done', createdAt: '2026-09-01T11:00:00.000Z' },
];

// 完整版 RFI：含版次、圖說、回覆歷史、逾期 1 件、附件 2 件（1px 佔位圖供貼圖教學）
const TINY_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const RFI = [
  { id: 'RFI-2026-001', tenantId: 't-taipei', projectId: 'p-xy101', title: 'B1 剪力牆開口補強疑義', description: 'SW-3 新增 800x800 管線開口，請確認補強筋規格。', askedBy: 'James Peng', assignedTo: 'Ken Lu', cc: ['Mei Chen'], status: 'open', priority: 'high', dueDate: '2026-09-16', linkedDrawings: ['S2-101'], version: 1, createdAt: '2026-09-08T09:30:00.000Z', replies: [{ by: 'Ken Lu', text: '已轉結構技師，預計 9/15 回覆', at: '2026-09-09T10:00:00.000Z' }], attachments: [{ id: 'a001', fileName: 'SW-3開口.png', mime: 'image/png', size: 1203, dataUrl: TINY_PNG, uploadedBy: 'James Peng', createdAt: '2026-09-08T09:31:00.000Z' }] },
  { id: 'RFI-2026-002', tenantId: 't-taipei', projectId: 'p-xy101', title: '帷幕轉角收頭方式', description: 'CW-07 轉角是否可用 L 型一體成型？', askedBy: 'Mei Chen', assignedTo: 'James Peng', cc: [], status: 'answered', priority: 'medium', dueDate: '2026-09-14', linkedDrawings: ['CW-201'], version: 2, createdAt: '2026-09-05T14:00:00.000Z', replies: [{ by: 'James Peng', text: '可用，但需送樣確認陽極處理色差', at: '2026-09-06T09:00:00.000Z' }], attachments: [] },
  { id: 'RFI-2026-003', tenantId: 't-taipei', projectId: 'p-river', title: '廚房排水管徑不足？', description: 'K-廚房支管 75mm 與設備表 100mm 不符', askedBy: 'Ken Lu', assignedTo: 'Mei Chen', cc: ['James Peng'], status: 'open', priority: 'high', dueDate: '2026-09-13', linkedDrawings: ['M4-301'], version: 1, createdAt: '2026-09-07T11:00:00.000Z', replies: [], attachments: [{ id: 'a002', fileName: '排水疑義.png', mime: 'image/png', size: 980, dataUrl: TINY_PNG, uploadedBy: 'Ken Lu', createdAt: '2026-09-07T11:01:00.000Z' }] },
  { id: 'RFI-2026-004', tenantId: 't-taipei', projectId: 'p-river', title: '磁磚色號確認', description: '二丁掛 A/B/C 三色請業主擇一', askedBy: 'Mei Chen', assignedTo: 'James Peng', cc: [], status: 'closed', priority: 'low', dueDate: '2026-09-05', linkedDrawings: ['A9-501'], version: 1, createdAt: '2026-09-01T09:00:00.000Z', replies: [{ by: 'James Peng', text: '業主選 B 色，已通知廠商', at: '2026-09-04T15:00:00.000Z' }], attachments: [] },
  { id: 'RFI-2026-005', tenantId: 't-taichung', projectId: 'p-central', title: '月台天花淨高不足', description: '風管底緣僅 285cm，不符 300cm 需求', askedBy: 'Alice Wang', assignedTo: 'Bob Lin', cc: ['Carol Tsai'], status: 'open', priority: 'high', dueDate: '2026-08-30', linkedDrawings: ['M2-110'], version: 3, createdAt: '2026-08-28T09:00:00.000Z', replies: [{ by: 'Bob Lin', text: '風管改扁管，本週提修正版', at: '2026-08-29T10:00:00.000Z' }], attachments: [] },
  { id: 'RFI-2026-006', tenantId: 't-taichung', projectId: 'p-central', title: '無障礙坡道扶手高度', description: '現況 75cm，法規需 75+85 雙層？', askedBy: 'Bob Lin', assignedTo: 'Alice Wang', cc: [], status: 'answered', priority: 'medium', dueDate: '2026-09-12', linkedDrawings: ['A1-120'], version: 1, createdAt: '2026-09-06T13:00:00.000Z', replies: [{ by: 'Alice Wang', text: '是，雙層扶手，詳圖已補', at: '2026-09-07T09:00:00.000Z' }], attachments: [] },
  { id: 'RFI-2026-007', tenantId: 't-taipei', projectId: 'p-xy101', title: 'B2 管線維修空間', description: '管上緣距梁下僅 5cm，建議改道', askedBy: 'James Peng', assignedTo: 'Mei Chen', cc: [], status: 'open', priority: 'medium', dueDate: '2026-09-18', linkedDrawings: ['M1-201'], version: 1, createdAt: '2026-09-09T08:00:00.000Z', replies: [], attachments: [] },
  { id: 'RFI-2026-008', tenantId: 't-taichung', projectId: 'p-central', title: '月台門供電迴路', description: 'PSD-3 迴路與台鐵既有是否共用？', askedBy: 'Carol Tsai', assignedTo: 'Bob Lin', cc: ['Alice Wang'], status: 'open', priority: 'medium', dueDate: '2026-09-19', linkedDrawings: ['E3-410'], version: 1, createdAt: '2026-09-09T09:00:00.000Z', replies: [], attachments: [] },
];

// 本週一 ~ 五每天一對 clock_in/out，給工時統計 demo 用（含 1 筆外點）
function buildAttendance(): any[] {
  const days = ['2026-09-07', '2026-09-08', '2026-09-09', '2026-09-10'];
  const rows: any[] = [];
  days.forEach((d, i) => {
    const field = i === 2; // 週三外點巡檢
    rows.push({ id: `att${i}a`, userId: 'u-james', timestamp: `${d}T09:00:00.000Z`, type: 'clock_in', isField: field, location: { latitude: 25.033 + i * 0.001, longitude: 121.565, accuracy: 12, siteName: field ? '信義工地' : 'Office' }, note: field ? '工地巡檢' : '準時上班' });
    rows.push({ id: `att${i}b`, userId: 'u-james', timestamp: `${d}T18:00:00.000Z`, type: 'clock_out', isField: field, location: { latitude: 25.033, longitude: 121.565, accuracy: 12, siteName: field ? '信義工地' : 'Office' }, note: '' });
  });
  // 另補一筆 local-user-id 讓舊版單機帳號也有工時可看
  rows.push({ id: 'attXa', userId: 'local-user-id', timestamp: '2026-09-10T09:00:00.000Z', type: 'clock_in', isField: false, location: { latitude: 25.033, longitude: 121.565, accuracy: 15, siteName: 'Office' }, note: '教學 demo' });
  return rows;
}

export function seedDemoData(): void {
  localStorage.setItem('archclock_tenants', JSON.stringify(DEMO_TENANTS));
  localStorage.setItem('archclock_projects', JSON.stringify(PROJECTS));
  localStorage.setItem('archclock_kanban_tasks', JSON.stringify(KANBAN));
  localStorage.setItem('archclock_rfi', JSON.stringify(RFI));
  localStorage.setItem('archclock_attendance', JSON.stringify(buildAttendance()));
  // 使用者檔：新版 uid + 舊版 local-user-id 並存，教學時兩種登入都看得到資料
  USERS.forEach((u) => localStorage.setItem(`archclock_users_${u.uid}`, JSON.stringify(u)));
  const james = USERS[0];
  localStorage.setItem('archclock_users_local-user-id', JSON.stringify({ ...james, uid: 'local-user-id' }));
  if (!localStorage.getItem('archclock_user')) {
    localStorage.setItem('archclock_user', JSON.stringify({ uid: 'u-james', displayName: james.displayName, email: james.email, role: james.role, office: james.office }));
  }
  localStorage.setItem('archclock_seed_version', 'seed-demo-v1');
}

export function resetDemoData(): void {
  ['archclock_tenants', 'archclock_projects', 'archclock_kanban_tasks', 'archclock_rfi', 'archclock_attendance', 'archclock_seed_version'].forEach((k) => localStorage.removeItem(k));
  seedDemoData();
}

export function isSeeded(): boolean {
  return localStorage.getItem('archclock_seed_version') === 'seed-demo-v1';
}
