import {
  WarehouseItem,
  Visit,
  User,
  ActivityLogEntry,
} from "@/types";

export const initialWarehouseItems: WarehouseItem[] = [
  { id: "wh-1", name: "Dell Latitude 5540", category: "Laptop", serialNumber: "IT-LAP-001", totalQty: 5 },
  { id: "wh-2", name: "MacBook Pro 14\"", category: "Laptop", serialNumber: "IT-LAP-010", totalQty: 3 },
  { id: "wh-3", name: "Dell U2723QE 27\"", category: "Monitor", serialNumber: "IT-MON-001", totalQty: 4 },
  { id: "wh-4", name: "HP LaserJet Pro", category: "Printer", serialNumber: "IT-PRT-001", totalQty: 2 },
  { id: "wh-5", name: "Zebra ZD421 Printer", category: "Printer", serialNumber: "IT-PRT-002", totalQty: 2 },
  { id: "wh-6", name: "USB-C Dock", category: "Docking Station", serialNumber: "IT-DOCK-001", totalQty: 6 },
  { id: "wh-7", name: "Logitech MX Keys", category: "Keyboard", totalQty: 15 },
  { id: "wh-8", name: "HP USB Keyboard", category: "Keyboard", totalQty: 12 },
  { id: "wh-9", name: "Logitech MX Master 3S", category: "Mouse", totalQty: 15 },
  { id: "wh-10", name: "Dell USB Optical Mouse", category: "Mouse", totalQty: 12 },
  { id: "wh-11", name: "3.5mm Headset Pro", category: "Headset", totalQty: 10 },
  { id: "wh-12", name: "Jabra Evolve2 75", category: "Headset", totalQty: 4 },
  { id: "wh-13", name: "USB-C to HDMI Cable", category: "Cable", totalQty: 20 },
  { id: "wh-14", name: "DisplayPort Cable 2m", category: "Cable", totalQty: 10 },
  { id: "wh-15", name: "Cat6 Ethernet 3m", category: "Cable", totalQty: 30 },
  { id: "wh-16", name: "Cat6 Ethernet 5m", category: "Cable", totalQty: 20 },
  { id: "wh-17", name: "Thunderbolt 4 Cable", category: "Cable", totalQty: 8 },
  { id: "wh-18", name: "USB-C to USB-A Adapter", category: "Adapter", totalQty: 20 },
  { id: "wh-19", name: "Laptop Charger 65W", category: "Adapter", totalQty: 12 },
  { id: "wh-20", name: "USB-C Hub 7-in-1", category: "Adapter", totalQty: 8 },
  { id: "wh-21", name: "USB Bluetooth Dongle", category: "Adapter", totalQty: 6 },
  { id: "wh-22", name: "Monitor Arm Clamp", category: "Adapter", totalQty: 4 },
  { id: "wh-23", name: "Asset Tag Labels (Roll)", category: "Label", totalQty: 50 },
  { id: "wh-24", name: "HDMI Cable 3m", category: "Cable", totalQty: 10 },
  { id: "wh-25", name: "SSD 500GB NVMe", category: "Laptop", totalQty: 8 },
  { id: "wh-26", name: "RAM DDR5 16GB", category: "Laptop", totalQty: 6 },
];

export const initialVisits: Visit[] = [
  {
    id: "visit-1",
    name: "زيارة النجف الأشرف — وفاة الإمام علي",
    date: "2026-07-10",
    status: "inactive",
    boxes: [
      {
        id: "box-1",
        name: "صندوق اللابتوبات",
        label: "مجموعات اللابتوب والمعدات",
        items: [
          { warehouseItemId: "wh-1", name: "Dell Latitude 5540", category: "Laptop", serialNumber: "IT-LAP-001", qty: 2 },
          { warehouseItemId: "wh-6", name: "USB-C Dock", category: "Docking Station", serialNumber: "IT-DOCK-001", qty: 2 },
          { warehouseItemId: "wh-7", name: "Logitech MX Keys", category: "Keyboard", qty: 2 },
          { warehouseItemId: "wh-9", name: "Logitech MX Master 3S", category: "Mouse", qty: 2 },
        ],
      },
      {
        id: "box-2",
        name: "صندوق الشاشات",
        label: "شاشات العرض والكابلات",
        items: [
          { warehouseItemId: "wh-3", name: "Dell U2723QE 27\"", category: "Monitor", serialNumber: "IT-MON-001", qty: 2 },
          { warehouseItemId: "wh-14", name: "DisplayPort Cable 2m", category: "Cable", qty: 4 },
          { warehouseItemId: "wh-22", name: "Monitor Arm Clamp", category: "Adapter", qty: 2 },
        ],
      },
      {
        id: "box-3",
        name: "صندوق الطباعة",
        label: "طابعات وملصقات",
        items: [
          { warehouseItemId: "wh-4", name: "HP LaserJet Pro", category: "Printer", serialNumber: "IT-PRT-001", qty: 1 },
          { warehouseItemId: "wh-23", name: "Asset Tag Labels (Roll)", category: "Label", qty: 5 },
        ],
      },
    ],
  },
  {
    id: "visit-2",
    name: "زيارة كربلاء — Arbaeen",
    date: "2026-11-15",
    status: "active",
    boxes: [
      {
        id: "box-4",
        name: "صندوق المعدات المتنقلة",
        label: "مجموعات لابتوب متنقلة",
        items: [
          { warehouseItemId: "wh-2", name: "MacBook Pro 14\"", category: "Laptop", serialNumber: "IT-LAP-010", qty: 2 },
          { warehouseItemId: "wh-12", name: "Jabra Evolve2 75", category: "Headset", qty: 2 },
          { warehouseItemId: "wh-17", name: "Thunderbolt 4 Cable", category: "Cable", qty: 3 },
          { warehouseItemId: "wh-20", name: "USB-C Hub 7-in-1", category: "Adapter", qty: 2 },
        ],
      },
      {
        id: "box-5",
        name: "صندوق الإدخال",
        label: "لوحات مفاتيح وماوس",
        items: [
          { warehouseItemId: "wh-8", name: "HP USB Keyboard", category: "Keyboard", qty: 6 },
          { warehouseItemId: "wh-10", name: "Dell USB Optical Mouse", category: "Mouse", qty: 6 },
          { warehouseItemId: "wh-11", name: "3.5mm Headset Pro", category: "Headset", qty: 4 },
          { warehouseItemId: "wh-18", name: "USB-C to USB-A Adapter", category: "Adapter", qty: 6 },
        ],
      },
      {
        id: "box-6",
        name: "صندوق الكابلات",
        label: "كابلات ومحولات",
        items: [
          { warehouseItemId: "wh-13", name: "USB-C to HDMI Cable", category: "Cable", qty: 10 },
          { warehouseItemId: "wh-15", name: "Cat6 Ethernet 3m", category: "Cable", qty: 15 },
          { warehouseItemId: "wh-16", name: "Cat6 Ethernet 5m", category: "Cable", qty: 10 },
          { warehouseItemId: "wh-19", name: "Laptop Charger 65W", category: "Adapter", qty: 6 },
        ],
      },
    ],
  },
];

export const initialUsers: User[] = [
  { id: "user-1", name: "أحمد محمد", email: "ahmed@company.com", role: "admin", active: true },
  { id: "user-2", name: "سارة العلي", email: "sara@company.com", role: "technician", active: true },
  { id: "user-3", name: "خالد الشمري", email: "khalid@company.com", role: "technician", active: true },
  { id: "user-4", name: "نورة الحربي", email: "noura@company.com", role: "viewer", active: true },
];

export const initialActivityLog: ActivityLogEntry[] = [
  { id: "act-1", type: "activate_visit", description: "تفعيل زيارة كربلاء — Arbaeen", userId: "user-1", userName: "أحمد محمد", timestamp: "2026-07-10T09:00:00" },
  { id: "act-2", type: "fill_box", description: "تعبئة صندوق المعدات المتنقلة — 4 عناصر", userId: "user-1", userName: "أحمد محمد", timestamp: "2026-07-10T09:30:00", details: "زيارة كربلاء" },
  { id: "act-3", type: "fill_box", description: "تعبئة صندوق الإدخال — 4 عناصر", userId: "user-2", userName: "سارة العلي", timestamp: "2026-07-10T10:00:00", details: "زيارة كربلاء" },
  { id: "act-4", type: "fill_box", description: "تعبئة صندوق الكابلات — 4 عناصر", userId: "user-3", userName: "خالد الشمري", timestamp: "2026-07-10T10:30:00", details: "زيارة كربلاء" },
  { id: "act-5", type: "add_visit", description: "إضافة زيارة جديدة: زيارة النجف الأشرف — وفاة الإمام علي", userId: "user-1", userName: "أحمد محمد", timestamp: "2026-07-08T08:00:00" },
  { id: "act-6", type: "add_user", description: "إضافة مستخدم جديد: نورة الحربي", userId: "user-1", userName: "أحمد محمد", timestamp: "2026-07-05T13:00:00" },
];
