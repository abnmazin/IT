import {
  Site,
  Location,
  InventoryItem,
  Transfer,
  User,
  ActivityLogEntry,
} from "@/types";

export const initialSites: Site[] = [
  { id: "site-1", name: "مقر اللجنة" },
  { id: "site-2", name: "موكب كربلاء" },
  { id: "site-3", name: "موكب النجف" },
  { id: "site-4", name: "موكب سامرا" },
];

export const initialLocations: Location[] = [
  { id: "loc-1", name: "صندوق #1", type: "box", siteId: "site-3", label: "مجموعات اللابتوب", pinned: true },
  { id: "loc-2", name: "صندوق #2", type: "box", siteId: "site-3", label: "شاشات العرض" },
  { id: "loc-3", name: "صندوق #3", type: "box", siteId: "site-1", label: "مستلزمات الطابعة" },
  { id: "loc-4", name: "صندوق #4", type: "box", siteId: "site-2", label: "ملحقات الإدخال", pinned: true },
  { id: "loc-5", name: "مخزن الطابق الأول", type: "warehouse", siteId: "site-1", label: "مخزن رئيسي - كابلات وقطع غيار" },
  { id: "loc-6", name: "صندوق #5", type: "box", siteId: "site-1", label: "طباعة وملصقات" },
  { id: "loc-7", name: "رف المخزون", type: "shelf", siteId: "site-4", label: "قطع غيار وملحقات احتياطية" },
  { id: "loc-8", name: "صندوق التجهيزات", type: "box", siteId: "site-4", label: "مجموعات لابتوب متنقلة" },
];

export const initialItems: InventoryItem[] = [
  { id: "item-1", name: "Dell Latitude 5540", category: "Laptop", serialNumber: "IT-LAP-001", locationId: "loc-1", expectedQty: 1, currentQty: 1, checkedOut: 0 },
  { id: "item-2", name: "Dell Latitude 5540", category: "Laptop", serialNumber: "IT-LAP-002", locationId: "loc-1", expectedQty: 1, currentQty: 1, checkedOut: 0 },
  { id: "item-3", name: "Dell Latitude 5540", category: "Laptop", serialNumber: "IT-LAP-003", locationId: "loc-1", expectedQty: 1, currentQty: 0, checkedOut: 1, checkedOutBy: "أحمد محمد", checkedOutDate: "2026-07-15" },
  { id: "item-4", name: "USB-C Dock", category: "Docking Station", serialNumber: "IT-DOCK-001", locationId: "loc-1", expectedQty: 1, currentQty: 1, checkedOut: 0 },
  { id: "item-5", name: "USB-C Dock", category: "Docking Station", serialNumber: "IT-DOCK-002", locationId: "loc-1", expectedQty: 1, currentQty: 1, checkedOut: 0 },
  { id: "item-6", name: "Logitech MX Keys", category: "Keyboard", locationId: "loc-1", expectedQty: 3, currentQty: 3, checkedOut: 0 },
  { id: "item-7", name: "Logitech MX Master 3S", category: "Mouse", locationId: "loc-1", expectedQty: 3, currentQty: 3, checkedOut: 0 },
  { id: "item-8", name: "USB-C to HDMI Cable", category: "Cable", locationId: "loc-1", expectedQty: 5, currentQty: 5, checkedOut: 0 },
  { id: "item-9", name: "Dell U2723QE 27\"", category: "Monitor", serialNumber: "IT-MON-001", locationId: "loc-2", expectedQty: 1, currentQty: 1, checkedOut: 0 },
  { id: "item-10", name: "Dell U2723QE 27\"", category: "Monitor", serialNumber: "IT-MON-002", locationId: "loc-2", expectedQty: 1, currentQty: 1, checkedOut: 0 },
  { id: "item-11", name: "DisplayPort Cable 2m", category: "Cable", locationId: "loc-2", expectedQty: 4, currentQty: 4, checkedOut: 0 },
  { id: "item-12", name: "Monitor Arm Clamp", category: "Adapter", locationId: "loc-2", expectedQty: 2, currentQty: 2, checkedOut: 0 },
  { id: "item-13", name: "HP LaserJet Pro", category: "Printer", serialNumber: "IT-PRT-001", locationId: "loc-3", expectedQty: 1, currentQty: 1, checkedOut: 0 },
  { id: "item-14", name: "HP LaserJet Toner", category: "Printer", locationId: "loc-3", expectedQty: 6, currentQty: 2, checkedOut: 4 },
  { id: "item-15", name: "USB-B Printer Cable", category: "Cable", locationId: "loc-3", expectedQty: 4, currentQty: 3, checkedOut: 1 },
  { id: "item-16", name: "HP USB Keyboard", category: "Keyboard", locationId: "loc-4", expectedQty: 8, currentQty: 8, checkedOut: 0 },
  { id: "item-17", name: "Dell USB Optical Mouse", category: "Mouse", locationId: "loc-4", expectedQty: 8, currentQty: 8, checkedOut: 0 },
  { id: "item-18", name: "3.5mm Headset Pro", category: "Headset", locationId: "loc-4", expectedQty: 5, currentQty: 5, checkedOut: 0 },
  { id: "item-19", name: "USB-C to USB-A Adapter", category: "Adapter", locationId: "loc-4", expectedQty: 10, currentQty: 10, checkedOut: 0 },
  { id: "item-20", name: "Cat6 Ethernet 3m", category: "Cable", locationId: "loc-5", expectedQty: 20, currentQty: 12, checkedOut: 8 },
  { id: "item-21", name: "Cat6 Ethernet 5m", category: "Cable", locationId: "loc-5", expectedQty: 15, currentQty: 10, checkedOut: 5 },
  { id: "item-22", name: "Fiber Patch 2m", category: "Cable", locationId: "loc-5", expectedQty: 5, currentQty: 2, checkedOut: 3 },
  { id: "item-23", name: "SSD 500GB NVMe", category: "Laptop", locationId: "loc-5", expectedQty: 5, currentQty: 3, checkedOut: 2 },
  { id: "item-24", name: "RAM DDR5 16GB", category: "Laptop", locationId: "loc-5", expectedQty: 4, currentQty: 2, checkedOut: 2 },
  { id: "item-25", name: "Zebra ZD421 Printer", category: "Printer", serialNumber: "IT-PRT-002", locationId: "loc-6", expectedQty: 1, currentQty: 1, checkedOut: 0 },
  { id: "item-26", name: "Asset Tag Labels (Roll)", category: "Label", locationId: "loc-6", expectedQty: 20, currentQty: 8, checkedOut: 12 },
  { id: "item-27", name: "USB Thermal Cable", category: "Cable", locationId: "loc-6", expectedQty: 2, currentQty: 2, checkedOut: 0 },
  { id: "item-28", name: "Laptop Charger 65W", category: "Adapter", locationId: "loc-7", expectedQty: 6, currentQty: 4, checkedOut: 2 },
  { id: "item-29", name: "USB Bluetooth Dongle", category: "Adapter", locationId: "loc-7", expectedQty: 4, currentQty: 4, checkedOut: 0 },
  { id: "item-30", name: "HDMI Cable 3m", category: "Cable", locationId: "loc-7", expectedQty: 6, currentQty: 6, checkedOut: 0 },
  { id: "item-31", name: "MacBook Pro 14\"", category: "Laptop", serialNumber: "IT-LAP-010", locationId: "loc-8", expectedQty: 1, currentQty: 1, checkedOut: 0 },
  { id: "item-32", name: "MacBook Pro 14\"", category: "Laptop", serialNumber: "IT-LAP-011", locationId: "loc-8", expectedQty: 1, currentQty: 0, checkedOut: 1, checkedOutBy: "سارة العلي", checkedOutDate: "2026-07-14" },
  { id: "item-33", name: "Jabra Evolve2 75", category: "Headset", locationId: "loc-8", expectedQty: 2, currentQty: 2, checkedOut: 0 },
  { id: "item-34", name: "Thunderbolt 4 Cable", category: "Cable", locationId: "loc-8", expectedQty: 3, currentQty: 3, checkedOut: 0 },
  { id: "item-35", name: "USB-C Hub 7-in-1", category: "Adapter", locationId: "loc-8", expectedQty: 2, currentQty: 2, checkedOut: 0 },
];

export const initialTransfers: Transfer[] = [
  { id: "tr-1", date: "2026-07-14", fromSiteId: "site-3", toSiteId: "site-4", items: [{ itemId: "item-31", itemName: "MacBook Pro 14\"", serialNumber: "IT-LAP-010", fromLocationId: "loc-1" }] },
  { id: "tr-2", date: "2026-07-12", fromSiteId: "site-1", toSiteId: "site-4", items: [{ itemId: "item-33", itemName: "Jabra Evolve2 75", fromLocationId: "loc-5" }, { itemId: "item-30", itemName: "HDMI Cable 3m", fromLocationId: "loc-5" }] },
];

export const initialUsers: User[] = [
  { id: "user-1", name: "أحمد محمد", email: "ahmed@company.com", role: "admin", active: true },
  { id: "user-2", name: "سارة العلي", email: "sara@company.com", role: "technician", active: true },
  { id: "user-3", name: "خالد الشمري", email: "khalid@company.com", role: "technician", active: true },
  { id: "user-4", name: "نورة الحربي", email: "noura@company.com", role: "viewer", active: true },
];

export const initialActivityLog: ActivityLogEntry[] = [
  { id: "act-1", type: "checkout", description: "سحب Dell Latitude 5540 (IT-LAP-003)", userId: "user-1", userName: "أحمد محمد", timestamp: "2026-07-15T09:30:00", details: "من صندوق #1 — HQ - الطابق 3" },
  { id: "act-2", type: "checkout", description: "سحب MacBook Pro 14\" (IT-LAP-011)", userId: "user-2", userName: "سارة العلي", timestamp: "2026-07-14T14:15:00", details: "من صندوق التجهيزات — مخزن اللجنة" },
  { id: "act-3", type: "transfer", description: "نقل MacBook Pro 14\" (IT-LAP-010) إلى مخزن اللجنة", userId: "user-1", userName: "أحمد محمد", timestamp: "2026-07-14T11:00:00", details: "من HQ - الطابق 3 إلى مخزن اللجنة" },
  { id: "act-4", type: "transfer", description: "نقل Jabra Evolve2 75 + HDMI Cable 3m إلى مخزن اللجنة", userId: "user-3", userName: "خالد الشمري", timestamp: "2026-07-12T10:00:00", details: "من HQ - الطابق 1 إلى مخزن اللجنة" },
  { id: "act-5", type: "add_site", description: "إضافة موقع جديد: مخزن اللجنة", userId: "user-1", userName: "أحمد محمد", timestamp: "2026-07-10T08:00:00" },
  { id: "act-6", type: "add_user", description: "إضافة مستخدم جديد: نورة الحربي", userId: "user-1", userName: "أحمد محمد", timestamp: "2026-07-09T13:00:00" },
];
