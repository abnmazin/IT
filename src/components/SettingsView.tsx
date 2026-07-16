"use client";

import { useState } from "react";
import { User, Site, Category, ActivityLogEntry } from "@/types";
import UsersSettings from "./UsersSettings";
import SitesSettings from "./SitesSettings";
import CategoriesSettings from "./CategoriesSettings";
import ActivityLogView from "./ActivityLogView";
import { Users, MapPin, Tag, ClipboardList } from "lucide-react";

type SettingsTab = "users" | "sites" | "categories" | "activity";

interface SettingsViewProps {
  users: User[];
  sites: Site[];
  categories: Category[];
  activityLog: ActivityLogEntry[];
  onAddUser: (name: string, email: string, role: User["role"]) => void;
  onEditUser: (id: string, name: string, email: string, role: User["role"]) => void;
  onDeleteUser: (id: string) => void;
  onToggleUser: (id: string) => void;
  onAddSite: (name: string) => void;
  onEditSite: (id: string, name: string) => void;
  onDeleteSite: (id: string) => void;
  onAddCategory: (key: string, label: string, serialTracked: boolean) => void;
  onEditCategory: (id: string, key: string, label: string, serialTracked: boolean) => void;
  onDeleteCategory: (id: string) => void;
}

const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: "users", label: "المستخدمين", icon: Users },
  { id: "sites", label: "المواقع", icon: MapPin },
  { id: "categories", label: "الفئات", icon: Tag },
  { id: "activity", label: "سجل النشاط", icon: ClipboardList },
];

export default function SettingsView({
  users,
  sites,
  categories,
  activityLog,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onToggleUser,
  onAddSite,
  onEditSite,
  onDeleteSite,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("users");

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">الإعدادات</h1>
        <p className="text-sm text-slate-500 mt-1">
          إدارة حسابات المستخدمين والمواقع والفئات وسجل النشاط
        </p>
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === "users" && (
        <UsersSettings
          users={users}
          onAdd={onAddUser}
          onEdit={onEditUser}
          onDelete={onDeleteUser}
          onToggle={onToggleUser}
        />
      )}
      {activeTab === "sites" && (
        <SitesSettings
          sites={sites}
          onAdd={onAddSite}
          onEdit={onEditSite}
          onDelete={onDeleteSite}
        />
      )}
      {activeTab === "categories" && (
        <CategoriesSettings
          categories={categories}
          onAdd={onAddCategory}
          onEdit={onEditCategory}
          onDelete={onDeleteCategory}
        />
      )}
      {activeTab === "activity" && (
        <ActivityLogView activityLog={activityLog} />
      )}
    </div>
  );
}
