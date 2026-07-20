"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { View, UserRole } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import LoginPage from "@/components/LoginPage";
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
import DeveloperSettings from "@/components/DeveloperSettings";

const ROLE_ALLOWED_VIEWS: Record<UserRole, View[]> = {
  admin: ["dashboard", "warehouse", "boxes", "visits", "completed-visits", "users", "categories-settings", "activity-log"],
  developer: ["dashboard", "warehouse", "boxes", "visits", "completed-visits", "users", "categories-settings", "activity-log", "developer"],
  member: ["dashboard", "warehouse", "boxes", "visits", "completed-visits"],
  viewer: ["warehouse", "boxes"],
};

export default function Home() {
  const { user, loading: authLoading, logout } = useAuth();
  const data = useData();

  const [activeView, setActiveView] = useState<View>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);

  const selectedVisit = useMemo(
    () => data.visits.find((v) => v.id === selectedVisitId) || null,
    [data.visits, selectedVisitId]
  );

  const selectedBox = useMemo(
    () => selectedVisit?.boxes.find((b) => b.id === selectedBoxId) || null,
    [selectedVisit, selectedBoxId]
  );

  const totalWarehouseQty = data.warehouseItems.reduce((a, i) => a + i.totalQty, 0);
  const activeVisitCount = data.visits.filter((v) => v.status === "active").length;
  const totalBoxItems = data.visits.reduce(
    (a, v) => a + v.boxes.reduce((b, box) => b + box.items.reduce((c, i) => c + i.qty, 0), 0),
    0
  );

  const isViewer = user?.role === "viewer";

  useEffect(() => {
    data.setAuthUser(user);
    return () => data.setAuthUser(null);
  }, [user]);

  const handleNavigate = useCallback(
    (view: View) => {
      setActiveView(view);
      setSelectedVisitId(null);
      setSelectedBoxId(null);
      setMobileMenuOpen(false);
    },
    []
  );

  useEffect(() => {
    if (user && !ROLE_ALLOWED_VIEWS[user.role].includes(activeView)) {
      setActiveView(ROLE_ALLOWED_VIEWS[user.role][0]);
      setSelectedVisitId(null);
      setSelectedBoxId(null);
    }
  }, [user, activeView]);

  if (authLoading || data.loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        activeView={activeView}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        userRole={user.role}
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-200 ${
          sidebarCollapsed ? "mr-[68px]" : "mr-0 lg:mr-60"
        }`}
      >
        <Header
          onMenuToggle={() => setMobileMenuOpen((o) => !o)}
          currentUser={user}
          notificationCount={data.newNotificationCount}
          recentActivity={data.activityLog}
          onLogout={logout}
          onClearNotifications={data.clearNotifications}
          onNavigateActivity={() => handleNavigate("activity-log")}
        />

        <main className="flex-1 overflow-y-auto">
          {activeView === "dashboard" && (
            <DashboardView
              totalWarehouseItems={data.warehouseItems.length}
              totalWarehouseQty={totalWarehouseQty}
              activeVisitCount={activeVisitCount}
              totalBoxItems={totalBoxItems}
              visits={data.visits}
              onNavigateToWarehouse={() => handleNavigate("warehouse")}
              onNavigateToVisits={() => handleNavigate("visits")}
              onNavigateToBoxes={() => handleNavigate("boxes")}
            />
          )}
          {activeView === "warehouse" && (
            <WarehouseView
              items={data.warehouseItems}
              categories={data.categories}
              visits={data.visits}
              readonly={isViewer}
              onAddItem={data.handleAddWarehouseItem}
              onEditItem={data.handleEditWarehouseItem}
              onDeleteItem={data.handleDeleteWarehouseItem}
              onAddCategory={data.handleAddCategory}
              onAddItemToBox={data.handleAddItemToBox}
              onBulkAddItemsToBox={data.handleBulkAddItemsToBox}
              onBulkDeleteItems={data.handleBulkDeleteWarehouseItems}
            />
          )}
          {activeView === "boxes" && !selectedBoxId && (
            <BoxesView
              visits={data.visits}
              categories={data.categories}
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
              categories={data.categories}
              warehouseItems={data.warehouseItems}
              readonly={isViewer}
              onBack={() => setSelectedBoxId(null)}
              onUpdateItemQty={(boxId, warehouseItemId, delta) => {
                data.handleUpdateBoxItemQty(selectedVisit.id, boxId, warehouseItemId, delta);
              }}
            />
          )}
          {activeView === "visits" && !selectedVisitId && (
            <VisitsView
              visits={data.visits}
              warehouseItems={data.warehouseItems}
              onSelectVisit={setSelectedVisitId}
              onAddVisit={data.handleAddVisit}
              onToggleVisit={data.handleToggleVisit}
              onFillBoxes={data.handleFillBoxesFromTemplate}
              onDeleteVisit={data.handleDeleteVisit}
            />
          )}
          {activeView === "visits" && selectedVisit && !selectedBoxId && selectedVisit.status !== "collecting" && selectedVisit.status !== "completed" && (
            <VisitDetailView
              visit={selectedVisit}
              warehouseItems={data.warehouseItems}
              categories={data.categories}
              activityLog={data.activityLog}
              onBack={() => setSelectedVisitId(null)}
              onSelectBox={setSelectedBoxId}
              onToggleVisit={data.handleToggleVisit}
              onActivateVisit={data.handleActivateVisit}
              onFillBox={data.handleFillBox}
              onReturnItems={data.handleReturnItems}
              onAddBox={data.handleAddBox}
              onDeleteBox={data.handleDeleteBox}
              onStartCollect={data.handleToggleVisit}
            />
          )}
          {activeView === "visits" && selectedVisit && !selectedBoxId && selectedVisit.status === "collecting" && (
            <CollectionView
              visit={selectedVisit}
              warehouseItems={data.warehouseItems}
              categories={data.categories}
              onBack={() => setSelectedVisitId(null)}
              onComplete={data.handleCollectVisit}
            />
          )}
          {activeView === "visits" && selectedVisit && !selectedBoxId && selectedVisit.status === "completed" && (
            <VisitReport
              visit={selectedVisit}
              categories={data.categories}
              onBack={() => setSelectedVisitId(null)}
            />
          )}
          {activeView === "visits" && selectedVisit && selectedBoxId && selectedBox && (
            <BoxDetailView
              box={selectedBox}
              visitName={selectedVisit.name}
              categories={data.categories}
              warehouseItems={data.warehouseItems}
              readonly={isViewer}
              onBack={() => setSelectedBoxId(null)}
              onUpdateItemQty={(boxId, warehouseItemId, delta) => {
                data.handleUpdateBoxItemQty(selectedVisit.id, boxId, warehouseItemId, delta);
              }}
              onAddItemToBox={data.handleAddItemToBox}
              visitId={selectedVisit.id}
            />
          )}
          {activeView === "completed-visits" && (
            <CompletedVisitsView
              visits={data.visits}
              categories={data.categories}
              onSelectVisit={(visitId) => setSelectedVisitId(visitId)}
            />
          )}
          {activeView === "users" && (
            <SettingsView
              users={data.users}
              currentUserRole={user.role}
              onAddUser={data.handleAddUser}
              onEditUser={data.handleEditUser}
              onDeleteUser={data.handleDeleteUser}
              onToggleUser={data.handleToggleUser}
            />
          )}
          {activeView === "categories-settings" && (
            <div className="p-4 sm:p-6 space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">إدارة الفئات</h1>
                <p className="text-sm text-slate-500 mt-1">إضافة وتعديل وحذف فئات العناصر</p>
              </div>
              <CategoriesSettings
                categories={data.categories}
                onAdd={data.handleAddCategory}
                onEdit={data.handleEditCategory}
                onDelete={data.handleDeleteCategory}
              />
            </div>
          )}
          {activeView === "activity-log" && (
            <div className="p-4 sm:p-6 space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">سجل النشاط</h1>
                <p className="text-sm text-slate-500 mt-1">جميع العمليات والتعديلات</p>
              </div>
              <ActivityLogView activityLog={data.activityLog} visits={data.visits} />
            </div>
          )}
          {activeView === "developer" && (
            <DeveloperSettings
              onBulkDeleteWarehouseItems={data.handleBulkDeleteWarehouseItems}
              warehouseItemCount={data.warehouseItems.length}
            />
          )}
        </main>
      </div>
    </div>
  );
}
