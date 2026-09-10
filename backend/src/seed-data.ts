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
  { uid: 'dev', tenantId: 't-default', displayName: 'Developer', email: '', role: 'admin', office: '' },
  { uid: 'admin', tenantId: 't-default', displayName: 'Admin', email: '', role: 'admin', office: '' },
  { uid: 'u-james', tenantId: 't-default', displayName: 'James Peng', email: 'james@office.lan', role: 'architect', office: 'Taipei Headquarters' },
  { uid: 'u-mei', tenantId: 't-default', displayName: 'Mei Chen', email: 'mei@office.lan', role: 'admin', office: 'Taipei Headquarters' },
  { uid: 'u-ken', tenantId: 't-default', displayName: 'Ken Lu', email: 'ken@office.lan', role: 'staff', office: 'Taipei Headquarters' },
  { uid: 'u-alice', tenantId: 't-default', displayName: 'Alice Wang', email: 'alice@office.lan', role: 'architect', office: 'Taipei Headquarters' },
  { uid: 'u-bob', tenantId: 't-default', displayName: 'Bob Lin', email: 'bob@office.lan', role: 'staff', office: 'Taipei Headquarters' },
  { uid: 'u-carol', tenantId: 't-default', displayName: 'Carol Tsai', email: 'carol@office.lan', role: 'architect', office: 'Taipei Headquarters' },
];

export const PROJECTS = [
  { id: 'p-xy101', tenantId: 't-default', name: '信義商辦新建工程', code: 'XY-101', status: 'active' },
  { id: 'p-river', tenantId: 't-default', name: '河岸住宅大樓', code: 'RV-202', status: 'active' },
  { id: 'p-metro', tenantId: 't-default', name: '捷運聯開案', code: 'MT-301', status: 'active' },
  { id: 'p-school', tenantId: 't-default', name: '國小改建工程', code: 'SC-401', status: 'active' },
];

export const TASKS = [
  // ---- Backlog（6 張）----
  { id: 'k001', tenantId: 't-default', projectId: 'p-xy101', title: '一樓平面圖繪製', description: '依 08/20 業主會議結論修正大廳動線，新增訪客車道入口', assignee: 'James Peng', priority: 'high', dueDate: '2026-09-18', col: 'backlog', createdAt: '2026-09-08T09:00:00.000Z' },
  { id: 'k002', tenantId: 't-default', projectId: 'p-xy101', title: '結構技師會勘', description: '確認 B1 剪力牆配筋，結構技師 9/16 到場', assignee: 'Ken Lu', priority: 'high', dueDate: '2026-09-16', col: 'backlog', createdAt: '2026-09-08T10:00:00.000Z' },
  { id: 'k003', tenantId: 't-default', projectId: 'p-metro', title: '月台層天花檢討', description: '淨高需維持 300cm 以上，風管改扁管方案待確認', assignee: 'Alice Wang', priority: 'medium', dueDate: '2026-09-20', col: 'backlog', createdAt: '2026-09-08T11:00:00.000Z' },
  { id: 'k019', tenantId: 't-default', projectId: 'p-school', title: '耐震補強圖說', description: '依 2025 耦規重新檢討柱斷面', assignee: 'Carol Tsai', priority: 'high', dueDate: '2026-09-22', col: 'backlog', createdAt: '2026-09-10T09:00:00.000Z' },
  { id: 'k020', tenantId: 't-default', projectId: 'p-xy101', title: '景觀設計競圖', description: '廣場植栽、鋪面、水景三組方案', assignee: 'Alice Wang', priority: 'low', dueDate: '2026-09-25', col: 'backlog', createdAt: '2026-09-10T10:00:00.000Z' },
  { id: 'k021', tenantId: 't-default', projectId: 'p-river', title: '外牆石材招標規範', description: '乾掛石材 L 章 04420 編寫', assignee: 'Bob Lin', priority: 'medium', dueDate: '2026-09-24', col: 'backlog', createdAt: '2026-09-10T11:00:00.000Z' },

  // ---- In Progress（5 張）----
  { id: 'k004', tenantId: 't-default', projectId: 'p-xy101', title: '帷幕牆節點大樣', description: '轉角柱 CW-07 收頭，需考慮熱斷橋', assignee: 'James Peng', priority: 'medium', dueDate: '2026-09-17', col: 'in_progress', createdAt: '2026-09-07T09:00:00.000Z' },
  { id: 'k005', tenantId: 't-default', projectId: 'p-river', title: '廚房給排水套圖', description: '與水電技師對圖，排水管徑需升級 100mm', assignee: 'Mei Chen', priority: 'medium', dueDate: '2026-09-15', col: 'in_progress', createdAt: '2026-09-07T10:00:00.000Z' },
  { id: 'k006', tenantId: 't-default', projectId: 'p-school', title: '消防排煙檢討表', description: '依建技規 §101 填寫有效開口，無窗居室需設排煙設備', assignee: 'Ken Lu', priority: 'high', dueDate: '2026-09-14', col: 'in_progress', createdAt: '2026-09-06T09:00:00.000Z' },
  { id: 'k016', tenantId: 't-default', projectId: 'p-metro', title: '機電管線綜合圖', description: 'B2 機電層管線排列，管上緣需留 10cm 維修空間', assignee: 'Bob Lin', priority: 'medium', dueDate: '2026-09-19', col: 'in_progress', createdAt: '2026-09-09T09:00:00.000Z' },
  { id: 'k017', tenantId: 't-default', projectId: 'p-xy101', title: '結構計算書修正', description: '地震力重新計算，係數由 0.24 調為 0.28', assignee: 'Carol Tsai', priority: 'high', dueDate: '2026-09-16', col: 'in_progress', createdAt: '2026-09-09T10:00:00.000Z' },

  // ---- Review（5 張）----
  { id: 'k007', tenantId: 't-default', projectId: 'p-river', title: '外牆磁磚送審', description: '二丁掛 3 色版送業主選樣，需附施工樣板', assignee: 'Ken Lu', priority: 'low', dueDate: '2026-09-19', col: 'review', createdAt: '2026-09-05T09:00:00.000Z' },
  { id: 'k008', tenantId: 't-default', projectId: 'p-xy101', title: 'B2 機電管線綜合圖', description: '管上緣需留 10cm 維修空間，消防管優先', assignee: 'Mei Chen', priority: 'medium', dueDate: '2026-09-13', col: 'review', createdAt: '2026-09-05T10:00:00.000Z' },
  { id: 'k009', tenantId: 't-default', projectId: 'p-school', title: '無障礙坡道修正', description: '坡度 1/12、扶手雙側、觸感警示帶', assignee: 'Alice Wang', priority: 'medium', dueDate: '2026-09-12', col: 'review', createdAt: '2026-09-04T09:00:00.000Z' },
  { id: 'k018', tenantId: 't-default', projectId: 'p-metro', title: '電梯規範審查', description: '直梯 2 台 + 搶救梯 1 台，速度 105m/min', assignee: 'Carol Tsai', priority: 'medium', dueDate: '2026-09-18', col: 'review', createdAt: '2026-09-09T11:00:00.000Z' },
  { id: 'k022', tenantId: 't-default', projectId: 'p-river', title: '陽台欄杆計算', description: '水平荷重 75kg/m，需結構技師簽證', assignee: 'Bob Lin', priority: 'high', dueDate: '2026-09-15', col: 'review', createdAt: '2026-09-10T14:00:00.000Z' },

  // ---- Done（6 張）----
  { id: 'k010', tenantId: 't-default', projectId: 'p-xy101', title: '建照圖說彙整', description: 'A1 摺圖 + 目錄，已送都發局', assignee: 'James Peng', priority: 'low', dueDate: '2026-09-05', col: 'done', createdAt: '2026-09-01T09:00:00.000Z' },
  { id: 'k011', tenantId: 't-default', projectId: 'p-river', title: '日照陰影模擬', description: '冬至 9:00/12:00/15:00 三時段模擬，已過審', assignee: 'Ken Lu', priority: 'low', dueDate: '2026-09-04', col: 'done', createdAt: '2026-09-01T10:00:00.000Z' },
  { id: 'k012', tenantId: 't-default', projectId: 'p-metro', title: '月台門招標規範', description: 'L 章 03410 併入，PSD 規格已確認', assignee: 'Mei Chen', priority: 'medium', dueDate: '2026-09-03', col: 'done', createdAt: '2026-09-01T11:00:00.000Z' },
  { id: 'k013', tenantId: 't-default', projectId: 'p-school', title: '施工圍籬設計', description: '工地圍籬 + 安全網 + 防塵網，已完工', assignee: 'Bob Lin', priority: 'low', dueDate: '2026-09-02', col: 'done', createdAt: '2026-08-28T09:00:00.000Z' },
  { id: 'k014', tenantId: 't-default', projectId: 'p-xy101', title: '土壤報告審查', description: 'SPT N 值 30-50，中密度砂層，基礎可用筏基', assignee: 'Carol Tsai', priority: 'medium', dueDate: '2026-09-01', col: 'done', createdAt: '2026-08-25T09:00:00.000Z' },
  { id: 'k015', tenantId: 't-default', projectId: 'p-river', title: '都審簡報製作', description: '都審委員會簡報 30 頁，已通過', assignee: 'Alice Wang', priority: 'high', dueDate: '2026-09-06', col: 'done', createdAt: '2026-08-29T09:00:00.000Z' },
];

export interface SeedReply { rfiId: string; byUser: string; text: string; at: string; }

export const RFIS = [
  // ---- Open（4 筆）----
  { id: 'RFI-2026-001', tenantId: 't-default', projectId: 'p-xy101', title: 'B1 剪力牆開口補強疑義', description: 'SW-3 新增 800x800 管線開口，請確認補強筋規格。開口位置距柱面僅 40cm，需結構技師確認是否影響剪力傳遞。', askedBy: 'James Peng', assignedTo: 'Ken Lu', cc: ['Mei Chen'], status: 'open', priority: 'high', dueDate: '2026-09-16', linkedDrawings: ['S2-101'], version: 1, createdAt: '2026-09-08T09:30:00.000Z' },
  { id: 'RFI-2026-003', tenantId: 't-default', projectId: 'p-river', title: '廚房排水管徑不足？', description: 'K-廚房支管 75mm 與設備表 100mm 不符，需確認是否為圖說錯誤或業主變更設備。', askedBy: 'Ken Lu', assignedTo: 'Mei Chen', cc: ['James Peng'], status: 'open', priority: 'high', dueDate: '2026-09-13', linkedDrawings: ['M4-301'], version: 1, createdAt: '2026-09-07T11:00:00.000Z' },
  { id: 'RFI-2026-007', tenantId: 't-default', projectId: 'p-xy101', title: 'B2 管線維修空間', description: '管上緣距梁下僅 5cm，建議改道或降板。若降板需結構技師同意。', askedBy: 'James Peng', assignedTo: 'Mei Chen', cc: [], status: 'open', priority: 'medium', dueDate: '2026-09-18', linkedDrawings: ['M1-201'], version: 1, createdAt: '2026-09-09T08:00:00.000Z' },
  { id: 'RFI-2026-009', tenantId: 't-default', projectId: 'p-metro', title: '月台門供電迴路', description: 'PSD-3 迴路與台鐵既有是否共用？若共用需評估跳脫影響。', askedBy: 'Mei Chen', assignedTo: 'Bob Lin', cc: ['Alice Wang'], status: 'open', priority: 'medium', dueDate: '2026-09-19', linkedDrawings: ['E3-410'], version: 1, createdAt: '2026-09-09T09:00:00.000Z' },
  { id: 'RFI-2026-010', tenantId: 't-default', projectId: 'p-school', title: '無障礙電梯淨深', description: '電梯廂淨深僅 140cm，法規需 150cm 以上，請確認是否為圖面標註錯誤。', askedBy: 'Alice Wang', assignedTo: 'Carol Tsai', cc: ['Ken Lu'], status: 'open', priority: 'high', dueDate: '2026-09-17', linkedDrawings: ['A5-201'], version: 1, createdAt: '2026-09-10T08:30:00.000Z' },
  { id: 'RFI-2026-011', tenantId: 't-default', projectId: 'p-river', title: '屋頂排水溝坡度', description: '女兒牆內排水溝坡度僅 0.5%，建議 1% 以上，需結構確認降板可行性。', askedBy: 'Bob Lin', assignedTo: 'James Peng', cc: [], status: 'open', priority: 'medium', dueDate: '2026-09-21', linkedDrawings: ['A3-601'], version: 1, createdAt: '2026-09-10T10:00:00.000Z' },

  // ---- Overdue（2 筆）----
  { id: 'RFI-2026-005', tenantId: 't-default', projectId: 'p-metro', title: '月台天花淨高不足', description: '風管底緣僅 285cm，不符 300cm 需求。已過期兩週，需儘速處理。', askedBy: 'Alice Wang', assignedTo: 'Ken Lu', cc: ['Mei Chen'], status: 'open', priority: 'high', dueDate: '2026-08-30', linkedDrawings: ['M2-110'], version: 3, createdAt: '2026-08-28T09:00:00.000Z' },
  { id: 'RFI-2026-012', tenantId: 't-default', projectId: 'p-xy101', title: '地下停車場淨高', description: 'B1 停車場風管底緣淨高 205cm，法規需 210cm。已逾期，需儘速修改風管配置。', askedBy: 'Ken Lu', assignedTo: 'Bob Lin', cc: ['James Peng'], status: 'open', priority: 'high', dueDate: '2026-09-05', linkedDrawings: ['M1-102'], version: 2, createdAt: '2026-08-25T14:00:00.000Z' },

  // ---- Answered（3 筆）----
  { id: 'RFI-2026-002', tenantId: 't-default', projectId: 'p-xy101', title: '帷幕轉角收頭方式', description: 'CW-07 轉角是否可用 L 型一體成型？或分件接合？需考慮防水與施工性。', askedBy: 'Mei Chen', assignedTo: 'James Peng', cc: [], status: 'answered', priority: 'medium', dueDate: '2026-09-14', linkedDrawings: ['CW-201'], version: 2, createdAt: '2026-09-05T14:00:00.000Z' },
  { id: 'RFI-2026-006', tenantId: 't-default', projectId: 'p-school', title: '無障礙坡道扶手高度', description: '現況 75cm，法規需 75+85 雙層？需確認適用版本。', askedBy: 'Ken Lu', assignedTo: 'Alice Wang', cc: [], status: 'answered', priority: 'medium', dueDate: '2026-09-12', linkedDrawings: ['A1-120'], version: 1, createdAt: '2026-09-06T13:00:00.000Z' },
  { id: 'RFI-2026-013', tenantId: 't-default', projectId: 'p-river', title: '陽台欄杆高度爭議', description: '圖面標 110cm，但業主要求 120cm，需結構技師確認荷重差異。', askedBy: 'Bob Lin', assignedTo: 'Carol Tsai', cc: ['James Peng'], status: 'answered', priority: 'medium', dueDate: '2026-09-16', linkedDrawings: ['A2-301'], version: 2, createdAt: '2026-09-07T11:00:00.000Z' },

  // ---- Closed（3 筆）----
  { id: 'RFI-2026-004', tenantId: 't-default', projectId: 'p-river', title: '磁磚色號確認', description: '二丁掛 A/B/C 三色請業主擇一，已確認 B 色。', askedBy: 'Mei Chen', assignedTo: 'James Peng', cc: [], status: 'closed', priority: 'low', dueDate: '2026-09-05', linkedDrawings: ['A9-501'], version: 1, createdAt: '2026-09-01T09:00:00.000Z' },
  { id: 'RFI-2026-014', tenantId: 't-default', projectId: 'p-xy101', title: '石材背栓規格', description: '花崗岩背栓 M8x80，需確認抗拔力 ≥ 5kN。', askedBy: 'James Peng', assignedTo: 'Ken Lu', cc: [], status: 'closed', priority: 'low', dueDate: '2026-09-08', linkedDrawings: ['A8-201'], version: 1, createdAt: '2026-09-02T09:00:00.000Z' },
  { id: 'RFI-2026-015', tenantId: 't-default', projectId: 'p-metro', title: '站名牌字體', description: '台鐵標準字體 F 系列，與捷運 LOGO 併用需協調。', askedBy: 'Carol Tsai', assignedTo: 'Alice Wang', cc: ['Bob Lin'], status: 'closed', priority: 'low', dueDate: '2026-09-10', linkedDrawings: ['D1-001'], version: 1, createdAt: '2026-09-03T09:00:00.000Z' },
];

export const REPLIES: SeedReply[] = [
  { rfiId: 'RFI-2026-001', byUser: 'Ken Lu', text: '已轉結構技師，預計 9/15 回覆。開口距柱面 40cm 需加腋。', at: '2026-09-09T10:00:00.000Z' },
  { rfiId: 'RFI-2026-002', byUser: 'James Peng', text: '可用 L 型一體成型，但需送樣確認陽極處理色差，建議留 2mm 接縫。', at: '2026-09-06T09:00:00.000Z' },
  { rfiId: 'RFI-2026-004', byUser: 'James Peng', text: '業主選 B 色，已通知廠商備料，預計 9/10 前送樣板。', at: '2026-09-04T15:00:00.000Z' },
  { rfiId: 'RFI-2026-005', byUser: 'Ken Lu', text: '風管改扁管方案：300x200 → 500x150，風量不變。本週提修正版圖說。', at: '2026-08-29T10:00:00.000Z' },
  { rfiId: 'RFI-2026-005', byUser: 'Alice Wang', text: '同意扁管方案，請同步更新消防排煙量計算。', at: '2026-09-01T09:00:00.000Z' },
  { rfiId: 'RFI-2026-005', byUser: 'Ken Lu', text: '修正版圖說已上傳，請確認。', at: '2026-09-03T14:00:00.000Z' },
  { rfiId: 'RFI-2026-006', byUser: 'Alice Wang', text: '是，雙層扶手（75+85cm），詳圖已補至 A1-120a。', at: '2026-09-07T09:00:00.000Z' },
  { rfiId: 'RFI-2026-003', byUser: 'Mei Chen', text: '確認設備表已變更為 100mm 洗碗機，圖說需同步修正。', at: '2026-09-08T11:00:00.000Z' },
  { rfiId: 'RFI-2026-003', byUser: 'Ken Lu', text: '謝謝確認，已請工務所修正排水圖。', at: '2026-09-09T08:00:00.000Z' },
  { rfiId: 'RFI-2026-013', byUser: 'Carol Tsai', text: '結構計算：110cm → 120cm 水平荷重增加 9%，不影響結構安全。', at: '2026-09-08T10:00:00.000Z' },
  { rfiId: 'RFI-2026-013', byUser: 'Bob Lin', text: '已轉業主確認，業主同意 120cm。', at: '2026-09-09T09:00:00.000Z' },
];
