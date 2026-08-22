import { WarehouseItem, Visit, User, ActivityLogEntry, ArchivedVisit } from "@/types";

const D = (day: number) => `2026-08-${String(day).padStart(2, "0")}`;

export const demoWarehouseItems: WarehouseItem[] = [
  { id: "wh-d1", name: "لابتوب Dell Latitude 5540", category: "Laptop", serials: ["DL5540-001", "DL5540-002", "DL5540-003", "DL5540-004"], totalQty: 4, consumable: false },
  { id: "wh-d2", name: "لابتوب HP ProBook 450", category: "Laptop", serials: ["HP450-A1", "HP450-A2"], totalQty: 2, consumable: false },
  { id: "wh-d3", name: "لابتوب Lenovo ThinkPad E16", category: "Laptop", serials: ["LN-E16-01"], totalQty: 1, consumable: false },
  { id: "wh-d4", name: "شاشة HP P24h G4", category: "Monitor", serials: ["HPP24-101", "HPP24-102", "HPP24-103", "HPP24-104", "HPP24-105", "HPP24-106"], totalQty: 6, consumable: false },
  { id: "wh-d5", name: "شاشة Samsung S24R", category: "Monitor", serials: ["SMS24R-201", "SMS24R-202"], totalQty: 2, consumable: false },
  { id: "wh-d6", name: "طابعة HP LaserJet M404", category: "Printer", serials: ["HJM404-01"], totalQty: 1, consumable: false },
  { id: "wh-d7", name: "طابعة Canon LBP223", category: "Printer", serials: ["CN223-01", "CN223-02"], totalQty: 2, consumable: false },
  { id: "wh-d8", name: "محطة اتصال Dell WD19S", category: "Docking Station", serials: ["WD19S-01", "WD19S-02", "WD19S-03"], totalQty: 3, consumable: false },
  { id: "wh-d9", name: "لوحة مفاتيح Logitech K120", category: "Keyboard", totalQty: 14, consumable: false },
  { id: "wh-d10", name: "ماوس Dell MS116", category: "Mouse", totalQty: 20, consumable: false },
  { id: "wh-d11", name: "سماعة Jabra Evolve 20", category: "Headset", totalQty: 8, consumable: false },
  { id: "wh-d12", name: "محول Dell 65W USB-C", category: "Adapter", totalQty: 12, consumable: false },
  { id: "wh-d13", name: "كابل HDMI 2م", category: "Cable", totalQty: 25, consumable: true },
  { id: "wh-d14", name: "كابل شبكة CAT6 - 3م", category: "Cable", totalQty: 40, consumable: true },
  { id: "wh-d15", name: "ملصقات أصول مقاس 36×89", category: "Label", totalQty: 150, consumable: true },
];

const demoBoxItem = (
  whId: string,
  items: WarehouseItem[],
  qty: number,
  extra?: Partial<{ outSerials: string[]; returnedSerials: string[] }>
) => {
  const wh = items.find((w) => w.id === whId)!;
  return {
    warehouseItemId: wh.id,
    name: wh.name,
    category: wh.category,
    serialNumber: wh.serialNumber,
    serials: wh.serials,
    qty,
    originalQty: qty,
    consumable: wh.consumable,
    ...extra,
  };
};

export const demoVisits: Visit[] = [
  {
    id: "visit-d1",
    name: "زيارة فرع العليا",
    date: D(18),
    hijriDate: "1448/02/25",
    year: "1448",
    status: "active",
    boxes: [
      {
        id: "box-d1",
        name: "صندوق الأجهزة",
        label: "أجهزة رئيسية",
        items: [
          demoBoxItem("wh-d1", demoWarehouseItems, 4, { outSerials: ["DL5540-001", "DL5540-002"] }),
          demoBoxItem("wh-d8", demoWarehouseItems, 3, { outSerials: ["WD19S-01"] }),
          demoBoxItem("wh-d12", demoWarehouseItems, 4),
        ],
      },
      {
        id: "box-d2",
        name: "صندوق الملحقات",
        label: "ملحقات المكاتب",
        items: [
          demoBoxItem("wh-d9", demoWarehouseItems, 6),
          demoBoxItem("wh-d10", demoWarehouseItems, 8),
          demoBoxItem("wh-d11", demoWarehouseItems, 4),
          demoBoxItem("wh-d13", demoWarehouseItems, 10),
        ],
      },
    ],
  },
  {
    id: "visit-d2",
    name: "زيارة فرع الملز",
    date: D(21),
    hijriDate: "1448/02/28",
    year: "1448",
    status: "inactive",
    boxes: [
      {
        id: "box-d3",
        name: "صندوق الشاشات",
        label: undefined,
        items: [demoBoxItem("wh-d4", demoWarehouseItems, 6), demoBoxItem("wh-d5", demoWarehouseItems, 2)],
      },
      {
        id: "box-d4",
        name: "صندوق الطابعات",
        label: undefined,
        items: [demoBoxItem("wh-d6", demoWarehouseItems, 1), demoBoxItem("wh-d7", demoWarehouseItems, 2), demoBoxItem("wh-d14", demoWarehouseItems, 15)],
      },
    ],
  },
];

export const demoUsers: User[] = [
  { id: "user-1", name: "abnmazin", role: "developer", pin: "077077", active: true },
  { id: "user-d2", name: "ahmed.admin", role: "admin", pin: "123456", active: true },
  { id: "user-d3", name: "sara.member", role: "member", pin: "111222", active: true },
  { id: "user-d4", name: "khaled.viewer", role: "viewer", pin: "333444", active: false },
];

export const demoActivityLog: ActivityLogEntry[] = [
  { id: "act-d1", type: "activate_visit", description: "تفعيل زيارة: زيارة فرع العليا — 1448", userId: "user-1", userName: "abnmazin", timestamp: `${D(18)}T09:15:00.000Z`, visitId: "visit-d1" },
  { id: "act-d2", type: "fill_box", description: "تعبئة صندوق الأجهزة — لابتوب Dell Latitude 5540(4) + محطة اتصال Dell WD19S(3)", userId: "user-1", userName: "abnmazin", timestamp: `${D(17)}T13:40:00.000Z`, visitId: "visit-d1" },
  { id: "act-d3", type: "fill_box", description: "تعبئة صندوق الملحقات — ماوس Dell MS116(8) + كابل HDMI 2م(10)", userId: "user-d3", userName: "sara.member", timestamp: `${D(17)}T10:05:00.000Z`, visitId: "visit-d1" },
  { id: "act-d4", type: "add_item", description: "إضافة صنف للمخزن: شاشة Samsung S24R", userId: "user-1", userName: "abnmazin", timestamp: `${D(15)}T08:30:00.000Z` },
  { id: "act-d5", type: "complete_visit", description: "إنهاء زيارة: زيارة فرع النخيل", userId: "user-d2", userName: "ahmed.admin", timestamp: `${D(12)}T16:20:00.000Z` },
];

export const demoArchivedVisits: ArchivedVisit[] = [
  {
    id: "archive-d1",
    visitId: "visit-d0",
    name: "زيارة فرع النخيل",
    date: D(10),
    hijriDate: "1448/02/17",
    year: "1448",
    archivedAt: `${D(12)}T16:20:00.000Z`,
    boxes: [
      {
        id: "box-d0",
        name: "صندوق الأجهزة",
        label: undefined,
        items: [
          { ...demoBoxItem("wh-d2", demoWarehouseItems, 2), outSerials: ["HP450-A2"], qty: 1, returnedQty: 1, status: "missing" as const },
          { ...demoBoxItem("wh-d9", demoWarehouseItems, 4), returnedQty: 4, status: "returned" as const },
          { ...demoBoxItem("wh-d13", demoWarehouseItems, 8), qty: 5, originalQty: 8, returnedQty: 0, status: "consumed" as const },
        ],
      },
    ],
  },
];
