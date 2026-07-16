"use client";

import { useState } from "react";
import { User, UserRole, USER_ROLE_LABELS } from "@/types";
import { Plus, Edit2, Trash2, X, UserCheck, UserX } from "lucide-react";

interface UsersSettingsProps {
  users: User[];
  onAdd: (name: string, email: string, role: UserRole) => void;
  onEdit: (id: string, name: string, email: string, role: UserRole) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

const ROLE_BADGE: Record<UserRole, string> = {
  admin: "bg-purple-100 text-purple-700",
  technician: "bg-sky-100 text-sky-700",
  viewer: "bg-slate-100 text-slate-600",
};

export default function UsersSettings({
  users,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
}: UsersSettingsProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("technician");

  const openAdd = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setRole("technician");
    setShowModal(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    if (editingUser) {
      onEdit(editingUser.id, name.trim(), email.trim(), role);
    } else {
      onAdd(name.trim(), email.trim(), role);
    }
    setShowModal(false);
  };

  const handleDelete = (user: User) => {
    if (confirm(`هل أنت متأكد من حذف "${user.name}"؟`)) {
      onDelete(user.id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          حسابات المستخدمين ({users.length})
        </h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 h-11 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          إضافة مستخدم
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-3 sm:px-5 py-3">
                  المستخدم
                </th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-3 sm:px-5 py-3 hidden sm:table-cell">
                  البريد
                </th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-3 sm:px-5 py-3">
                  الدور
                </th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-3 sm:px-5 py-3">
                  الحالة
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-3 sm:px-5 py-3">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    !user.active ? "opacity-50" : ""
                  }`}
                >
                  <td className="px-3 sm:px-5 py-3">
                    <p className="text-sm font-medium text-slate-800">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-400 sm:hidden">
                      {user.email}
                    </p>
                  </td>
                  <td className="px-3 sm:px-5 py-3 text-sm text-slate-500 hidden sm:table-cell">
                    {user.email}
                  </td>
                  <td className="px-3 sm:px-5 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-md ${ROLE_BADGE[user.role]}`}
                    >
                      {USER_ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="px-3 sm:px-5 py-3">
                    <button
                      onClick={() => onToggle(user.id)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 h-9 rounded-md transition-colors ${
                        user.active
                          ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                          : "text-red-600 bg-red-50 hover:bg-red-100"
                      }`}
                    >
                      {user.active ? (
                        <>
                          <UserCheck className="w-3 h-3" />
                          نشط
                        </>
                      ) : (
                        <>
                          <UserX className="w-3 h-3" />
                          معطّل
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-3 sm:px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(user)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        title="تعديل"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingUser ? "تعديل المستخدم" : "إضافة مستخدم جديد"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  الاسم *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="الاسم الكامل"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@company.com"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  الدور *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(USER_ROLE_LABELS) as [UserRole, string][]).map(
                    ([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRole(value)}
                        className={`px-3 h-11 rounded-lg text-xs font-medium border transition-colors ${
                          role === value
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {label}
                      </button>
                    )
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!name.trim() || !email.trim()}
                  className="flex-1 h-11 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {editingUser ? "حفظ التعديلات" : "إضافة"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
