"use client";

import { useState, useCallback, useMemo } from "react";
import {
  View,
  Site,
  Location,
  InventoryItem,
  Transfer,
  TransferItem,
  User,
  UserRole,
  Category,
  ActivityLogEntry,
  ActivityType,
} from "@/types";
import {
  initialSites,
  initialLocations,
  initialItems,
  initialTransfers,
  initialUsers,
  initialActivityLog,
} from "@/data/mockData";
import { defaultCategories } from "@/types";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import DashboardView from "@/components/DashboardView";
import LocationsView from "@/components/LocationsView";
import InventoryView from "@/components/InventoryView";
import TransfersView from "@/components/TransfersView";
import SettingsView from "@/components/SettingsView";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  const [sites, setSites] = useState<Site[]>(initialSites);
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [transfers, setTransfers] = useState<Transfer[]>(initialTransfers);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [activityLog, setActivityLog] =
    useState<ActivityLogEntry[]>(initialActivityLog);

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

  const filteredLocations = useMemo(() => {
    if (!selectedSiteId) return locations;
    return locations.filter((l) => l.siteId === selectedSiteId);
  }, [locations, selectedSiteId]);

  const filteredItems = useMemo(() => {
    const locIds = new Set(filteredLocations.map((l) => l.id));
    return items.filter((i) => locIds.has(i.locationId));
  }, [items, filteredLocations]);

  const siteName = useMemo(() => {
    if (!selectedSiteId) return "جميع المواقع";
    return sites.find((s) => s.id === selectedSiteId)?.name ?? "جميع المواقع";
  }, [sites, selectedSiteId]);

  const getItemName = useCallback(
    (itemId: string) => items.find((i) => i.id === itemId)?.name ?? "—",
    [items]
  );

  const handleUpdateItemQty = useCallback(
    (itemId: string, delta: number) => {
      const itemName = getItemName(itemId);
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== itemId) return item;
          const newQty = Math.max(
            0,
            Math.min(item.expectedQty, item.currentQty + delta)
          );
          return {
            ...item,
            currentQty: newQty,
            checkedOut: item.expectedQty - newQty,
          };
        })
      );
      logActivity(
        delta > 0 ? "return" : "checkout",
        `${delta > 0 ? "إرجاع" : "سحب"} ${itemName} (${delta > 0 ? "+" : "-"}${Math.abs(delta)})`
      );
    },
    [getItemName, logActivity]
  );

  const handleCheckoutItem = useCallback(
    (itemId: string, by: string) => {
      const itemName = getItemName(itemId);
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== itemId) return item;
          return {
            ...item,
            currentQty: 0,
            checkedOut: item.expectedQty,
            checkedOutBy: by,
            checkedOutDate: today(),
          };
        })
      );
      logActivity(
        "checkout",
        `سحب ${itemName} بواسطة ${by}`,
        `رقم تسلسلي: ${items.find((i) => i.id === itemId)?.serialNumber ?? "—"}`
      );
    },
    [getItemName, items, logActivity]
  );

  const handleReturnItem = useCallback(
    (itemId: string) => {
      const item = items.find((i) => i.id === itemId);
      const itemName = item?.name ?? "—";
      setItems((prev) =>
        prev.map((it) => {
          if (it.id !== itemId) return it;
          return {
            ...it,
            currentQty: it.expectedQty,
            checkedOut: 0,
            checkedOutBy: undefined,
            checkedOutDate: undefined,
          };
        })
      );
      logActivity(
        "return",
        `إرجاع ${itemName}`,
        item?.checkedOutBy ? `كان مستلماً بواسطة: ${item.checkedOutBy}` : undefined
      );
    },
    [items, logActivity]
  );

  const handleAddLocation = useCallback(
    (name: string, type: Location["type"], siteId: string, label?: string) => {
      const newLoc: Location = {
        id: `loc-${Date.now()}`,
        name,
        type,
        siteId,
        label,
      };
      setLocations((prev) => [...prev, newLoc]);
      const siteLabel = sites.find((s) => s.id === siteId)?.name ?? siteId;
      logActivity(
        "add_location",
        `إضافة مكان جديد: ${name}`,
        `الموقع: ${siteLabel}`
      );
    },
    [sites, logActivity]
  );

  const handleAddItem = useCallback(
    (
      name: string,
      category: InventoryItem["category"],
      locationId: string,
      serialNumber?: string,
      qty: number = 1
    ) => {
      const newItem: InventoryItem = {
        id: `item-${Date.now()}`,
        name,
        category,
        serialNumber,
        locationId,
        expectedQty: qty,
        currentQty: qty,
        checkedOut: 0,
      };
      setItems((prev) => [...prev, newItem]);
      const locName = locations.find((l) => l.id === locationId)?.name ?? "";
      logActivity(
        "add_item",
        `إضافة صنف: ${name}`,
        `المكان: ${locName}${serialNumber ? ` · الرقم التسلسلي: ${serialNumber}` : ""}`
      );
    },
    [locations, logActivity]
  );

  const handleTransferItems = useCallback(
    (
      itemIds: string[],
      fromSiteId: string,
      toSiteId: string,
      fromLocationId: string
    ) => {
      const transferItems: TransferItem[] = itemIds
        .map((id) => items.find((i) => i.id === id))
        .filter(Boolean)
        .map((item) => ({
          itemId: item!.id,
          itemName: item!.name,
          serialNumber: item!.serialNumber,
          fromLocationId,
        }));

      const transfer: Transfer = {
        id: `tr-${Date.now()}`,
        date: today(),
        fromSiteId,
        toSiteId,
        items: transferItems,
      };
      setTransfers((prev) => [transfer, ...prev]);

      const fromName = sites.find((s) => s.id === fromSiteId)?.name ?? "";
      const toName = sites.find((s) => s.id === toSiteId)?.name ?? "";
      const itemNames = transferItems.map((t) => t.itemName).join(" + ");
      logActivity(
        "transfer",
        `نقل ${itemNames} إلى ${toName}`,
        `من ${fromName}`
      );
    },
    [items, sites, logActivity]
  );

  const handleAddUser = useCallback(
    (name: string, email: string, role: UserRole) => {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        role,
        active: true,
      };
      setUsers((prev) => [...prev, newUser]);
      logActivity("add_user", `إضافة مستخدم جديد: ${name}`, `الدور: ${role}`);
    },
    [logActivity]
  );

  const handleEditUser = useCallback(
    (id: string, name: string, email: string, role: UserRole) => {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, name, email, role } : u))
      );
      logActivity("edit_user", `تعديل بيانات المستخدم: ${name}`);
    },
    [logActivity]
  );

  const handleDeleteUser = useCallback(
    (id: string) => {
      const user = users.find((u) => u.id === id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      if (user) {
        logActivity("delete_user", `حذف المستخدم: ${user.name}`);
      }
    },
    [users, logActivity]
  );

  const handleToggleUser = useCallback(
    (id: string) => {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
      );
      const user = users.find((u) => u.id === id);
      if (user) {
        logActivity(
          "edit_user",
          `${user.active ? "تعطيل" : "تفعيل"} حساب المستخدم: ${user.name}`
        );
      }
    },
    [users, logActivity]
  );

  const handleAddSite = useCallback(
    (name: string) => {
      const newSite: Site = { id: `site-${Date.now()}`, name };
      setSites((prev) => [...prev, newSite]);
      logActivity("add_site", `إضافة موقع جديد: ${name}`);
    },
    [logActivity]
  );

  const handleEditSite = useCallback(
    (id: string, name: string) => {
      setSites((prev) =>
        prev.map((s) => (s.id === id ? { ...s, name } : s))
      );
      logActivity("edit_site", `تعديل الموقع: ${name}`);
    },
    [logActivity]
  );

  const handleDeleteSite = useCallback(
    (id: string) => {
      const site = sites.find((s) => s.id === id);
      setSites((prev) => prev.filter((s) => s.id !== id));
      if (site) {
        logActivity("delete_site", `حذف الموقع: ${site.name}`);
      }
    },
    [sites, logActivity]
  );

  const handleAddCategory = useCallback(
    (key: string, label: string, serialTracked: boolean) => {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        key: key as Category["key"],
        label,
        serialTracked,
      };
      setCategories((prev) => [...prev, newCat]);
      logActivity("add_category", `إضافة فئة جديدة: ${label}`);
    },
    [logActivity]
  );

  const handleEditCategory = useCallback(
    (id: string, key: string, label: string, serialTracked: boolean) => {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, key: key as Category["key"], label, serialTracked } : c
        )
      );
      logActivity("edit_category", `تعديل الفئة: ${label}`);
    },
    [logActivity]
  );

  const handleDeleteCategory = useCallback(
    (id: string) => {
      const cat = categories.find((c) => c.id === id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (cat) {
        logActivity("delete_category", `حذف الفئة: ${cat.label}`);
      }
    },
    [categories, logActivity]
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        activeView={activeView}
        onNavigate={(v) => {
          setActiveView(v);
          setMobileMenuOpen(false);
        }}
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
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          onMenuToggle={() => setMobileMenuOpen((o) => !o)}
          sites={sites}
          selectedSiteId={selectedSiteId}
          onSelectSite={setSelectedSiteId}
          currentUser={currentUser}
        />

        <main className="flex-1 overflow-y-auto">
          {activeView === "dashboard" && (
            <DashboardView
              sites={sites}
              locations={filteredLocations}
              items={filteredItems}
              siteName={siteName}
              onNavigateToLocations={() => setActiveView("locations")}
            />
          )}
          {activeView === "locations" && (
            <LocationsView
              sites={sites}
              locations={filteredLocations}
              items={items}
              currentUser={currentUser}
              categories={categories}
              searchQuery={searchQuery}
              selectedSiteId={selectedSiteId}
              onUpdateItemQty={handleUpdateItemQty}
              onCheckoutItem={handleCheckoutItem}
              onReturnItem={handleReturnItem}
              onAddLocation={handleAddLocation}
              onAddItem={handleAddItem}
              onTransferItems={handleTransferItems}
            />
          )}
          {activeView === "inventory" && (
            <InventoryView
              sites={sites}
              locations={locations}
              items={filteredItems}
              searchQuery={searchQuery}
            />
          )}
          {activeView === "transfers" && (
            <TransfersView transfers={transfers} sites={sites} />
          )}
          {activeView === "settings" && (
            <SettingsView
              users={users}
              sites={sites}
              categories={categories}
              activityLog={activityLog}
              onAddUser={handleAddUser}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
              onToggleUser={handleToggleUser}
              onAddSite={handleAddSite}
              onEditSite={handleEditSite}
              onDeleteSite={handleDeleteSite}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}
        </main>
      </div>
    </div>
  );
}
