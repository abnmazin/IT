"use client";

import { User } from "@/types";
import UsersSettings from "./UsersSettings";

interface SettingsViewProps {
  users: User[];
  onAddUser: (name: string, email: string, role: User["role"], pin: string) => void;
  onEditUser: (id: string, name: string, email: string, role: User["role"], pin: string) => void;
  onDeleteUser: (id: string) => void;
  onToggleUser: (id: string) => void;
}

export default function SettingsView({
  users,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onToggleUser,
}: SettingsViewProps) {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">إدارة المستخدمين</h1>
        <p className="text-sm text-slate-500 mt-1">
          إضافة وتعديل وحذف حسابات المستخدمين
        </p>
      </div>

      <UsersSettings
        users={users}
        onAdd={onAddUser}
        onEdit={onEditUser}
        onDelete={onDeleteUser}
        onToggle={onToggleUser}
      />
    </div>
  );
}
