import {
  WarehouseItem,
  Visit,
  User,
  Category,
  ActivityLogEntry,
  ArchivedVisit,
  defaultCategories,
} from "@/types";
import {
  demoWarehouseItems,
  demoVisits,
  demoUsers,
  demoActivityLog,
  demoArchivedVisits,
} from "./demoData";

type Unsubscribe = () => void;

const store = {
  warehouseItems: demoWarehouseItems.map((i) => structuredClone(i)),
  visits: demoVisits.map((v) => structuredClone(v)),
  categories: defaultCategories.map((c) => ({ ...c })),
  activityLog: [...demoActivityLog],
  users: demoUsers.map((u) => ({ ...u })),
  archivedVisits: demoArchivedVisits.map((a) => structuredClone(a)),
};

type StoreKey = keyof typeof store;

const listeners: Record<StoreKey, Set<() => void>> = {
  warehouseItems: new Set(),
  visits: new Set(),
  categories: new Set(),
  activityLog: new Set(),
  users: new Set(),
  archivedVisits: new Set(),
};

function notify(key: StoreKey) {
  listeners[key].forEach((fn) => fn());
}

function emit<K extends StoreKey>(key: K, cb: (items: (typeof store)[K]) => void): Unsubscribe {
  const fn = () => cb([...store[key]] as (typeof store)[K]);
  listeners[key].add(fn);
  fn();
  return () => {
    listeners[key].delete(fn);
  };
}

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx >= 0) {
    const next = [...list];
    next[idx] = structuredClone(item);
    return next;
  }
  return [...list, structuredClone(item)];
}

// ── Users ────────────────────────────────────────────────────
export function subscribeUsers(callback: (users: User[]) => void): Unsubscribe {
  return emit("users", callback);
}
export async function saveUser(user: User): Promise<void> {
  store.users = upsert(store.users, user);
  notify("users");
}
export async function deleteUserFS(id: string): Promise<void> {
  store.users = store.users.filter((u) => u.id !== id);
  notify("users");
}

// ── Warehouse Items ──────────────────────────────────────────
export function subscribeWarehouseItems(callback: (items: WarehouseItem[]) => void): Unsubscribe {
  return emit("warehouseItems", callback);
}
export async function saveWarehouseItem(item: WarehouseItem): Promise<void> {
  store.warehouseItems = upsert(store.warehouseItems, item);
  notify("warehouseItems");
}
export async function deleteWarehouseItemFS(id: string): Promise<void> {
  store.warehouseItems = store.warehouseItems.filter((i) => i.id !== id);
  notify("warehouseItems");
}

// ── Visits ───────────────────────────────────────────────────
export function subscribeVisits(callback: (visits: Visit[]) => void): Unsubscribe {
  return emit("visits", callback);
}
export async function saveVisit(visit: Visit): Promise<void> {
  store.visits = upsert(store.visits, visit);
  notify("visits");
}
export async function deleteVisitFS(id: string): Promise<void> {
  store.visits = store.visits.filter((v) => v.id !== id);
  notify("visits");
}

// ── Categories ───────────────────────────────────────────────
export function subscribeCategories(callback: (cats: Category[]) => void): Unsubscribe {
  return emit("categories", callback);
}
export async function saveCategory(cat: Category): Promise<void> {
  store.categories = upsert(store.categories, cat);
  notify("categories");
}
export async function deleteCategoryFS(id: string): Promise<void> {
  store.categories = store.categories.filter((c) => c.id !== id);
  notify("categories");
}

// ── Activity Log ─────────────────────────────────────────────
export function subscribeActivityLog(callback: (log: ActivityLogEntry[]) => void): Unsubscribe {
  const sorted = (log: ActivityLogEntry[]) =>
    [...log].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  const fn = () => callback(sorted(store.activityLog));
  listeners.activityLog.add(fn);
  fn();
  return () => {
    listeners.activityLog.delete(fn);
  };
}
export async function addActivityEntry(entry: ActivityLogEntry): Promise<void> {
  store.activityLog = [structuredClone(entry), ...store.activityLog];
  notify("activityLog");
}

// ── Archived Visits ──────────────────────────────────────────
export function subscribeArchivedVisits(callback: (visits: ArchivedVisit[]) => void): Unsubscribe {
  return emit("archivedVisits", callback);
}
export async function saveArchivedVisit(visit: ArchivedVisit): Promise<void> {
  store.archivedVisits = upsert(store.archivedVisits, visit);
  notify("archivedVisits");
}
