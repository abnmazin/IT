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
} from "@/types";
import {
  subscribeWarehouseItems,
  subscribeVisits,
  subscribeCategories,
  subscribeActivityLog,
  subscribeUsers,
  saveWarehouseItem,
  deleteWarehouseItemFS,
  saveVisit,
  deleteVisitFS,
  saveCategory,
  deleteCategoryFS,
  saveUser,
  deleteUserFS,
  addActivityEntry,
  seedFirestoreIfNeeded,
} from "@/lib/firestore";

interface DataContextType {
  warehouseItems: WarehouseItem[];
  visits: Visit[];
  categories: Category[];
  activityLog: ActivityLogEntry[];
  users: User[];
  loading: boolean;
  newNotificationCount: number;
  clearNotifications: () => void;
  setAuthUser: (user: User | null) => void;

  logActivity: (type: ActivityType, description: string, details?: string, visitId?: string) => void;

  handleAddWarehouseItem: (name: string, category: string, serialNumber: string, totalQty: number, consumable: boolean) => void;
  handleEditWarehouseItem: (id: string, name: string, category: string, serialNumber: string, totalQty: number, consumable: boolean) => void;
  handleDeleteWarehouseItem: (id: string) => void;

  handleAddCategory: (key: string, label: string, serialTracked: boolean, consumable: boolean) => void;
  handleEditCategory: (id: string, key: string, label: string, serialTracked: boolean, consumable: boolean) => void;
  handleDeleteCategory: (id: string) => void;

  handleAddVisit: (name: string, date: string, hijriDate?: string) => void;
  handleDeleteVisit: (visitId: string) => void;
  handleToggleVisit: (visitId: string) => void;
  handleActivateVisit: (visitId: string, year: string, hijriDate: string) => void;
  handleCollectVisit: (visitId: string, collected: { warehouseItemId: string; qty: number; status: "returned" | "consumed" }[]) => void;
  handleFillBox: (visitId: string, boxId: string, items: BoxItem[]) => void;
  handleReturnItems: (visitId: string, boxId: string, returned: { warehouseItemId: string; qty: number }[]) => void;
  handleAddBox: (visitId: string, name: string, label: string) => void;
  handleDeleteBox: (visitId: string, boxId: string) => void;
  handleReactivateVisit: (visitId: string) => void;
  handleFillBoxesFromTemplate: (visitId: string) => void;
  handleUpdateBoxItemQty: (visitId: string, boxId: string, warehouseItemId: string, delta: number) => void;
  handleAddItemToBox: (visitId: string, boxId: string, warehouseItemId: string, qty: number) => void;
  handleBulkAddItemsToBox: (visitId: string, boxId: string, items: { warehouseItemId: string; qty: number }[]) => void;
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

export function DataProvider({ children }: { children: ReactNode }) {
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNotificationCount, setNewNotificationCount] = useState(0);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const prevLogLength = useRef(0);

  // Subscribe to Firestore
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    async function init() {
      await seedFirestoreIfNeeded();
      unsubs = [
        subscribeWarehouseItems((items) => { setWarehouseItems(items); setLoading(false); }),
        subscribeVisits((v) => setVisits(v)),
        subscribeCategories((c) => setCategories(c)),
        subscribeActivityLog((log) => setActivityLog(log)),
        subscribeUsers((u) => setUsers(u)),
      ];
    }

    init();
    return () => unsubs.forEach((u) => u());
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
    (name: string, category: string, serialNumber: string, totalQty: number, consumable: boolean) => {
      const item: WarehouseItem = {
        id: `wh-${Date.now()}`,
        name,
        category: category as WarehouseItem["category"],
        serialNumber: serialNumber || undefined,
        totalQty,
        consumable,
      };
      saveWarehouseItem(item);
      logActivity("add_item", `إضافة صنف للمخزن: ${name}`);
    },
    [logActivity]
  );

  const handleEditWarehouseItem = useCallback(
    (id: string, name: string, category: string, serialNumber: string, totalQty: number, consumable: boolean) => {
      const item: WarehouseItem = {
        id,
        name,
        category: category as WarehouseItem["category"],
        serialNumber: serialNumber || undefined,
        totalQty,
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
    (name: string, date: string, hijriDate?: string) => {
      const visit: Visit = {
        id: `visit-${Date.now()}`,
        name,
        date,
        hijriDate: hijriDate || undefined,
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
      saveVisit({ ...visit, status: nextStatus as Visit["status"] });
      logActivity(
        nextStatus === "active" ? "activate_visit" :
        nextStatus === "collecting" ? "collect_visit" :
        nextStatus === "completed" ? "complete_visit" : "deactivate_visit",
        `${nextStatus === "active" ? "تفعيل" : nextStatus === "collecting" ? "جمع العناصر" : nextStatus === "completed" ? "إنهاء" : "إلغاء تفعيل"} زيارة: ${visit.name}`,
        undefined,
        visitId
      );
    },
    [visits, logActivity]
  );

  const handleActivateVisit = useCallback(
    (visitId: string, year: string, hijriDate: string) => {
      const visit = visits.find((v) => v.id === visitId);
      if (!visit) return;
      saveVisit({ ...visit, status: "active", year: year || undefined, hijriDate: hijriDate || undefined });
      logActivity("activate_visit", `تفعيل زيارة: ${visit.name} — ${year}`, undefined, visitId);
    },
    [visits, logActivity]
  );

  const handleCollectVisit = useCallback(
    (visitId: string, collected: { warehouseItemId: string; qty: number; status: "returned" | "consumed" }[]) => {
      const visit = visits.find((v) => v.id === visitId);
      if (!visit) return;
      const updated: Visit = {
        ...visit,
        status: "completed",
        boxes: visit.boxes.map((b) => ({
          ...b,
          items: b.items.map((bi) => {
            const c = collected.find((x) => x.warehouseItemId === bi.warehouseItemId);
            if (c) return { ...bi, status: c.status, returnedQty: c.status === "returned" ? c.qty : 0 };
            return { ...bi, status: "missing" as const };
          }),
        })),
      };
      saveVisit(updated);
      logActivity("complete_visit", `إنهاء زيارة: ${visit.name}`, `تم جمع ${collected.length} صنف`, visitId);
    },
    [visits, logActivity]
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
      items.forEach((item) => {
        const whItem = warehouseItems.find((w) => w.id === item.warehouseItemId);
        if (whItem) {
          saveWarehouseItem({ ...whItem, totalQty: Math.max(0, whItem.totalQty - item.qty) });
        }
      });
      const box = visit.boxes.find((b) => b.id === boxId);
      const itemNames = items.map((i) => `${i.name}(${i.qty})`).join(" + ");
      logActivity("fill_box", `تعبئة ${box?.name || "صندوق"} — ${itemNames}`, visit.name, visitId);
    },
    [visits, warehouseItems, logActivity]
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
      if (delta > 0) {
        const whItem = warehouseItems.find((w) => w.id === warehouseItemId);
        if (!whItem || whItem.totalQty < delta) return;
        const updated: Visit = {
          ...visit,
          boxes: visit.boxes.map((b) => {
            if (b.id !== boxId) return b;
            return {
              ...b,
              items: b.items.map((bi) => {
                if (bi.warehouseItemId !== warehouseItemId) return bi;
                return { ...bi, qty: bi.qty + delta, originalQty: (bi.originalQty || bi.qty) + delta };
              }),
            };
          }),
        };
        saveVisit(updated);
        saveWarehouseItem({ ...whItem, totalQty: whItem.totalQty - delta });
      } else {
        const updated: Visit = {
          ...visit,
          boxes: visit.boxes.map((b) => {
            if (b.id !== boxId) return b;
            return {
              ...b,
              items: b.items.map((bi) => {
                if (bi.warehouseItemId !== warehouseItemId) return bi;
                return { ...bi, qty: Math.max(0, bi.qty + delta) };
              }),
            };
          }),
        };
        saveVisit(updated);
      }
      const item = visit.boxes.find((b) => b.id === boxId)?.items.find((i) => i.warehouseItemId === warehouseItemId);
      if (item) {
        const label = delta > 0 ? "إضافة" : "نقصان";
        logActivity("fill_box", `${label} ${Math.abs(delta)} × ${item.name} في صندوق ${visit.boxes.find((b) => b.id === boxId)?.name || ""}`, visit.name, visitId);
      }
    },
    [visits, warehouseItems, logActivity]
  );

  const handleAddItemToBox = useCallback(
    (visitId: string, boxId: string, warehouseItemId: string, qty: number) => {
      const visit = visits.find((v) => v.id === visitId);
      if (!visit) return;
      const whItem = warehouseItems.find((w) => w.id === warehouseItemId);
      if (!whItem || whItem.totalQty < qty) return;
      const box = visit.boxes.find((b) => b.id === boxId);
      if (!box) return;
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
                return { ...bi, qty: bi.qty + qty, originalQty: (bi.originalQty || bi.qty) + qty };
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
          qty,
          originalQty: qty,
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
      saveWarehouseItem({ ...whItem, totalQty: whItem.totalQty - qty });
      logActivity("fill_box", `إضافة ${qty} × ${whItem.name} إلى ${box.name}`, visit.name, visitId);
    },
    [visits, warehouseItems, logActivity]
  );

  const handleBulkAddItemsToBox = useCallback(
    (visitId: string, boxId: string, items: { warehouseItemId: string; qty: number }[]) => {
      const visit = visits.find((v) => v.id === visitId);
      if (!visit) return;
      let currentBoxes = visit.boxes;
      const warehouseUpdates: WarehouseItem[] = [];
      for (const { warehouseItemId, qty } of items) {
        const whItem = warehouseItems.find((w) => w.id === warehouseItemId);
        if (!whItem || whItem.totalQty < qty) continue;
        warehouseUpdates.push({ ...whItem, totalQty: whItem.totalQty - qty });
        currentBoxes = currentBoxes.map((b) => {
          if (b.id !== boxId) return b;
          const existing = b.items.find((i) => i.warehouseItemId === warehouseItemId);
          if (existing) {
            return { ...b, items: b.items.map((bi) => bi.warehouseItemId !== warehouseItemId ? bi : { ...bi, qty: bi.qty + qty, originalQty: (bi.originalQty || bi.qty) + qty }) };
          }
          return { ...b, items: [...b.items, { warehouseItemId, name: whItem.name, category: whItem.category, serialNumber: whItem.serialNumber, qty, originalQty: qty, consumable: whItem.consumable }] };
        });
      }
      saveVisit({ ...visit, boxes: currentBoxes });
      warehouseUpdates.forEach((wu) => saveWarehouseItem(wu));
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

  const handleReactivateVisit = useCallback(
    (visitId: string) => {
      const visit = visits.find((v) => v.id === visitId);
      if (!visit) return;
      const restored: Record<string, number> = {};
      visit.boxes.forEach((b) =>
        b.items.forEach((bi) => {
          if (bi.status === "returned" && bi.returnedQty && bi.returnedQty > 0) {
            restored[bi.warehouseItemId] = (restored[bi.warehouseItemId] || 0) + bi.returnedQty;
          }
        })
      );
      const updated: Visit = {
        ...visit,
        status: "inactive",
        boxes: visit.boxes.map((b) => ({
          ...b,
          items: b.items.map((bi) => ({ ...bi, qty: 0, returnedQty: undefined, status: undefined })),
        })),
      };
      saveVisit(updated);
      Object.entries(restored).forEach(([id, qty]) => {
        const whItem = warehouseItems.find((w) => w.id === id);
        if (whItem) saveWarehouseItem({ ...whItem, totalQty: whItem.totalQty + qty });
      });
      logActivity("deactivate_visit", `إعادة تفعيل زيارة: ${visit.name}`, "تم إرجاع العناصر المُرجعة للمخزن، القالب جاهز", visitId);
    },
    [visits, warehouseItems, logActivity]
  );

  const handleFillBoxesFromTemplate = useCallback(
    (visitId: string) => {
      const visit = visits.find((v) => v.id === visitId);
      if (!visit) return;
      const needed: Record<string, number> = {};
      visit.boxes.forEach((b) =>
        b.items.forEach((bi) => { needed[bi.warehouseItemId] = (needed[bi.warehouseItemId] || 0) + bi.qty; })
      );
      const updated: Visit = {
        ...visit,
        boxes: visit.boxes.map((b) => ({
          ...b,
          items: b.items.map((bi) => ({ ...bi, qty: bi.qty })),
        })),
      };
      saveVisit(updated);
      Object.entries(needed).forEach(([id, req]) => {
        if (req > 0) {
          const whItem = warehouseItems.find((w) => w.id === id);
          if (whItem) saveWarehouseItem({ ...whItem, totalQty: Math.max(0, whItem.totalQty - req) });
        }
      });
      logActivity("fill_box", `تعبئة صناديق من القالب: ${visit.name}`, undefined, visitId);
    },
    [visits, warehouseItems, logActivity]
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
        warehouseItems, visits, categories, activityLog, users, loading,
        newNotificationCount, clearNotifications, setAuthUser: setAuthUserCallback,
        logActivity,
        handleAddWarehouseItem, handleEditWarehouseItem, handleDeleteWarehouseItem,
        handleAddCategory, handleEditCategory, handleDeleteCategory,
        handleAddVisit, handleDeleteVisit, handleToggleVisit, handleActivateVisit, handleCollectVisit,
        handleFillBox, handleReturnItems, handleAddBox, handleDeleteBox,
        handleReactivateVisit, handleFillBoxesFromTemplate, handleUpdateBoxItemQty,
        handleAddItemToBox,
        handleBulkAddItemsToBox, handleBulkDeleteWarehouseItems,
        handleAddUser, handleEditUser, handleDeleteUser, handleToggleUser,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
