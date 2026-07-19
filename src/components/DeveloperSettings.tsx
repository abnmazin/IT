"use client";

import { useState } from "react";
import { resetFirestore } from "@/lib/firestore";
import {
  Trash2, RefreshCcw, AlertTriangle, Warehouse, MapPin,
  ClipboardList, Tag, Users, Code2, RotateCcw, ChevronDown,
  CheckCircle,
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
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const addLog = (msg: string) =>
    setLog((prev) => [`[${new Date().toLocaleTimeString("ar")}] ${msg}`, ...prev]);

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
      label: "عناصر المخزن",
      icon: Warehouse,
      color: "bg-rose-500",
      lightBg: "bg-rose-50",
      desc: `حذف ${warehouseItemCount} صنف من المخزن`,
    },
    {
      id: "visits",
      label: "الزيارات",
      icon: MapPin,
      color: "bg-amber-500",
      lightBg: "bg-amber-50",
      desc: "حذف جميع الزيارات والصناديق",
    },
    {
      id: "activity",
      label: "سجل النشاط",
      icon: ClipboardList,
      color: "bg-sky-500",
      lightBg: "bg-sky-50",
      desc: "حذف جميع سجلات النشاط",
    },
    {
      id: "categories",
      label: "إعادة تعيين الفئات",
      icon: Tag,
      color: "bg-violet-500",
      lightBg: "bg-violet-50",
      desc: "حذف الفئات المُضافة يدوياً وإعادة الفئات الافتراضية",
    },
    {
      id: "users-extra",
      label: "المستخدمين",
      icon: Users,
      color: "bg-emerald-500",
      lightBg: "bg-emerald-50",
      desc: "حذف كل المستخدمين ما عدا المطور الأساسي",
    },
  ];

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
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-slate-50 to-indigo-50/30">
      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25 shrink-0">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">لوحة المطور</h1>
            <p className="text-xs text-slate-500">أدوات إدارة البيانات والصيانة</p>
          </div>
        </div>

        {/* Full Reset - Danger Card */}
        <div className="relative overflow-hidden rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 p-4 sm:p-5 space-y-3">
          <div className="absolute top-0 left-0 w-20 h-20 bg-red-500/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="flex items-center gap-2.5 relative">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4.5 h-4.5 text-red-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-red-800">إعادة تعيين كاملة</h2>
              <p className="text-[11px] text-red-600/80">حذف كل شيء وإعادة البداية</p>
            </div>
          </div>
          <p className="text-xs text-red-700/70 leading-relaxed relative">
            سيحذف هذا المخزن والزيارات وسجل النشاط والمستخدمين، ثم يُعيد ت.Site بالكامل مع حساب المطور فقط.
          </p>
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 active:scale-[0.98] transition-all shadow-sm shadow-red-600/25"
            >
              <RotateCcw className="w-4 h-4" />
              إعادة تعيين الكل
            </button>
          ) : (
            <div className="flex gap-2 relative">
              <button
                onClick={handleReset}
                disabled={resetting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 active:scale-[0.98] transition-all"
              >
                {resetting ? (
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {resetting ? "جاري..." : "نعم، احذف الكل"}
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-4 py-3 bg-white text-slate-600 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-50 active:scale-[0.98] transition-all"
              >
                إلغاء
              </button>
            </div>
          )}
        </div>

        {/* Section Delete */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 pt-4 pb-2">
            <h2 className="text-sm font-bold text-slate-900">حذف أقسام محددة</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">اضغط على القسم لتوسيعه ثم احذف</p>
          </div>
          <div className="divide-y divide-slate-100">
            {sections.map((section) => {
              const Icon = section.icon;
              const isOpen = expandedSection === section.id;
              return (
                <div key={section.id}>
                  <button
                    onClick={() => {
                      setExpandedSection(isOpen ? null : section.id);
                      setConfirmDelete(null);
                    }}
                    className="w-full flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors text-right"
                  >
                    <div className={`w-10 h-10 rounded-xl ${section.lightBg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${section.color.replace("bg-", "text-")}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{section.label}</p>
                      <p className="text-[11px] text-slate-400 truncate">{section.desc}</p>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4">
                      <div className="bg-slate-50 rounded-xl p-3 space-y-3">
                        <p className="text-xs text-slate-600">{section.desc}</p>
                        {confirmDelete === section.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={executeSectionDelete}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 active:scale-[0.98] transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              تأكيد الحذف
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="px-4 py-2.5 bg-white text-slate-600 rounded-xl text-xs font-medium border border-slate-200 hover:bg-slate-50 active:scale-[0.98] transition-all"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(section.id)}
                            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-100 border border-red-100 active:scale-[0.98] transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            حذف {section.label}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Operation Log */}
        {log.length > 0 && (
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-lg">
            <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <p className="text-xs font-bold text-slate-300">سجل العمليات</p>
              </div>
              <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{log.length}</span>
            </div>
            <div className="p-3 max-h-52 overflow-y-auto space-y-1">
              {log.map((entry, i) => (
                <p key={i} className="text-[11px] text-emerald-400/90 font-mono leading-relaxed">
                  {entry}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
