"use client";

import { useState, useCallback, useMemo } from "react";
import {
  View,
  WarehouseItem,
  Visit,
  Box,
  BoxItem,
  Transfer,
  TransferItem,
  User,
  UserRole,
  Category,
  ActivityLogEntry,
  ActivityType,
} from "@/types";
import {
  initialWarehouseItems,
  initialVisits,
  initialUsers,
  initialActivityLog,
} from "@/data/mockData";
import { defaultCategories } from "@/types";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import DashboardView from "@/components/DashboardView";
import WarehouseView from "@/components/WarehouseView";
import VisitsView from "@/components/VisitsView";
import VisitDetailView from "@/components/VisitDetailView";
import BoxDetailView from "@/components/BoxDetailView";
import BoxesView from "@/components/BoxesView";
import CollectionView from "@/components/CollectionView";
import VisitReport from "@/components/VisitReport";
import CompletedVisitsView from "@/components/TransfersView";
import SettingsView from "@/components/SettingsView";
import CategoriesSettings from "@/components/CategoriesSettings";
import ActivityLogView from "@/components/ActivityLogView";

function now() {
  return new Date().toISOString();
}

function today() {
  return new Date().toISOString().split("T")[0];
}

export default function Home() {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);

  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>(initialWarehouseItems);
  const [visits, setVisits] = useState<Visit[]>(initialVisits);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>(initialActivityLog);

  const currentUser = useMemo(() => users[0], [users]);

  const logActivity = useCallback(
    (type: ActivityType, description: string, details?: string) => {
      const entry: ActivityLogEntry = {
        id: `act-${Date.now()}`,
        type,
        description,
        userId: currentUser.id,
        userName: currentUser.name,
        timestamp: now(),
        details,
      };
      setActivityLog((prev) => [entry, ...prev]);
    },
    [currentUser]
  );

  const selectedVisit = useMemo(
    () => visits.find((v) => v.id === selectedVisitId) || null,
    [visits, selectedVisitId]
  );

  const selectedBox = useMemo(
    () => selectedVisit?.boxes.find((b) => b.id === selectedBoxId) || null,
    [selectedVisit, selectedBoxId]
  );

  const totalWarehouseQty = warehouseItems.reduce((a, i) => a + i.totalQty, 0);
  const activeVisitCount = visits.filter((v) => v.status === "active").length;
  const totalBoxItems = visits.reduce(
    (a, v) => a + v.boxes.reduce((b, box) => b + box.items.reduce((c, i) => c + i.qty, 0), 0),
    0
  );

  const handleAddWarehouseItem = useCallback(
    (name: string, category: string, serialNumber: string, totalQty: number, consumable: boolean) => {
      const newItem: WarehouseItem = {
        id: `wh-${Date.now()}`,
        name,
        category: category as WarehouseItem["category"],
        serialNumber: serialNumber || undefined,
        totalQty,
        consumable,
      };
      setWarehouseItems((prev) => [...prev, newItem]);
      logActivity("add_item", `إضافة صنف للمخزن: ${name}`, `الكمية: ${totalQty}`);
    },
    [logActivity]
  );

  const handleEditWarehouseItem = useCallback(
    (id: string, name: string, category: string, serialNumber: string, totalQty: number, consumable: boolean) => {
      setWarehouseItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, name, category: category as WarehouseItem["category"], serialNumber: serialNumber || undefined, totalQty, consumable }
            : i
        )
      );
      logActivity("add_item", `تعديل صنف في المخزن: ${name}`);
    },
    [logActivity]
  );

  const handleDeleteWarehouseItem = useCallback(
    (id: string) => {
      const item = warehouseItems.find((i) => i.id === id);
      setWarehouseItems((prev) => prev.filter((i) => i.id !== id));
      if (item) {
        logActivity("add_item", `حذف صنف من المخزن: ${item.name}`);
      }
    },
    [warehouseItems, logActivity]
  );

  const handleAddVisit = useCallback(
    (name: string, date: string, hijriDate?: string) => {
      const newVisit: Visit = {
        id: `visit-${Date.now()}`,
        name,
        date,
        hijriDate: hijriDate || undefined,
        status: "inactive",
        boxes: [],
      };
      setVisits((prev) => [...prev, newVisit]);
      logActivity("add_visit", `إضافة زيارة جديدة: ${name}`);
    },
    [logActivity]
  );

  const handleToggleVisit = useCallback(
    (visitId: string) => {
      setVisits((prev) =>
        prev.map((v) => {
          if (v.id !== visitId) return v;
          if (v.status === "inactive") return { ...v, status: "active" as const };
          if (v.status === "active") return { ...v, status: "collecting" as const };
          if (v.status === "collecting") return { ...v, status: "completed" as const };
          return { ...v, status: "inactive" as const };
        })
      );
      const visit = visits.find((v) => v.id === visitId);
      if (visit) {
        const nextStatus = visit.status === "inactive" ? "active" : visit.status === "active" ? "collecting" : visit.status === "collecting" ? "completed" : "inactive";
        logActivity(
          nextStatus === "active" ? "activate_visit" : nextStatus === "collecting" ? "collect_visit" : nextStatus === "completed" ? "complete_visit" : "deactivate_visit",
          `${nextStatus === "active" ? "تفعيل" : nextStatus === "collecting" ? "جمع العناصر" : nextStatus === "completed" ? "إنهاء" : "إلغاء تفعيل"} زيارة: ${visit.name}`
        );
      }
    },
    [visits, logActivity]
  );

  const handleCollectVisit = useCallback(
    (visitId: string, collected: { warehouseItemId: string; qty: number; status: "returned" | "consumed" }[]) => {
      setVisits((prev) =>
        prev.map((v) => {
          if (v.id !== visitId) return v;
          return {
            ...v,
            status: "completed" as const,
            boxes: v.boxes.map((b) => ({
              ...b,
              items: b.items.map((bi) => {
                const c = collected.find((x) => x.warehouseItemId === bi.warehouseItemId);
                if (c) {
                  return { ...bi, status: c.status, returnedQty: c.status === "returned" ? c.qty : 0 };
                }
                return { ...bi, status: "missing" as const };
              }),
            })),
          };
        })
      );
      const visit = visits.find((v) => v.id === visitId);
      logActivity("complete_visit", `إنهاء زيارة: ${visit?.name || ""}`, `تم جمع ${collected.length} صنف`);
    },
    [visits, logActivity]
  );

  const handleFillBox = useCallback(
    (visitId: string, boxId: string, items: BoxItem[]) => {
      setVisits((prev) =>
        prev.map((v) => {
          if (v.id !== visitId) return v;
          return {
            ...v,
            boxes: v.boxes.map((b) => {
              if (b.id !== boxId) return b;
              return { ...b, items: [...b.items, ...items] };
            }),
          };
        })
      );
      setWarehouseItems((prev) =>
        prev.map((wh) => {
          const filled = items.find((i) => i.warehouseItemId === wh.id);
          if (filled) {
            return { ...wh, totalQty: Math.max(0, wh.totalQty - filled.qty) };
          }
          return wh;
        })
      );
      const visit = visits.find((v) => v.id === visitId);
      const box = visit?.boxes.find((b) => b.id === boxId);
      const itemNames = items.map((i) => `${i.name}(${i.qty})`).join(" + ");
      logActivity(
        "fill_box",
        `تعبئة ${box?.name || "صندوق"} — ${itemNames}`,
        visit?.name
      );
    },
    [visits, logActivity]
  );

  const handleReturnItems = useCallback(
    (visitId: string, boxId: string, returned: { warehouseItemId: string; qty: number }[]) => {
      setVisits((prev) =>
        prev.map((v) => {
          if (v.id !== visitId) return v;
          return {
            ...v,
            boxes: v.boxes.map((b) => {
              if (b.id !== boxId) return b;
              return {
                ...b,
                items: b.items
                  .map((bi) => {
                    const ret = returned.find((r) => r.warehouseItemId === bi.warehouseItemId);
                    if (ret) {
                      return { ...bi, qty: bi.qty - ret.qty, returnedQty: ret.qty };
                    }
                    return bi;
                  })
                  .filter((bi) => bi.qty > 0),
              };
            }),
          };
        })
      );
      setWarehouseItems((prev) =>
        prev.map((wh) => {
          const ret = returned.find((r) => r.warehouseItemId === wh.id);
          if (ret) {
            return { ...wh, totalQty: wh.totalQty + ret.qty };
          }
          return wh;
        })
      );
      const visit = visits.find((v) => v.id === visitId);
      logActivity(
        "return_items",
        `إرجاع مواد من صندوق ${boxId} للمخزن`,
        visit?.name
      );
    },
    [visits, logActivity]
  );

  const handleAddBox = useCallback(
    (visitId: string, name: string, label: string) => {
      const newBox: Box = {
        id: `box-${Date.now()}`,
        name,
        label: label || undefined,
        items: [],
      };
      setVisits((prev) =>
        prev.map((v) => {
          if (v.id !== visitId) return v;
          return { ...v, boxes: [...v.boxes, newBox] };
        })
      );
      logActivity("fill_box", `إضافة صندوق جديد: ${name}`);
    },
    [logActivity]
  );

  const handleDeleteBox = useCallback(
    (visitId: string, boxId: string) => {
      setVisits((prev) =>
        prev.map((v) => {
          if (v.id !== visitId) return v;
          return { ...v, boxes: v.boxes.filter((b) => b.id !== boxId) };
        })
      );
      logActivity("fill_box", `حذف صندوق: ${boxId}`);
    },
    [logActivity]
  );

  const handleAddUser = useCallback(
    (name: string, email: string, role: UserRole) => {
      const newUser: User = { id: `user-${Date.now()}`, name, email, role, active: true };
      setUsers((prev) => [...prev, newUser]);
      logActivity("add_user", `إضافة مستخدم جديد: ${name}`, `الدور: ${role}`);
    },
    [logActivity]
  );

  const handleEditUser = useCallback(
    (id: string, name: string, email: string, role: UserRole) => {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, name, email, role } : u)));
      logActivity("edit_user", `تعديل بيانات المستخدم: ${name}`);
    },
    [logActivity]
  );

  const handleDeleteUser = useCallback(
    (id: string) => {
      const user = users.find((u) => u.id === id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      if (user) logActivity("delete_user", `حذف المستخدم: ${user.name}`);
    },
    [users, logActivity]
  );

  const handleToggleUser = useCallback(
    (id: string) => {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
      const user = users.find((u) => u.id === id);
      if (user) logActivity("edit_user", `${user.active ? "تعطيل" : "تفعيل"} حساب: ${user.name}`);
    },
    [users, logActivity]
  );

  const handleAddCategory = useCallback(
    (key: string, label: string, serialTracked: boolean, consumable: boolean) => {
      const newCat: Category = { id: `cat-${Date.now()}`, key: key as Category["key"], label, serialTracked, consumable };
      setCategories((prev) => [...prev, newCat]);
      logActivity("add_category", `إضافة فئة جديدة: ${label}`);
    },
    [logActivity]
  );

  const handleEditCategory = useCallback(
    (id: string, key: string, label: string, serialTracked: boolean, consumable: boolean) => {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, key: key as Category["key"], label, serialTracked, consumable } : c))
      );
      logActivity("edit_category", `تعديل الفئة: ${label}`);
    },
    [logActivity]
  );

  const handleDeleteCategory = useCallback(
    (id: string) => {
      const cat = categories.find((c) => c.id === id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (cat) logActivity("delete_category", `حذف الفئة: ${cat.label}`);
    },
    [categories, logActivity]
  );

  const handleUpdateBoxItemQty = useCallback(
    (visitId: string, boxId: string, warehouseItemId: string, delta: number) => {
      setVisits((prev) =>
        prev.map((v) => {
          if (v.id !== visitId) return v;
          return {
            ...v,
            boxes: v.boxes.map((b) => {
              if (b.id !== boxId) return b;
              return {
                ...b,
                items: b.items
                  .map((bi) => {
                    if (bi.warehouseItemId !== warehouseItemId) return bi;
                    const newQty = bi.qty + delta;
                    return newQty > 0 ? { ...bi, qty: newQty } : bi;
                  })
                  .filter((bi) => bi.qty > 0),
              };
            }),
          };
        })
      );
    },
    []
  );

  const handleDeleteBoxItem = useCallback(
    (visitId: string, boxId: string, warehouseItemId: string) => {
      setVisits((prev) =>
        prev.map((v) => {
          if (v.id !== visitId) return v;
          return {
            ...v,
            boxes: v.boxes.map((b) => {
              if (b.id !== boxId) return b;
              return { ...b, items: b.items.filter((bi) => bi.warehouseItemId !== warehouseItemId) };
            }),
          };
        })
      );
    },
    []
  );

  const handleNavigate = useCallback(
    (view: View) => {
      setActiveView(view);
      setSelectedVisitId(null);
      setSelectedBoxId(null);
      setMobileMenuOpen(false);
    },
    []
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        activeView={activeView}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-200 ${
          sidebarCollapsed ? "mr-[68px]" : "mr-0 lg:mr-60"
        }`}
      >
        <Header
          onMenuToggle={() => setMobileMenuOpen((o) => !o)}
          currentUser={currentUser}
        />

        <main className="flex-1 overflow-y-auto">
          {activeView === "dashboard" && (
            <DashboardView
              totalWarehouseItems={warehouseItems.length}
              totalWarehouseQty={totalWarehouseQty}
              activeVisitCount={activeVisitCount}
              totalBoxItems={totalBoxItems}
              onNavigateToWarehouse={() => handleNavigate("warehouse")}
              onNavigateToVisits={() => handleNavigate("visits")}
              onNavigateToBoxes={() => handleNavigate("boxes")}
            />
          )}
          {activeView === "warehouse" && (
            <WarehouseView
              items={warehouseItems}
              categories={categories}
              onAddItem={handleAddWarehouseItem}
              onEditItem={handleEditWarehouseItem}
              onDeleteItem={handleDeleteWarehouseItem}
              onAddCategory={handleAddCategory}
            />
          )}
          {activeView === "boxes" && !selectedBoxId && (
            <BoxesView
              visits={visits}
              categories={categories}
              onSelectBox={(visitId, boxId) => {
                setSelectedVisitId(visitId);
                setSelectedBoxId(boxId);
              }}
            />
          )}
           {activeView === "boxes" && selectedVisit && selectedBoxId && selectedBox && (
            <BoxDetailView
              box={selectedBox}
              visitName={selectedVisit.name}
              categories={categories}
              onBack={() => setSelectedBoxId(null)}
              onUpdateItemQty={(boxId, warehouseItemId, delta) => {
                handleUpdateBoxItemQty(selectedVisit.id, boxId, warehouseItemId, delta);
              }}
            />
          )}
          {activeView === "visits" && !selectedVisitId && (
            <VisitsView
              visits={visits}
              onSelectVisit={setSelectedVisitId}
              onAddVisit={handleAddVisit}
              onToggleVisit={handleToggleVisit}
            />
          )}
          {activeView === "visits" && selectedVisit && !selectedBoxId && selectedVisit.status !== "collecting" && selectedVisit.status !== "completed" && (
            <VisitDetailView
              visit={selectedVisit}
              warehouseItems={warehouseItems}
              categories={categories}
              onBack={() => setSelectedVisitId(null)}
              onSelectBox={setSelectedBoxId}
              onToggleVisit={handleToggleVisit}
              onFillBox={handleFillBox}
              onReturnItems={handleReturnItems}
              onAddBox={handleAddBox}
              onDeleteBox={handleDeleteBox}
              onStartCollect={handleToggleVisit}
            />
          )}
          {activeView === "visits" && selectedVisit && !selectedBoxId && selectedVisit.status === "collecting" && (
            <CollectionView
              visit={selectedVisit}
              warehouseItems={warehouseItems}
              categories={categories}
              onBack={() => setSelectedVisitId(null)}
              onComplete={handleCollectVisit}
            />
          )}
          {activeView === "visits" && selectedVisit && !selectedBoxId && selectedVisit.status === "completed" && (
            <VisitReport
              visit={selectedVisit}
              categories={categories}
              onBack={() => setSelectedVisitId(null)}
            />
          )}
           {activeView === "visits" && selectedVisit && selectedBoxId && selectedBox && (
            <BoxDetailView
              box={selectedBox}
              visitName={selectedVisit.name}
              categories={categories}
              onBack={() => setSelectedBoxId(null)}
              onUpdateItemQty={(boxId, warehouseItemId, delta) => {
                handleUpdateBoxItemQty(selectedVisit.id, boxId, warehouseItemId, delta);
              }}
            />
          )}
          {activeView === "completed-visits" && (
            <CompletedVisitsView
              visits={visits}
              categories={categories}
              onSelectVisit={(visitId) => {
                setSelectedVisitId(visitId);
              }}
            />
          )}
          {activeView === "users" && (
            <SettingsView
              users={users}
              onAddUser={handleAddUser}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
              onToggleUser={handleToggleUser}
            />
          )}
          {activeView === "categories-settings" && (
            <div className="p-4 sm:p-6 space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">إدارة الفئات</h1>
                <p className="text-sm text-slate-500 mt-1">
                  إضافة وتعديل وحذف فئات العناصر
                </p>
              </div>
              <CategoriesSettings
                categories={categories}
                onAdd={handleAddCategory}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
              />
            </div>
          )}
          {activeView === "activity-log" && (
            <div className="p-4 sm:p-6 space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">سجل النشاط</h1>
                <p className="text-sm text-slate-500 mt-1">
                  جميع العمليات والتعديلات
                </p>
              </div>
              <ActivityLogView activityLog={activityLog} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
