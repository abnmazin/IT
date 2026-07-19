"use client";

import { useState } from "react";
import { User, UserRole, USER_ROLE_LABELS } from "@/types";
import { Plus, Edit2, Trash2, X, UserCheck, UserX } from "lucide-react";

interface UsersSettingsProps {
  users: User[];
  currentUserRole: User["role"];
  onAdd: (name: string, role: UserRole, pin: string) => void;
  onEdit: (id: string, name: string, role: UserRole, pin: string) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

const ROLE_BADGE: Record<UserRole, string> = {
  admin: "bg-purple-100 text-purple-700",
  developer: "bg-amber-100 text-amber-700",
  member: "bg-sky-100 text-sky-700",
  viewer: "bg-slate-100 text-slate-600",
};

export default function UsersSettings({
  users,
  currentUserRole,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
}: UsersSettingsProps) {
  const availableRoles = (Object.entries(USER_ROLE_LABELS) as [UserRole, string][]).filter(
    ([value]) => currentUserRole === "developer" || value !== "developer"
  );
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("member");
  const [pin, setPin] = useState("");

  const openAdd = () => {
    setEditingUser(null);
    setName("");
    setRole("member");
    setPin("");
    setShowModal(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setRole(user.role);
    setPin(user.pin || "");
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !pin.trim()) return;
    if (editingUser) {
      onEdit(editingUser.id, name.trim(), role, pin.trim());
    } else {
      onAdd(name.trim(), role, pin.trim());
    }
    setShowModal(false);
  };

  const handleDelete = (user: User) => {
    if (confirm(`هل أنت متأكد من حذف "${user.name}"؟`)) {
      onDelete(user.id);
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          حسابات المستخدمين ({users.length})
        </h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          إضافة مستخدم
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">المستخدم</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">الدور</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">الحالة</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className={`hover:bg-slate-50 transition-colors ${!user.active ? "opacity-50" : ""}`}>
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-slate-800">{user.name}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-md ${ROLE_BADGE[user.role]}`}>
                      {USER_ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => onToggle(user.id)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 h-9 rounded-md transition-colors ${
                        user.active ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" : "text-red-600 bg-red-50 hover:bg-red-100"
                      }`}
                    >
                      {user.active ? <><UserCheck className="w-3 h-3" />نشط</> : <><UserX className="w-3 h-3" />معطّل</>}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(user)} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="تعديل">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(user)} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors" title="حذف">
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

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2">
        {users.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-sm text-slate-400">لا يوجد مستخدمون.</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className={`bg-white rounded-xl border border-slate-200 p-3.5 ${!user.active ? "opacity-50" : ""}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded shrink-0 mr-2 ${ROLE_BADGE[user.role]}`}>
                  {USER_ROLE_LABELS[user.role]}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => onToggle(user.id)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 h-9 rounded-lg transition-colors min-h-[40px] ${
                    user.active ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
                  }`}
                >
                  {user.active ? <><UserCheck className="w-3 h-3" />نشط</> : <><UserX className="w-3 h-3" />معطّل</>}
                </button>
                <div className="flex-1" />
                <button
                  onClick={() => openEdit(user)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(user)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowModal(false)}>
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {editingUser ? "تعديل المستخدم" : "إضافة مستخدم جديد"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">الاسم *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="الاسم الكامل"
                  className="w-full h-11 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">رمز الدخول (PIN) *</label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="4-6 أرقام"
                  maxLength={6}
                  className="w-full h-11 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">الدور *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {availableRoles.map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      className={`px-3 h-11 rounded-lg text-xs font-medium border transition-colors min-h-[44px] ${
                        role === value
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2 pb-2">
                <button
                  type="submit"
                  disabled={!name.trim() || !pin.trim()}
                  className="flex-1 h-11 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
                >
                  {editingUser ? "حفظ التعديلات" : "إضافة"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors min-h-[44px]"
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
