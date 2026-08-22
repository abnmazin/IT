"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import {
  WarehouseItem,
  Visit,
  Box,
  BoxItem,
  User,
  Category,
  ActivityLogEntry,
  ActivityType,
  ArchivedVisit,
  defaultCategories,
} from "@/types";
import * as fsBackend from "@/lib/firestore";
import * as demoBackend from "@/lib/demoBackend";
import { isDemoSession } from "./AuthContext";

interface DataContextType {
  warehouseItems: WarehouseItem[];
  visits: Visit[];
  categories: Category[];
  activityLog: ActivityLogEntry[];
  users: User[];
  archivedVisits: ArchivedVisit[];
  loading: boolean;
  newNotificationCount: number;
  clearNotifications: () => void;
  setAuthUser: (user: User | null) => void;

  logActivity: (type: ActivityType, description: string, details?: string, visitId?: string) => void;

  handleAddWarehouseItem: (name: string, category: string, totalQty: number, consumable: boolean, serials?: string[]) => void;
  handleEditWarehouseItem: (id: string, name: string, category: string, totalQty: number, consumable: boolean, serials?: string[]) => void;
  handleDeleteWarehouseItem: (id: string) => void;

  handleAddCategory: (key: string, label: string, serialTracked: boolean, consumable: boolean) => void;
  handleEditCategory: (id: string, key: string, label: string, serialTracked: boolean, consumable: boolean) => void;
  handleDeleteCategory: (id: string) => void;

  handleAddVisit: (name: string, date: string) => void;
  handleDeleteVisit: (visitId: string) => void;
  handleToggleVisit: (visitId: string) => void;
  handleActivateVisit: (visitId: string, year: string, hijriDate: string) => void;
  handleCollectVisit: (visitId: string, collected: { warehouseItemId: string; qty: number; returnedSerials?: string[]; status: "returned" | "consumed" | "missing" }[]) => void;
  handleFillBox: (visitId: string, boxId: string, items: BoxItem[]) => void;
  handleReturnItems: (visitId: string, boxId: string, returned: { warehouseItemId: string; qty: number }[]) => void;
  handleAddBox: (visitId: string, name: string, label: string) => void;
  handleDeleteBox: (visitId: string, boxId: string) => void;
  handleFillBoxesFromTemplate: (visitId: string) => void;
  handleUpdateBoxItemQty: (visitId: string, boxId: string, warehouseItemId: string, delta: number) => void;
  handleToggleBoxItemSerial: (visitId: string, boxId: string, warehouseItemId: string, serial: string) => void;
  handleAddItemToBox: (visitId: string, boxId: string, warehouseItemId: string, qty: number, serials?: string[]) => void;
  handleBulkAddItemsToBox: (visitId: string, boxId: string, items: { warehouseItemId: string; qty: number; serials?: string[] }[]) => void;
  handleBulkDeleteWarehouseItems: (ids: string[]) => void;

  handleAddUser: (name: string, role: User["role"], pin: string) => void;
  handleEditUser: (id: string, name: string, role: User["role"], pin: string) => void;
  handleDeleteUser: (id: string) => void;
  handleToggleUser: (id: string) => void;
}

const DataContext = createContext<DataContextType>({} as DataContextType);

export function useData() {
  return useContext(DataContext);
}

function now() {
  return new Date().toISOString();
}

function today() {
  return new Date().toISOString().split("T")[0];
}

type SaveWarehouseItem = (item: WarehouseItem) => Promise<void>;

function deployToWarehouse(saveItem: SaveWarehouseItem, warehouseItems: WarehouseItem[], boxItems: BoxItem[]) {
  const groups: Record<string, { qty: number; serials: string[] }> = {};
  for (const bi of boxItems) {
    const g = groups[bi.warehouseItemId] || { qty: 0, serials: [] };
    const serials = (bi.serials || []).filter(Boolean);
    if (serials.length > 0) {
      g.serials = Array.from(new Set([...g.serials, ...serials]));
    } else {
      g.qty += bi.originalQty || bi.qty;
    }
    groups[bi.warehouseItemId] = g;
  }
  for (const [wid, g] of Object.entries(groups)) {
    const wh = warehouseItems.find((w) => w.id === wid);
    if (!wh) continue;
    if (g.serials.length > 0) {
      const remaining = (wh.serials || []).filter((s) => !g.serials.includes(s));
      saveItem({
        ...wh,
        serials: remaining,
        serialNumber: remaining.length === 1 ? remaining[0] : undefined,
        totalQty: remaining.length,
      });
    } else if (g.qty > 0) {
      saveItem({ ...wh, totalQty: Math.max(0, wh.totalQty - g.qty) });
    }
  }
}

function restoreToWarehouse(
  saveItem: SaveWarehouseItem,
  warehouseItems: WarehouseItem[],
  restoreList: { warehouseItemId: string; serials?: string[]; qty: number }[]
) {
  const groups: Record<string, { qty: number; serials: string[] }> = {};
  for (const r of restoreList) {
    const g = groups[r.warehouseItemId] || { qty: 0, serials: [] };
    if (r.serials && r.serials.length > 0) {
      g.serials = Array.from(new Set([...g.serials, ...r.serials.filter(Boolean)]));
    } else {
      g.qty += r.qty;
    }
    groups[r.warehouseItemId] = g;
  }
  for (const [wid, g] of Object.entries(groups)) {
    const wh = warehouseItems.find((w) => w.id === wid);
    if (!wh) continue;
    if (g.serials.length > 0) {
      const merged = Array.from(new Set([...(wh.serials || []), ...g.serials]));
      saveItem({
        ...wh,
        serials: merged,
        serialNumber: merged.length === 1 ? merged[0] : undefined,
        totalQty: merged.length,
      });
    } else if (g.qty > 0) {
      saveItem({ ...wh, totalQty: wh.totalQty + g.qty });
    }
  }
}

function resetToTemplate(visit: Visit): Visit {
  return {
    ...visit,
    status: "inactive",
    boxes: visit.boxes.map((b) => ({
      ...b,
      items: b.items.map((bi) => ({
        ...bi,
        qty: bi.originalQty || bi.qty,
        outSerials: undefined,
        returnedSerials: undefined,
        returnedQty: undefined,
        status: undefined,
      })),
    })),
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [isDemo] = useState(() => isDemoSession());
  const backend = isDemo ? demoBackend : fsBackend;
  const {
    subscribeUsers,
    saveUser,
    deleteUserFS,
    subscribeWarehouseItems,
    saveWarehouseItem,
    deleteWarehouseItemFS,
    subscribeVisits,
    saveVisit,
    deleteVisitFS,
    subscribeCategories,
    saveCategory,
    deleteCategoryFS,
    subscribeActivityLog,
    addActivityEntry,
    subscribeArchivedVisits,
    saveArchivedVisit,
  } = backend;

  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [archivedVisits, setArchivedVisits] = useState<ArchivedVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNotificationCount, setNewNotificationCount] = useState(0);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const prevLogLength = useRef(0);

  // Subscribe to data source (Firestore or in-memory demo backend)
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    async function init() {
      if (!isDemo) {
        await fsBackend.seedFirestoreIfNeeded();
        await fsBackend.migrateWarehouseItems(defaultCategories);
      }
      unsubs = [
        subscribeWarehouseItems((items) => { setWarehouseItems(items); setLoading(false); }),
        subscribeVisits((v) => setVisits(v)),
        subscribeCategories((c) => setCategories(c)),
        subscribeActivityLog((log) => setActivityLog(log)),
        subscribeUsers((u) => setUsers(u)),
        subscribeArchivedVisits((a) => setArchivedVisits(a)),
      ];
    }

    init();
    return () => unsubs.forEach((u) => u());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track new notifications
  useEffect(() => {
    if (activityLog.length > 0 && prevLogLength.current > 0 && activityLog.length > prevLogLength.current) {
      setNewNotificationCount((c) => c + (activityLog.length - prevLogLength.current));
    }
    prevLogLength.current = activityLog.length;
  }, [activityLog]);

  const clearNotifications = useCallback(() => setNewNotificationCount(0), []);

  const setAuthUserCallback = useCallback((user: User | null) => setAuthUser(user), []);

  const currentUser = authUser;

  const logActivity = useCallback(
    (type: ActivityType, description: string, details?: string, visitId?: string) => {
      if (!currentUser) return;
      const entry: ActivityLogEntry = {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type,
        description,
        userId: currentUser.id,
        userName: currentUser.name,
        timestamp: now(),
        visitId,
        details,
      };
      addActivityEntry(entry);
    },
    [currentUser]
  );

  // ── Warehouse ─────────────────────────────────────
  const handleAddWarehouseItem = useCallback(
    (name: string, category: string, totalQty: number, consumable: boolean, serials?: string[]) => {
      const cleanSerials = serials?.map((s) => s.trim()).filter(Boolean);
      const item: WarehouseItem = {
        id: `wh-${Date.now()}`,
        name,
        category: category as WarehouseItem["category"],
        serialNumber: cleanSerials?.length === 1 ? cleanSerials[0] : undefined,
        serials: cleanSerials && cleanSerials.length > 0 ? cleanSerials : undefined,
        totalQty: cleanSerials && cleanSerials.length > 0 ? cleanSerials.length : totalQty,
        consumable,
      };
      saveWarehouseItem(item);
      logActivity("add_item", `إضافة صنف للمخزن: ${name}`);
    },
    [logActivity]
  );

  const handleEditWarehouseItem = useCallback(
    (id: string, name: string, category: string, totalQty: number, consumable: boolean, serials?: string[]) => {
      const cleanSerials = serials?.map((s) => s.trim()).filter(Boolean);
      const item: WarehouseItem = {
        id,
        name,
        category: category as WarehouseItem["category"],
        serialNumber: cleanSerials?.length === 1 ? cleanSerials[0] : undefined,
        serials: cleanSerials && cleanSerials.length > 0 ? cleanSerials : undefined,
        totalQty: cleanSerials && cleanSerials.length > 0 ? cleanSerials.length : totalQty,
        consumable,
      };
      saveWarehouseItem(item);
    },
    []
  );

  const handleDeleteWarehouseItem = useCallback(
    (id: string) => {
      const item = warehouseItems.find((i) => i.id === id);
      deleteWarehouseItemFS(id);
      if (item) logActivity("delete_item", `حذف صنف من المخزن: ${item.name}`);
    },
    [warehouseItems, logActivity]
  );

  // ── Categories ────────────────────────────────────
  const handleAddCategory = useCallback(
    (key: string, label: string, serialTracked: boolean, consumable: boolean) => {
      const cat: Category = { id: `cat-${Date.now()}`, key: key as Category["key"], label, serialTracked, consumable };
      saveCategory(cat);
      logActivity("add_category", `إضافة فئة جديدة: ${label}`);
    },
    [logActivity]
  );

  const handleEditCategory = useCallback(
    (id: string, key: string, label: string, serialTracked: boolean, consumable: boolean) => {
      const cat: Category = { id, key: key as Category["key"], label, serialTracked, consumable };
      saveCategory(cat);
    },
    []
  );

  const handleDeleteCategory = useCallback(
    (id: string) => {
      const cat = categories.find((c) => c.id === id);
      deleteCategoryFS(id);
      if (cat) logActivity("delete_category", `حذف فئة: ${cat.label}`);
    },
    [categories, logActivity]
  );

  // ── Visits ────────────────────────────────────────
  const handleAddVisit = useCallback(
    (name: string, date: string) => {
      const visit: Visit = {
        id: `visit-${Date.now()}`,
        name,
        date,
        status: "inactive",
        boxes: [],
      };
      saveVisit(visit);
      logActivity("add_visit", `إضافة زيارة جديدة: ${name}`, undefined, visit.id);
    },
    [logActivity]
  );

  const handleToggleVisit = useCallback(
    (visitId: string) => {
      const visit = visits.find((v) => v.id === visitId);
      if (!visit) return;
      const nextStatus =
        visit.status === "inactive" ? "active" :
        visit.status === "active" ? "collecting" :
        visit.status === "collecting" ? "completed" : "inactive";

      if (visit.status === "inactive" && nextStatus === "active") {
        saveVisit({ ...visit, status: "active" });
        deployToWarehouse(saveWarehouseItem, warehouseItems, visit.boxes.flatMap((b) => b.items));
        logActivity("activate_visit", `تفعيل زيارة: ${visit.name}`, undefined, visitId);
      } else if (visit.status === "collecting" && nextStatus === "completed") {
        const restoreList: { warehouseItemId: string; serials?: string[]; qty: number }[] = [];
        const completedBoxes = visit.boxes.map((b) => ({
          ...b,
          items: b.items.map((bi) => {
            const serials = bi.serials || [];
            if (serials.length > 0) {
              const out = (bi.outSerials || []).filter((s) => serials.includes(s));
              const inBox = serials.filter((s) => !out.includes(s));
              restoreList.push({ warehouseItemId: bi.warehouseItemId, serials: inBox, qty: 0 });
              return {
                ...bi,
                returnedQty: inBox.length,
                returnedSerials: undefined,
                status: (out.length > 0 ? "missing" : "returned") as BoxItem["status"],
              };
            }
            const returnedQty = bi.status === "consumed" ? 0 : bi.qty;
            restoreList.push({ warehouseItemId: bi.warehouseItemId, qty: returnedQty });
            return { ...bi, returnedQty, status: (bi.status || (returnedQty === (bi.originalQty || bi.qty) ? "returned" : bi.consumable ? "consumed" : "missing")) as BoxItem["status"] };
          }),
        }));
        restoreToWarehouse(saveWarehouseItem, warehouseItems, restoreList);
        const archive: ArchivedVisit = {
          id: `archive-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          visitId: visit.id,
          name: visit.name,
          date: visit.date,
          hijriDate: visit.hijriDate || "",
          year: visit.year || "",
          archivedAt: now(),
          boxes: completedBoxes,
        };
        saveArchivedVisit(archive);
        saveVisit(resetToTemplate(visit));
        logActivity("complete_visit", `إنهاء زيارة: ${visit.name}`, "إنهاء سريع", visitId);
      } else if (visit.status === "active" && nextStatus === "inactive") {
        const restoreList = visit.boxes.flatMap((b) => b.items).map((bi) => {
          const serials = bi.serials || [];
          if (serials.length > 0) return { warehouseItemId: bi.warehouseItemId, serials, qty: 0 };
          return { warehouseItemId: bi.warehouseItemId, qty: bi.originalQty || bi.qty };
        });
        restoreToWarehouse(saveWarehouseItem, warehouseItems, restoreList);
        saveVisit(resetToTemplate(visit));
        logActivity("deactivate_visit", `إلغاء تفعيل زيارة: ${visit.name}`, undefined, visitId);
      } else {
        saveVisit({ ...visit, status: nextStatus as Visit["status"] });
        logActivity(
          nextStatus === "collecting" ? "collect_visit" : "deactivate_visit",
          `${nextStatus === "collecting" ? "جمع العناصر" : "إلغاء تفعيل"} زيارة: ${visit.name}`,
          undefined,
          visitId
        );
      }
    },
    [visits, warehouseItems, logActivity]
  );

  const handleActivateVisit = useCallback(
    (visitId: string, year: string, hijriDate: string) => {
      const visit = visits.find((v) => v.id === visitId);
      if (!visit) return;
      saveVisit({ ...visit, status: "active", year: year || undefined, hijriDate: hijriDate || undefined });
      deployToWarehouse(saveWarehouseItem, warehouseItems, visit.boxes.flatMap((b) => b.items));
      logActivity("activate_visit", `تفعيل زيارة: ${visit.name} — ${year}`, undefined, visitId);
    },
    [visits, warehouseItems, logActivity]
  );

  const handleCollectVisit = useCallback(
    (visitId: string, collected: { warehouseItemId: string; qty: number; returnedSerials?: string[]; status: "returned" | "consumed" | "missing" }[]) => {
      const visit = visits.find((v) => v.id === visitId);
      if (!visit) return;
      const map = new Map<string, { qty: number; returnedSerials?: string[]; status: "returned" | "consumed" | "missing" }>(
        collected.map((c) => [c.warehouseItemId, c])
      );
      const restoreList: { warehouseItemId: string; serials?: string[]; qty: number }[] = [];
      const completedBoxes = visit.boxes.map((b) => ({
        ...b,
        items: b.items.map((bi) => {
          const c = map.get(bi.warehouseItemId);
          const serials = bi.serials || [];
          if (serials.length > 0) {
            const out = (bi.outSerials || []).filter((s) => serials.includes(s));
            const returnedOut = (c?.returnedSerials || []).filter((s) => out.includes(s));
            const inBox = serials.filter((s) => !out.includes(s));
            const returned = Array.from(new Set([...inBox, ...returnedOut]));
            const missing = out.filter((s) => !returnedOut.includes(s));
            restoreList.push({ warehouseItemId: bi.warehouseItemId, serials: returned, qty: 0 });
            return {
              ...bi,
              returnedQty: returned.length,
              returnedSerials: returnedOut,
              status: (missing.length > 0 ? "missing" : "returned") as BoxItem["status"],
            };
          }
          const returnedQty = c?.qty ?? bi.qty;
          const deployedQty = bi.originalQty || bi.qty;
          restoreList.push({ warehouseItemId: bi.warehouseItemId, qty: returnedQty });
          return {
            ...bi,
            returnedQty,
            status: (c?.status || (returnedQty === deployedQty ? "returned" : bi.consumable ? "consumed" : "missing")) as BoxItem["status"],
          };
        }),
      }));
      restoreToWarehouse(saveWarehouseItem, warehouseItems, restoreList);
      const archive: ArchivedVisit = {
        id: `archive-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        visitId: visit.id,
        name: visit.name,
        date: visit.date,
        hijriDate: visit.hijriDate || "",
        year: visit.year || "",
        archivedAt: now(),
        boxes: completedBoxes,
      };
      saveArchivedVisit(archive);
      saveVisit(resetToTemplate(visit));
      logActivity("complete_visit", `إنهاء زيارة: ${visit.name}`, `تم جمع ${collected.length} صنف`, visitId);
    },
    [visits, warehouseItems, logActivity]
  );

  const handleFillBox = useCallback(
    (visitId: string, boxId: string, items: BoxItem[]) => {
      const visit = visits.find((v) => v.id === visitId);
      if (!visit) return;
      const itemsWithOriginal = items.map((i) => ({ ...i, originalQty: i.qty }));
      const updated: Visit = {
        ...visit,
        boxes: visit.boxes.map((b) => {
          if (b.id !== boxId) return b;
          return { ...b, items: [...b.items, ...itemsWithOriginal] };
        }),
      };
      saveVisit(updated);
      const box = visit.boxes.find((b) => b.id === boxId);
      const itemNames = items.map((i) => `${i.name}(${i.qty})`).join(" + ");
      logActivity("fill_box", `تعبئة ${box?.name || "صندوق"} — ${itemNames}`, visit.name, visitId);
    },
    [visits, logActivity]
  );

  const handleReturnItems = useCallback(
    (visitId: string, boxId: string, returned: { warehouseItemId: string; qty: number }[]) => {
      const visit = visits.find((v) => v.id === visitId);
      if (!visit) return;
      const updated: Visit = {
        ...visit,
        boxes: visit.boxes.map((b) => {
          if (b.id !== boxId) return b;
          return {
            ...b,
              items: b.items
                .map((bi) => {
                  const ret = returned.find((r) => r.warehouseItemId === bi.warehouseItemId);
                  if (ret) return { ...bi, qty: bi.qty - ret.qty, returnedQty: ret.qty };
                  return bi;
                }),
          };
        }),
      };
      saveVisit(updated);
      returned.forEach((r) => {
        const whItem = warehouseItems.find((w) => w.id === r.warehouseItemId);
        if (whItem) {
          saveWarehouseItem({ ...whItem, totalQty: whItem.totalQty + r.qty });
        }
      });
      logActivity("return_items", `إرجاع مواد من صندوق ${boxId} للمخزن`, visit.name, visitId);
    },
    [visits, warehouseItems, logActivity]
  );

  const handleAddBox = useCallback(
    (visitId: string, name: string, label: string) => {
      const visit = visits.find((v) => v.id === visitId);
      if (!visit) return;
      const newBox: Box = { id: `box-${Date.now()}`, name, label: label || undefined, items: [] };
      saveVisit({ ...visit, boxes: [...visit.boxes, newBox] });
      logActivity("fill_box", `إضافة صندوق جديد: ${name}`);
    },
    [visits, logActivity]
  );

  const handleDeleteBox = useCallback(
    (visitId: string, boxId: string) => {
      const visit = visits.find((v) => v.id === visitId);
      if (!visit) return;
      saveVisit({ ...visit, boxes: visit.boxes.filter((b) => b.id !== boxId) });
    },
    [visits]
  );

  const handleUpdateBoxItemQty = useCallback(
    (visitId: string, boxId: string, warehouseItemId: string, delta: number) => {
      const visit = visits.find((v) => v.id === visitId);
      if (!visit) return;
      const box = visit.boxes.find((b) => b.id === boxId);
      const bi = box?.items.find((i) => i.warehouseItemId === warehouseItemId);
      if (!bi) return;
      const max = bi.originalQty || bi.qty;
      if (delta > 0 && bi.qty >= max) return;
      const updated: Visit = {
        ...visit,
        boxes: visit.boxes.map((b) => {
          if (b.id !== boxId) return b;
          return {
            ...b,
            items: b.items.map((item) => {
              if (item.warehouseItemId !== warehouseItemId) return item;
              const nextQty = Math.max(0, Math.min(max, item.qty + delta));
              return { ...item, qty: nextQty };
            }),
          };
        }),
      };
      saveVisit(updated);
      const label = delta > 0 ? "إضافة" : "نقصان";
      logActivity("fill_box", `${label} ${Math.abs(delta)} × ${bi.name} في صندوق ${box?.name || ""}`, visit.name, visitId);
    },
    [visits, logActivity]
  );

  const handleToggleBoxItemSerial = useCallback(
    (visitId: string, boxId: string, warehouseItemId: string, serial: string) => {
      const visit = visits.find((v) => v.id === visitId);
      if (!visit) return;
      if (visit.status !== "active" && visit.status !== "collecting") return;
      const box = visit.boxes.find((b) => b.id === boxId);
      const bi = box?.items.find((i) => i.warehouseItemId === warehouseItemId);
      if (!bi) return;
      const serials = bi.serials || [];
      if (!serials.includes(serial)) return;
      const out = new Set(bi.outSerials || []);
      const nextOut = out.has(serial)
        ? (bi.outSerials || []).filter((s) => s !== serial)
        : Array.from(new Set([...(bi.outSerials || []), serial]));
      const updated: Visit = {
        ...visit,
        boxes: visit.boxes.map((b) => {
          if (b.id !== boxId) return b;
          return {
            ...b,
            items: b.items.map((i) => {
              if (i.warehouseItemId !== warehouseItemId) return i;
              return { ...i, outSerials: nextOut, qty: Math.max(0, serials.length - nextOut.length) };
            }),
          };
        }),
      };
      saveVisit(updated);
      const pulled = out.has(serial);
      logActivity("fill_box", `${pulled ? "إعادة" : "سحب"} ${bi.name} ${pulled ? "" : "من الصندوق"} — ${serial}`, visit.name, visitId);
    },
    [visits, logActivity]
  );

  const handleAddItemToBox = useCallback(
    (visitId: string, boxId: string, warehouseItemId: string, qty: number, serials?: string[]) => {
      const visit = visits.find((v) => v.id === visitId);
      if (!visit) return;
      const whItem = warehouseItems.find((w) => w.id === warehouseItemId);
      if (!whItem) return;
      const box = visit.boxes.find((b) => b.id === boxId);
      if (!box) return;
      const cleanSerials = serials?.filter(Boolean) || [];
      const addQty = cleanSerials.length > 0 ? cleanSerials.length : qty;
      const existing = box.items.find((i) => i.warehouseItemId === warehouseItemId);
      let updatedVisit: Visit;
      if (existing) {
        updatedVisit = {
          ...visit,
          boxes: visit.boxes.map((b) => {
            if (b.id !== boxId) return b;
            return {
              ...b,
              items: b.items.map((bi) => {
                if (bi.warehouseItemId !== warehouseItemId) return bi;
                const mergedSerials = cleanSerials.length > 0
                  ? Array.from(new Set([...(bi.serials || []), ...cleanSerials]))
                  : bi.serials;
                const inBoxQty = mergedSerials && mergedSerials.length > 0
                  ? Math.max(0, mergedSerials.length - (bi.outSerials?.length || 0))
                  : bi.qty + addQty;
                return { ...bi, qty: inBoxQty, originalQty: (bi.originalQty || bi.qty) + addQty, serials: mergedSerials };
              }),
            };
          }),
        };
      } else {
        const newItem: BoxItem = {
          warehouseItemId,
          name: whItem.name,
          category: whItem.category,
          serialNumber: whItem.serialNumber,
          serials: cleanSerials.length > 0 ? cleanSerials : undefined,
          qty: addQty,
          originalQty: addQty,
          consumable: whItem.consumable,
        };
        updatedVisit = {
          ...visit,
          boxes: visit.boxes.map((b) => {
            if (b.id !== boxId) return b;
            return { ...b, items: [...b.items, newItem] };
          }),
        };
      }
      saveVisit(updatedVisit);
      logActivity("fill_box", `إضافة ${addQty} × ${whItem.name} إلى ${box.name}`, visit.name, visitId);
    },
    [visits, warehouseItems, logActivity]
  );

  const handleBulkAddItemsToBox = useCallback(
    (visitId: string, boxId: string, items: { warehouseItemId: string; qty: number; serials?: string[] }[]) => {
      const visit = visits.find((v) => v.id === visitId);
      if (!visit) return;
      let currentBoxes = visit.boxes;
      for (const { warehouseItemId, qty, serials } of items) {
        const whItem = warehouseItems.find((w) => w.id === warehouseItemId);
        if (!whItem) continue;
        const cleanSerials = serials?.filter(Boolean) || [];
        const addQty = cleanSerials.length > 0 ? cleanSerials.length : qty;
        currentBoxes = currentBoxes.map((b) => {
          if (b.id !== boxId) return b;
          const existing = b.items.find((i) => i.warehouseItemId === warehouseItemId);
          if (existing) {
            const mergedSerials = cleanSerials.length > 0
              ? Array.from(new Set([...(existing.serials || []), ...cleanSerials]))
              : existing.serials;
            const inBoxQty = mergedSerials && mergedSerials.length > 0
              ? Math.max(0, mergedSerials.length - (existing.outSerials?.length || 0))
              : existing.qty + addQty;
            return { ...b, items: b.items.map((bi) => bi.warehouseItemId !== warehouseItemId ? bi : { ...bi, qty: inBoxQty, originalQty: (bi.originalQty || bi.qty) + addQty, serials: mergedSerials }) };
          }
          return { ...b, items: [...b.items, { warehouseItemId, name: whItem.name, category: whItem.category, serialNumber: whItem.serialNumber, serials: cleanSerials.length > 0 ? cleanSerials : undefined, qty: addQty, originalQty: addQty, consumable: whItem.consumable }] };
        });
      }
      saveVisit({ ...visit, boxes: currentBoxes });
      const box = visit.boxes.find((b) => b.id === boxId);
      logActivity("fill_box", `إضافة ${items.length} صنف إلى ${box?.name || "صندوق"}`, visit.name, visitId);
    },
    [visits, warehouseItems, logActivity]
  );

  const handleBulkDeleteWarehouseItems = useCallback(
    (ids: string[]) => {
      const names: string[] = [];
      ids.forEach((id) => {
        const item = warehouseItems.find((i) => i.id === id);
        if (item) names.push(item.name);
        deleteWarehouseItemFS(id);
      });
      if (names.length > 0) {
        if (names.length === 1) {
          logActivity("delete_item", `حذف صنف من المخزن: ${names[0]}`);
        } else {
          logActivity("delete_item", `حذف ${names.length} أصناف من المخزن: ${names[0]} و ${names.length - 1} أخرى`);
        }
      }
    },
    [warehouseItems, logActivity]
  );

  const handleDeleteVisit = useCallback(
    (visitId: string) => {
      const visit = visits.find((v) => v.id === visitId);
      if (visit) logActivity("complete_visit", `حذف زيارة: ${visit.name}`);
      deleteVisitFS(visitId);
    },
    [visits, logActivity]
  );

  const handleFillBoxesFromTemplate = useCallback(
    (visitId: string) => {
      const visit = visits.find((v) => v.id === visitId);
      if (!visit) return;
      const updated: Visit = {
        ...visit,
        boxes: visit.boxes.map((b) => ({
          ...b,
          items: b.items.map((bi) => ({ ...bi, qty: bi.originalQty || bi.qty })),
        })),
      };
      saveVisit(updated);
      logActivity("fill_box", `تعبئة صناديق من القالب: ${visit.name}`, undefined, visitId);
    },
    [visits, logActivity]
  );

  // ── Users ─────────────────────────────────────────
  const handleAddUser = useCallback(
    (name: string, role: User["role"], pin: string) => {
      const user: User = { id: `user-${Date.now()}`, name, role, pin, active: true };
      saveUser(user);
      logActivity("add_user", `إضافة مستخدم جديد: ${name}`, `الدور: ${role}`);
    },
    [logActivity]
  );

  const handleEditUser = useCallback(
    (id: string, name: string, role: User["role"], pin: string) => {
      const user = users.find((u) => u.id === id);
      if (user) saveUser({ ...user, name, role, pin });
    },
    [users]
  );

  const handleDeleteUser = useCallback(
    (id: string) => {
      const user = users.find((u) => u.id === id);
      deleteUserFS(id);
      if (user) logActivity("delete_user", `حذف المستخدم: ${user.name}`);
    },
    [users, logActivity]
  );

  const handleToggleUser = useCallback(
    (id: string) => {
      const user = users.find((u) => u.id === id);
      if (user) saveUser({ ...user, active: !user.active });
    },
    [users]
  );

  return (
    <DataContext.Provider
      value={{
        warehouseItems, visits, categories, activityLog, users, archivedVisits, loading,
        newNotificationCount, clearNotifications, setAuthUser: setAuthUserCallback,
        logActivity,
        handleAddWarehouseItem, handleEditWarehouseItem, handleDeleteWarehouseItem,
        handleAddCategory, handleEditCategory, handleDeleteCategory,
        handleAddVisit, handleDeleteVisit, handleToggleVisit, handleActivateVisit, handleCollectVisit,
        handleFillBox, handleReturnItems, handleAddBox, handleDeleteBox,
        handleFillBoxesFromTemplate, handleUpdateBoxItemQty, handleToggleBoxItemSerial,
        handleAddItemToBox,
        handleBulkAddItemsToBox, handleBulkDeleteWarehouseItems,
        handleAddUser, handleEditUser, handleDeleteUser, handleToggleUser,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
