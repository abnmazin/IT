export type ItemCategory =
  | "Laptop"
  | "Keyboard"
  | "Mouse"
  | "Monitor"
  | "Printer"
  | "Cable"
  | "Label"
  | "Headset"
  | "Adapter"
  | "Docking Station";

export interface Category {
  id: string;
  key: ItemCategory;
  label: string;
  serialTracked: boolean;
}

export const SERIAL_TRACKED_CATEGORIES: ItemCategory[] = [
  "Laptop",
  "Monitor",
  "Printer",
  "Docking Station",
];

export function isSerialTracked(category: ItemCategory): boolean {
  return SERIAL_TRACKED_CATEGORIES.includes(category);
}

export const defaultCategories: Category[] = [
  { id: "cat-1", key: "Laptop", label: "لابتوب", serialTracked: true },
  { id: "cat-2", key: "Keyboard", label: "لوحة مفاتيح", serialTracked: false },
  { id: "cat-3", key: "Mouse", label: "ماوس", serialTracked: false },
  { id: "cat-4", key: "Monitor", label: "شاشة", serialTracked: true },
  { id: "cat-5", key: "Printer", label: "طابعة", serialTracked: true },
  { id: "cat-6", key: "Cable", label: "كابل", serialTracked: false },
  { id: "cat-7", key: "Label", label: "ملصق", serialTracked: false },
  { id: "cat-8", key: "Headset", label: "سماعة", serialTracked: false },
  { id: "cat-9", key: "Adapter", label: "محول", serialTracked: false },
  { id: "cat-10", key: "Docking Station", label: "محطة اتصال", serialTracked: true },
];

export interface WarehouseItem {
  id: string;
  name: string;
  category: ItemCategory;
  serialNumber?: string;
  totalQty: number;
}

export type VisitStatus = "inactive" | "active" | "completed";

export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  inactive: "غير مفعلة",
  active: "مفعلة",
  completed: "مكتملة",
};

export interface Visit {
  id: string;
  name: string;
  date: string;
  status: VisitStatus;
  boxes: Box[];
}

export interface Box {
  id: string;
  name: string;
  label?: string;
  items: BoxItem[];
}

export interface BoxItem {
  warehouseItemId: string;
  name: string;
  category: ItemCategory;
  serialNumber?: string;
  qty: number;
  returnedQty?: number;
}

export interface Transfer {
  id: string;
  date: string;
  fromSiteId: string;
  toSiteId: string;
  items: TransferItem[];
}

export interface TransferItem {
  itemId: string;
  itemName: string;
  serialNumber?: string;
  fromLocationId: string;
}

export type View =
  | "dashboard"
  | "warehouse"
  | "boxes"
  | "visits"
  | "transfers"
  | "users"
  | "categories-settings"
  | "activity-log";

export type UserRole = "admin" | "technician" | "viewer";

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: "مدير",
  technician: "فني",
  viewer: "مشاهد",
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}

export type ActivityType =
  | "checkout"
  | "return"
  | "transfer"
  | "add_item"
  | "add_visit"
  | "activate_visit"
  | "deactivate_visit"
  | "fill_box"
  | "return_items"
  | "add_user"
  | "delete_user"
  | "edit_user"
  | "add_category"
  | "edit_category"
  | "delete_category";

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  checkout: "سحب صنف",
  return: "إرجاع صنف",
  transfer: "نقل بين مواقع",
  add_item: "إضافة صنف",
  add_visit: "إضافة زيارة",
  activate_visit: "تفعيل زيارة",
  deactivate_visit: "إيقاف زيارة",
  fill_box: "تعبئة صندوق",
  return_items: "إرجاع مواد للمخزن",
  add_user: "إضافة مستخدم",
  delete_user: "حذف مستخدم",
  edit_user: "تعديل مستخدم",
  add_category: "إضافة فئة",
  edit_category: "تعديل فئة",
  delete_category: "حذف فئة",
};

export interface ActivityLogEntry {
  id: string;
  type: ActivityType;
  description: string;
  userId: string;
  userName: string;
  timestamp: string;
  details?: string;
}
