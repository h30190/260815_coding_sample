/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ponytail: 與前端 src/lib/seed.ts 同一份教學資料（後端只取專管範圍：租戶/使用者/專案/看板/RFI，打卡留在前端）。

export const TENANTS = [
  { id: 't-default', name: 'OO建築師事務所', office: 'Taipei Headquarters' },
];

export const USERS = [
  { uid: 'demo', tenantId: 't-default', displayName: 'Demo User', email: '', role: 'staff', office: '' },
  { uid: 'u-james', tenantId: 't-default', displayName: 'James Peng', email: 'james@office.lan', role: 'architect', office: 'Taipei Headquarters' },
  { uid: 'u-mei', tenantId: 't-default', displayName: 'Mei Chen', email: 'mei@office.lan', role: 'admin', office: 'Taipei Headquarters' },
  { uid: 'u-ken', tenantId: 't-default', displayName: 'Ken Lu', email: 'ken@office.lan', role: 'staff', office: 'Taipei Headquarters' },
];

export const PROJECTS = [
  { id: 'p-xy101', tenantId: 't-default', name: '信義商辦新建工程', code: 'XY-101', status: 'active' },
  { id: 'p-river', tenantId: 't-default', name: '河岸住宅大樓', code: 'RV-202', status: 'active' },
];

export const TASKS = [
  { id: 'k001', tenantId: 't-default', projectId: 'p-xy101', title: '一樓平面圖繪製', description: '依 08/20 業主會議結論修正大廳動線', assignee: 'James Peng', priority: 'high', dueDate: '2026-09-18', col: 'backlog', createdAt: '2026-09-08T09:00:00.000Z' },
  { id: 'k002', tenantId: 't-default', projectId: 'p-xy101', title: '結構技師會勘', description: '確認 B1 剪力牆配筋', assignee: 'Ken Lu', priority: 'high', dueDate: '2026-09-16', col: 'backlog', createdAt: '2026-09-08T10:00:00.000Z' },
  { id: 'k003', tenantId: 't-default', projectId: 'p-xy101', title: '月台層天花檢討', description: '淨高需維持 300cm 以上', assignee: 'James Peng', priority: 'medium', dueDate: '2026-09-20', col: 'backlog', createdAt: '2026-09-08T11:00:00.000Z' },
  { id: 'k004', tenantId: 't-default', projectId: 'p-xy101', title: '帷幕牆節點大樣', description: '轉角柱 CW-07 收頭', assignee: 'James Peng', priority: 'medium', dueDate: '2026-09-17', col: 'in_progress', createdAt: '2026-09-07T09:00:00.000Z' },
  { id: 'k005', tenantId: 't-default', projectId: 'p-river', title: '廚房給排水套圖', description: '與水電技師對圖', assignee: 'Mei Chen', priority: 'medium', dueDate: '2026-09-15', col: 'in_progress', createdAt: '2026-09-07T10:00:00.000Z' },
  { id: 'k006', tenantId: 't-default', projectId: 'p-river', title: '消防排煙檢討表', description: '依建技規 §101 填寫有效開口', assignee: 'Ken Lu', priority: 'high', dueDate: '2026-09-14', col: 'in_progress', createdAt: '2026-09-06T09:00:00.000Z' },
  { id: 'k007', tenantId: 't-default', projectId: 'p-river', title: '外牆磁磚送審', description: '二丁掛 3 色版送業主選樣', assignee: 'Ken Lu', priority: 'low', dueDate: '2026-09-19', col: 'review', createdAt: '2026-09-05T09:00:00.000Z' },
  { id: 'k008', tenantId: 't-default', projectId: 'p-xy101', title: 'B2 機電管線綜合圖', description: '管上緣需留 10cm 維修空間', assignee: 'Mei Chen', priority: 'medium', dueDate: '2026-09-13', col: 'review', createdAt: '2026-09-05T10:00:00.000Z' },
  { id: 'k009', tenantId: 't-default', projectId: 'p-river', title: '無障礙坡道修正', description: '坡度 1/12、扶手雙側', assignee: 'James Peng', priority: 'medium', dueDate: '2026-09-12', col: 'review', createdAt: '2026-09-04T09:00:00.000Z' },
  { id: 'k010', tenantId: 't-default', projectId: 'p-xy101', title: '建照圖說彙整', description: 'A1 摺圖 + 目錄', assignee: 'James Peng', priority: 'low', dueDate: '2026-09-05', col: 'done', createdAt: '2026-09-01T09:00:00.000Z' },
  { id: 'k011', tenantId: 't-default', projectId: 'p-river', title: '日照陰影模擬', description: '冬至 9:00/12:00/15:00', assignee: 'Ken Lu', priority: 'low', dueDate: '2026-09-04', col: 'done', createdAt: '2026-09-01T10:00:00.000Z' },
  { id: 'k012', tenantId: 't-default', projectId: 'p-xy101', title: '月台門招標規範', description: 'L 章 03410 併入', assignee: 'Mei Chen', priority: 'medium', dueDate: '2026-09-03', col: 'done', createdAt: '2026-09-01T11:00:00.000Z' },
];

export interface SeedReply { rfiId: string; byUser: string; text: string; at: string; }

export const RFIS = [
  { id: 'RFI-2026-001', tenantId: 't-default', projectId: 'p-xy101', title: 'B1 剪力牆開口補強疑義', description: 'SW-3 新增 800x800 管線開口，請確認補強筋規格。', askedBy: 'James Peng', assignedTo: 'Ken Lu', cc: ['Mei Chen'], status: 'open', priority: 'high', dueDate: '2026-09-16', linkedDrawings: ['S2-101'], version: 1, createdAt: '2026-09-08T09:30:00.000Z' },
  { id: 'RFI-2026-002', tenantId: 't-default', projectId: 'p-xy101', title: '帷幕轉角收頭方式', description: 'CW-07 轉角是否可用 L 型一體成型？', askedBy: 'Mei Chen', assignedTo: 'James Peng', cc: [], status: 'answered', priority: 'medium', dueDate: '2026-09-14', linkedDrawings: ['CW-201'], version: 2, createdAt: '2026-09-05T14:00:00.000Z' },
  { id: 'RFI-2026-003', tenantId: 't-default', projectId: 'p-river', title: '廚房排水管徑不足？', description: 'K-廚房支管 75mm 與設備表 100mm 不符', askedBy: 'Ken Lu', assignedTo: 'Mei Chen', cc: ['James Peng'], status: 'open', priority: 'high', dueDate: '2026-09-13', linkedDrawings: ['M4-301'], version: 1, createdAt: '2026-09-07T11:00:00.000Z' },
  { id: 'RFI-2026-004', tenantId: 't-default', projectId: 'p-river', title: '磁磚色號確認', description: '二丁掛 A/B/C 三色請業主擇一', askedBy: 'Mei Chen', assignedTo: 'James Peng', cc: [], status: 'closed', priority: 'low', dueDate: '2026-09-05', linkedDrawings: ['A9-501'], version: 1, createdAt: '2026-09-01T09:00:00.000Z' },
  { id: 'RFI-2026-005', tenantId: 't-default', projectId: 'p-xy101', title: '月台天花淨高不足', description: '風管底緣僅 285cm，不符 300cm 需求', askedBy: 'James Peng', assignedTo: 'Ken Lu', cc: ['Mei Chen'], status: 'open', priority: 'high', dueDate: '2026-08-30', linkedDrawings: ['M2-110'], version: 3, createdAt: '2026-08-28T09:00:00.000Z' },
  { id: 'RFI-2026-006', tenantId: 't-default', projectId: 'p-river', title: '無障礙坡道扶手高度', description: '現況 75cm，法規需 75+85 雙層？', askedBy: 'Ken Lu', assignedTo: 'James Peng', cc: [], status: 'answered', priority: 'medium', dueDate: '2026-09-12', linkedDrawings: ['A1-120'], version: 1, createdAt: '2026-09-06T13:00:00.000Z' },
  { id: 'RFI-2026-007', tenantId: 't-default', projectId: 'p-xy101', title: 'B2 管線維修空間', description: '管上緣距梁下僅 5cm，建議改道', askedBy: 'James Peng', assignedTo: 'Mei Chen', cc: [], status: 'open', priority: 'medium', dueDate: '2026-09-18', linkedDrawings: ['M1-201'], version: 1, createdAt: '2026-09-09T08:00:00.000Z' },
  { id: 'RFI-2026-008', tenantId: 't-default', projectId: 'p-xy101', title: '月台門供電迴路', description: 'PSD-3 迴路與台鐵既有是否共用？', askedBy: 'Mei Chen', assignedTo: 'Ken Lu', cc: ['James Peng'], status: 'open', priority: 'medium', dueDate: '2026-09-19', linkedDrawings: ['E3-410'], version: 1, createdAt: '2026-09-09T09:00:00.000Z' },
];

export const REPLIES: SeedReply[] = [
  { rfiId: 'RFI-2026-001', byUser: 'Ken Lu', text: '已轉結構技師，預計 9/15 回覆', at: '2026-09-09T10:00:00.000Z' },
  { rfiId: 'RFI-2026-002', byUser: 'James Peng', text: '可用，但需送樣確認陽極處理色差', at: '2026-09-06T09:00:00.000Z' },
  { rfiId: 'RFI-2026-004', byUser: 'James Peng', text: '業主選 B 色，已通知廠商', at: '2026-09-04T15:00:00.000Z' },
  { rfiId: 'RFI-2026-005', byUser: 'Ken Lu', text: '風管改扁管，本週提修正版', at: '2026-08-29T10:00:00.000Z' },
  { rfiId: 'RFI-2026-006', byUser: 'James Peng', text: '是，雙層扶手，詳圖已補', at: '2026-09-07T09:00:00.000Z' },
];
