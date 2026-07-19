"use client";

import { useState } from "react";
import { resetFirestore } from "@/lib/firestore";
import {
  Trash2, RefreshCcw, AlertTriangle, Warehouse, MapPin,
  ClipboardList, Tag, Users, Database, RotateCcw,
} from "lucide-react";

interface DeveloperSettingsProps {
  onBulkDeleteWarehouseItems: (ids: string[]) => void;
  warehouseItemCount: number;
}

export default function DeveloperSettings({
  onBulkDeleteWarehouseItems,
  warehouseItemCount,
}: DeveloperSettingsProps) {
  const [resetting, setResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog((prev) => [`[${new Date().toLocaleTimeString("ar")}] ${msg}`, ...prev]);

  const handleReset = async () => {
    setResetting(true);
    addLog("جاري إعادة تعيين Firestore...");
    try {
      await resetFirestore();
      addLog("تم إعادة التعيين بنجاح! يُرجى إعادة تحميل الصفحة.");
    } catch (e: unknown) {
      addLog(`خطأ: ${e instanceof Error ? e.message : "فشل إعادة التعيين"}`);
    }
    setResetting(false);
    setConfirmReset(false);
  };

  const sections = [
    {
      id: "warehouse",
      label: "حذف كل عناصر المخزن",
      icon: Warehouse,
      color: "text-red-600",
      desc: `حذف ${warehouseItemCount} صنف من المخزن`,
    },
    {
      id: "visits",
      label: "حذف كل الزيارات",
      icon: MapPin,
      color: "text-red-600",
      desc: "حذف جميع الزيارات والصناديق",
    },
    {
      id: "activity",
      label: "حذف سجل النشاط",
      icon: ClipboardList,
      color: "text-red-600",
      desc: "حذف جميع سجلات النشاط",
    },
    {
      id: "categories",
      label: "إعادة تعيين الفئات",
      icon: Tag,
      color: "text-amber-600",
      desc: "حذف الفئات المُضافة يدوياً وإعادة الفئات الافتراضية",
    },
    {
      id: "users-extra",
      label: "حذف المستخدمين غير الأساسيين",
      icon: Users,
      color: "text-amber-600",
      desc: "حذف كل المستخدمين ما عدا abnmazin",
    },
  ];

  const handleSectionAction = (id: string) => {
    setConfirmDelete(id);
  };

  const executeSectionDelete = async () => {
    if (!confirmDelete) return;
    addLog(`جاري حذف: ${sections.find((s) => s.id === confirmDelete)?.label}...`);
    try {
      if (confirmDelete === "warehouse") {
        const { subscribeWarehouseItems, deleteWarehouseItemFS } = await import("@/lib/firestore");
        const allIds = await new Promise<string[]>((resolve) => {
          const unsub = subscribeWarehouseItems((items) => {
            resolve(items.map((i) => i.id));
            unsub();
          });
        });
        for (const id of allIds) await deleteWarehouseItemFS(id);
        addLog(`تم حذف ${allIds.length} صنف من المخزن`);
      } else if (confirmDelete === "visits") {
        const { subscribeVisits, deleteVisitFS } = await import("@/lib/firestore");
        const allIds = await new Promise<string[]>((resolve) => {
          const unsub = subscribeVisits((visits) => {
            resolve(visits.map((v) => v.id));
            unsub();
          });
        });
        for (const id of allIds) await deleteVisitFS(id);
        addLog(`تم حذف ${allIds.length} زيارة`);
      } else if (confirmDelete === "activity") {
        const { subscribeActivityLog } = await import("@/lib/firestore");
        const { deleteDoc, doc } = await import("firebase/firestore");
        const { db } = await import("@/lib/firebase");
        const allIds = await new Promise<string[]>((resolve) => {
          const unsub = subscribeActivityLog((log) => {
            resolve(log.map((e) => e.id));
            unsub();
          });
        });
        for (const id of allIds) await deleteDoc(doc(db, "activityLog", id));
        addLog(`تم حذف ${allIds.length} سجل نشاط`);
      } else if (confirmDelete === "categories") {
        const { subscribeCategories, deleteCategoryFS, saveCategory } = await import("@/lib/firestore");
        const { defaultCategories } = await import("@/types");
        const existingCats = await new Promise<string[]>((resolve) => {
          const unsub = subscribeCategories((cats) => {
            resolve(cats.map((c) => c.id));
            unsub();
          });
        });
        for (const id of existingCats) await deleteCategoryFS(id);
        for (const cat of defaultCategories) await saveCategory(cat);
        addLog("تم إعادة تعيين الفئات الافتراضية");
      } else if (confirmDelete === "users-extra") {
        const { subscribeUsers, deleteUserFS } = await import("@/lib/firestore");
        const allUsers = await new Promise<{ id: string; name: string }[]>((resolve) => {
          const unsub = subscribeUsers((users) => {
            resolve(users.map((u) => ({ id: u.id, name: u.name })));
            unsub();
          });
        });
        const toDelete = allUsers.filter((u) => u.name !== "abnmazin");
        for (const u of toDelete) await deleteUserFS(u.id);
        addLog(`تم حذف ${toDelete.length} مستخدم`);
      }
    } catch (e: unknown) {
      addLog(`خطأ: ${e instanceof Error ? e.message : "فشل العملية"}`);
    }
    setConfirmDelete(null);
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-6 h-6 text-purple-600" />
          لوحة المطور
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          أدوات إدارة البيانات — مقيد لحساب المطور فقط
        </p>
      </div>

      {/* Full Reset */}
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h2 className="text-sm font-bold text-red-700">إعادة تعيين كاملة</h2>
        </div>
        <p className="text-xs text-red-600">
          سيحذف هذا كل شيء (المخزن، الزيارات، سجل النشاط، المستخدمين) ويُعيد تعيين الموقع بالكامل مع إنشاء حساب abnmazin فقط.
        </p>
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl text-xs font-medium hover:bg-red-700 transition-colors min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" />
            إعادة تعيين الكل
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              disabled={resetting}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl text-xs font-medium hover:bg-red-700 disabled:opacity-50 transition-colors min-h-[44px]"
            >
              {resetting ? (
                <RefreshCcw className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {resetting ? "جاري التعيين..." : "نعم، احذف الكل"}
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-200 transition-colors min-h-[44px]"
            >
              إلغاء
            </button>
          </div>
        )}
      </div>

      {/* Per-section delete */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-3">
        <h2 className="text-sm font-bold text-slate-900">حذف أقسام محددة</h2>
        <div className="space-y-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.id} className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 ${section.color} shrink-0`} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800">{section.label}</p>
                    <p className="text-[11px] text-slate-500 truncate">{section.desc}</p>
                  </div>
                </div>
                {confirmDelete === section.id ? (
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={executeSectionDelete}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg text-[11px] font-medium hover:bg-red-700 min-h-[36px]"
                    >
                      تأكيد
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-medium hover:bg-slate-200 min-h-[36px]"
                    >
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSectionAction(section.id)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-[11px] font-medium hover:bg-red-100 transition-colors min-h-[36px] shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                    حذف
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Log */}
      {log.length > 0 && (
        <div className="bg-slate-900 rounded-xl p-4 space-y-1 max-h-60 overflow-y-auto">
          <p className="text-xs font-bold text-slate-400 mb-2">سجل العمليات</p>
          {log.map((entry, i) => (
            <p key={i} className="text-[11px] text-emerald-400 font-mono leading-relaxed">{entry}</p>
          ))}
        </div>
      )}
    </div>
  );
}
