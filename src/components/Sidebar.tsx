"use client";

import { View, UserRole } from "@/types";
import {
  LayoutDashboard,
  Warehouse,
  Package,
  MapPin,
  CheckCircle,
  Users,
  Tag,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  X,
  Code2,
} from "lucide-react";

const allNavItems: { id: View; label: string; icon: React.ElementType; roles: UserRole[] }[] = [
  { id: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard, roles: ["admin", "developer", "member"] },
  { id: "warehouse", label: "المخزن", icon: Warehouse, roles: ["admin", "developer", "member", "viewer"] },
  { id: "boxes", label: "الصناديق", icon: Package, roles: ["admin", "developer", "member", "viewer"] },
  { id: "visits", label: "الزيارات", icon: MapPin, roles: ["admin", "developer", "member"] },
  { id: "completed-visits", label: "الزيارات المكتملة", icon: CheckCircle, roles: ["admin", "developer", "member"] },
];

const allBottomItems: { id: View; label: string; icon: React.ElementType; roles: UserRole[] }[] = [
  { id: "users", label: "المستخدمين", icon: Users, roles: ["admin", "developer"] },
  { id: "categories-settings", label: "الفئات", icon: Tag, roles: ["admin", "developer"] },
  { id: "activity-log", label: "سجل النشاط", icon: ClipboardList, roles: ["admin", "developer"] },
];

interface SidebarProps {
  activeView: View;
  onNavigate: (view: View) => void;
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  userRole: UserRole;
}

export default function Sidebar({
  activeView,
  onNavigate,
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
  userRole,
}: SidebarProps) {
  const navItems = allNavItems.filter((item) => item.roles.includes(userRole));
  const bottomItems = allBottomItems.filter((item) => item.roles.includes(userRole));

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed top-0 z-50 h-screen bg-sidebar-bg border-l border-slate-700/50 flex flex-col transition-all duration-200
          ${collapsed ? "w-[68px]" : "w-60"}
          ${mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          right-0
        `}
      >
        <div className="flex items-center gap-2 px-4 h-14 sm:h-16 border-b border-slate-700/50 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-sky-400" />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold text-white tracking-tight whitespace-nowrap flex-1 min-w-0 truncate">
              مخزون تقنية المعلومات
            </span>
          )}
          <button
            onClick={onMobileClose}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 rounded-lg text-sm transition-colors ${
                  collapsed ? "justify-center px-2 h-11" : "px-3 h-11"
                } ${
                  active
                    ? "bg-sidebar-active text-white"
                    : "text-sidebar-text hover:bg-sidebar-hover hover:text-slate-200"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                {!collapsed && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {bottomItems.length > 0 && (
          <div className="px-2 pb-1 space-y-1 border-t border-slate-700/50 pt-2">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 rounded-lg text-sm transition-colors ${
                    collapsed ? "justify-center px-2 h-11" : "px-3 h-11"
                  } ${
                    active
                      ? "bg-sidebar-active text-white"
                      : "text-sidebar-text hover:bg-sidebar-hover hover:text-slate-200"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  {!collapsed && (
                    <span className="whitespace-nowrap">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {userRole === "developer" && (
          <div className="px-2 pb-1 space-y-1 border-t border-slate-700/50 pt-2">
            <button
              onClick={() => onNavigate("developer")}
              className={`w-full flex items-center gap-3 rounded-lg text-sm transition-colors ${
                collapsed ? "justify-center px-2 h-11" : "px-3 h-11"
              } ${
                activeView === "developer"
                  ? "bg-purple-500/20 text-purple-400"
                  : "text-sidebar-text hover:bg-sidebar-hover hover:text-slate-200"
              }`}
              title={collapsed ? "المطور" : undefined}
            >
              <Code2 className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && (
                <span className="whitespace-nowrap">المطور</span>
              )}
            </button>
          </div>
        )}

        <button
          onClick={onToggle}
          className="hidden lg:flex mx-2 mb-3 items-center justify-center h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-sidebar-text hover:text-white transition-colors"
        >
          {collapsed ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </aside>
    </>
  );
}
