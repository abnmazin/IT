import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  WarehouseItem,
  Visit,
  User,
  ActivityLogEntry,
  Category,
  ArchivedVisit,
} from "@/types";
import { defaultCategories, isSerialCategory, getItemSerials } from "@/types";
import {
  initialWarehouseItems,
  initialVisits,
  initialUsers,
  initialActivityLog,
} from "@/data/mockData";

// ── Collections ──────────────────────────────────────────────
const COL = {
  users: "users",
  warehouseItems: "warehouseItems",
  visits: "visits",
  categories: "categories",
  activityLog: "activityLog",
  archivedVisits: "archivedVisits",
} as const;

// ── Generic helpers ──────────────────────────────────────────
function toPlain<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

// ── Users ────────────────────────────────────────────────────
export function subscribeUsers(callback: (users: User[]) => void): Unsubscribe {
  return onSnapshot(collection(db, COL.users), (snap) => {
    const users = snap.docs.map((d) => ({ id: d.id, ...d.data() } as User));
    callback(users);
  });
}

export async function saveUser(user: User): Promise<void> {
  await setDoc(doc(db, COL.users, user.id), toPlain(user));
}

export async function deleteUserFS(id: string): Promise<void> {
  await deleteDoc(doc(db, COL.users, id));
}

// ── Warehouse Items ──────────────────────────────────────────
export function subscribeWarehouseItems(callback: (items: WarehouseItem[]) => void): Unsubscribe {
  return onSnapshot(collection(db, COL.warehouseItems), (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as WarehouseItem));
    callback(items);
  });
}

export async function saveWarehouseItem(item: WarehouseItem): Promise<void> {
  await setDoc(doc(db, COL.warehouseItems, item.id), toPlain(item));
}

export async function deleteWarehouseItemFS(id: string): Promise<void> {
  await deleteDoc(doc(db, COL.warehouseItems, id));
}

// ── Visits ───────────────────────────────────────────────────
export function subscribeVisits(callback: (visits: Visit[]) => void): Unsubscribe {
  return onSnapshot(collection(db, COL.visits), (snap) => {
    const visits = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Visit));
    callback(visits);
  });
}

export async function saveVisit(visit: Visit): Promise<void> {
  await setDoc(doc(db, COL.visits, visit.id), toPlain(visit));
}

export async function deleteVisitFS(id: string): Promise<void> {
  await deleteDoc(doc(db, COL.visits, id));
}

// ── Categories ───────────────────────────────────────────────
export function subscribeCategories(callback: (cats: Category[]) => void): Unsubscribe {
  return onSnapshot(collection(db, COL.categories), (snap) => {
    const cats = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
    callback(cats);
  });
}

export async function saveCategory(cat: Category): Promise<void> {
  await setDoc(doc(db, COL.categories, cat.id), toPlain(cat));
}

export async function deleteCategoryFS(id: string): Promise<void> {
  await deleteDoc(doc(db, COL.categories, id));
}

// ── Activity Log ─────────────────────────────────────────────
export function subscribeActivityLog(callback: (log: ActivityLogEntry[]) => void): Unsubscribe {
  const q = query(collection(db, COL.activityLog), orderBy("timestamp", "desc"));
  return onSnapshot(q, (snap) => {
    const log = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ActivityLogEntry));
    callback(log);
  });
}

export async function addActivityEntry(entry: ActivityLogEntry): Promise<void> {
  await setDoc(doc(db, COL.activityLog, entry.id), toPlain(entry));
}

// ── Archived Visits ──────────────────────────────────────────
export function subscribeArchivedVisits(callback: (visits: ArchivedVisit[]) => void): Unsubscribe {
  return onSnapshot(collection(db, COL.archivedVisits), (snap) => {
    const visits = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ArchivedVisit));
    callback(visits);
  });
}

export async function saveArchivedVisit(visit: ArchivedVisit): Promise<void> {
  await setDoc(doc(db, COL.archivedVisits, visit.id), toPlain(visit));
}

export async function deleteArchivedVisitFS(id: string): Promise<void> {
  await deleteDoc(doc(db, COL.archivedVisits, id));
}

// ── Legacy migration ─────────────────────────────────────────
let migrated = false;

export async function migrateWarehouseItems(
  categories: { key: string; serialTracked: boolean }[]
): Promise<void> {
  if (migrated) return;
  migrated = true;

  const snap = await getDocs(collection(db, COL.warehouseItems));
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as WarehouseItem));
  let changed = false;

  const groups = new Map<string, WarehouseItem[]>();
  for (const item of docs) {
    if (!isSerialCategory(categories, item.category) || getItemSerials(item).length === 0) continue;
    const key = `${item.category}::${item.name}`;
    const list = groups.get(key) || [];
    list.push(item);
    groups.set(key, list);
  }

  for (const list of Array.from(groups.values())) {
    if (list.length <= 1) continue;
    const first = list[0];
    const mergedSerials: string[] = [];
    for (const item of list) {
      for (const s of getItemSerials(item)) {
        if (!mergedSerials.includes(s)) mergedSerials.push(s);
      }
    }
    const merged: WarehouseItem = {
      ...first,
      serials: mergedSerials,
      serialNumber: undefined,
      totalQty: mergedSerials.length,
    };
    await setDoc(doc(db, COL.warehouseItems, first.id), toPlain(merged));
    for (const item of list.slice(1)) {
      await deleteDoc(doc(db, COL.warehouseItems, item.id));
    }
    changed = true;
  }

  for (const item of docs) {
    if (isSerialCategory(categories, item.category) && item.serialNumber && !item.serials) {
      await setDoc(
        doc(db, COL.warehouseItems, item.id),
        toPlain({ ...item, serials: [item.serialNumber], serialNumber: undefined, totalQty: 1 } as WarehouseItem)
      );
      changed = true;
    }
  }
}

// ── Seed data helper (first run only) ────────────────────────
export async function seedCollection<T>(colName: string, items: T[]): Promise<void> {
  for (const item of items) {
    const data = item as Record<string, unknown>;
    const id = (data as { id: string }).id;
    await setDoc(doc(db, colName, id), toPlain(item) as Record<string, unknown>);
  }
}

// ── Clear all Firestore data and re-seed ─────────────────────
export async function resetFirestore(): Promise<void> {
  const collections = [COL.warehouseItems, COL.visits, COL.categories, COL.activityLog, COL.archivedVisits];
  for (const col of collections) {
    const snap = await getDocs(collection(db, col));
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
  }
  await seedCollection(COL.categories, defaultCategories);
  seeded = true;
}

// ── Check if Firestore is empty and seed if needed ───────────
let seeded = false;

export async function seedFirestoreIfNeeded(): Promise<boolean> {
  if (seeded) return false;

  const checks = await Promise.all(
    [COL.users, COL.categories].map(async (col) => {
      const snap = await getDocs(collection(db, col));
      return snap.empty;
    })
  );

  const anyEmpty = checks.some((empty) => empty);
  if (!anyEmpty) {
    seeded = true;
    return false;
  }

  await Promise.all([
    seedCollection(COL.users, initialUsers),
    seedCollection(COL.categories, defaultCategories),
  ]);

  seeded = true;
  return true;
}
