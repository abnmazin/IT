"use client";

import { useState, useMemo, useCallback } from "react";
import { WarehouseItem, Category, Visit, isSerialCategory, getItemSerials } from "@/types";
import { Search, Plus, Package, Trash2, X, Send, Check, ChevronDown, ChevronUp, Hash, FileSpreadsheet } from "lucide-react";
import { exportWarehouseToExcel } from "@/lib/exportExcel";
import ExportSettingsModal from "@/components/ExportSettingsModal";

interface WarehouseViewProps {
  items: WarehouseItem[];
  categories: Category[];
  visits: Visit[];
  readonly?: boolean;
  onAddItem: (name: string, category: string, totalQty: number, consumable: boolean, serials?: string[]) => void;
  onEditItem: (id: string, name: string, category: string, totalQty: number, consumable: boolean, serials?: string[]) => void;
  onDeleteItem: (id: string) => void;
  onAddCategory: (key: string, label: string, serialTracked: boolean, consumable: boolean) => void;
  onAddItemToBox: (visitId: string, boxId: string, warehouseItemId: string, qty: number, serials?: string[]) => void;
  onBulkAddItemsToBox: (visitId: string, boxId: string, items: { warehouseItemId: string; qty: number; serials?: string[] }[]) => void;
  onBulkDeleteItems: (ids: string[]) => void;
}

function generateSerials(prefix: string, start: number, count: number): string[] {
  const clean = prefix.trim();
  if (!clean || count <= 0) return [];
  const last = start + count - 1;
  const width = Math.max(2, String(Math.max(1, last)).length);
  const list: string[] = [];
  for (let i = start; i <= last; i++) {
    list.push(`${clean} ${String(i).padStart(width, "0")}`);
  }
  return list;
}

function parseSerials(text: string): string[] {
  return text.split(/\n|,|;/).map((s) => s.trim()).filter(Boolean);
}

export default function WarehouseView({
  items,
  categories,
  visits,
  readonly = false,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onAddCategory,
  onAddItemToBox,
  onBulkAddItemsToBox,
  onBulkDeleteItems,
}: WarehouseViewProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingItem, setEditingItem] = useState<WarehouseItem | null>(null);
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formQty, setFormQty] = useState(1);
  const [formConsumable, setFormConsumable] = useState(false);
  const [formSerials, setFormSerials] = useState<string[]>([]);
  const [serialMode, setSerialMode] = useState<"range" | "paste">("range");
  const [serialPrefix, setSerialPrefix] = useState("");
  const [serialStart, setSerialStart] = useState(1);
  const [serialCount, setSerialCount] = useState(5);
  const [serialPaste, setSerialPaste] = useState("");
  const [catLabel2, setCatLabel2] = useState("");
  const [catConsumable, setCatConsumable] = useState(false);
  const [catSerialTracked, setCatSerialTracked] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showBulkSend, setShowBulkSend] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [sendVisitId, setSendVisitId] = useState("");
  const [sendBoxId, setSendBoxId] = useState("");
  const [serialPicks, setSerialPicks] = useState<Record<string, string[]>>({});
  const [singleSend, setSingleSend] = useState<WarehouseItem | null>(null);
  const [singleSendVisitId, setSingleSendVisitId] = useState("");
  const [singleSendBoxId, setSingleSendBoxId] = useState("");
  const [singleSendPicks, setSingleSendPicks] = useState<string[]>([]);

  const activeVisits = useMemo(() => visits.filter((v) => v.status === "active"), [visits]);

  const formIsSerial = useMemo(
    () => isSerialCategory(categories, formCategory),
    [categories, formCategory]
  );

  const generatedSerials = useMemo(
    () => (formIsSerial && serialMode === "range" ? generateSerials(serialPrefix, serialStart, serialCount) : []),
    [formIsSerial, serialMode, serialPrefix, serialStart, serialCount]
  );

  const pastedSerials = useMemo(
    () => (formIsSerial && serialMode === "paste" ? parseSerials(serialPaste) : []),
    [formIsSerial, serialMode, serialPaste]
  );

  const effectiveSerials = useMemo(
    () => (formIsSerial ? (serialMode === "range" ? generatedSerials : pastedSerials) : []),
    [formIsSerial, serialMode, generatedSerials, pastedSerials]
  );

  const deployedByItem = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const v of visits) {
      if (v.status !== "active" && v.status !== "collecting") continue;
      for (const b of v.boxes) {
        for (const bi of b.items) {
          const s = bi.serials || [];
          if (s.length === 0) continue;
          const set = map.get(bi.warehouseItemId) || new Set<string>();
          s.forEach((x) => set.add(x));
          map.set(bi.warehouseItemId, set);
        }
      }
    }
    return map;
  }, [visits]);

  const availableSerials = useCallback(
    (item: WarehouseItem): string[] => {
      const all = getItemSerials(item);
      const deployed = deployedByItem.get(item.id);
      if (!deployed) return all;
      return all.filter((s) => !deployed.has(s));
    },
    [deployedByItem]
  );

  const filtered = useMemo(() => {
    let result = items;
    if (filterCategory !== "All") {
      result = result.filter((i) => i.category === filterCategory);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((i) => {
        const serialsMatch = getItemSerials(i).some((s) => s.toLowerCase().includes(q));
        return i.name.toLowerCase().includes(q) || serialsMatch;
      });
    }
    return result;
  }, [items, search, filterCategory]);

  const grouped = useMemo(() => {
    const map = new Map<string, WarehouseItem[]>();
    for (const item of filtered) {
      const list = map.get(item.category) || [];
      list.push(item);
      map.set(item.category, list);
    }
    return map;
  }, [filtered]);

  const selectedItems = useMemo(() => items.filter((i) => selectedIds.has(i.id)), [items, selectedIds]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === filtered.length) return new Set();
      return new Set(filtered.map((i) => i.id));
    });
  }, [filtered]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const resetForm = () => {
    setFormName("");
    setFormCategory(categories[0]?.key || "");
    setFormQty(1);
    setFormConsumable(false);
    setFormSerials([]);
    setSerialMode("range");
    setSerialPrefix("");
    setSerialStart(1);
    setSerialCount(5);
    setSerialPaste("");
    setShowAdd(false);
    setEditingItem(null);
  };

  const openAdd = () => {
    resetForm();
    const catKey = filterCategory !== "All" ? filterCategory : categories[0]?.key || "";
    setFormCategory(catKey);
    const cat = categories.find((c) => c.key === catKey);
    if (cat) setFormConsumable(cat.consumable);
    setShowAdd(true);
  };

  const openEdit = (item: WarehouseItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormQty(item.totalQty);
    setFormConsumable(item.consumable);
    const serials = getItemSerials(item);
    if (serials.length > 0) {
      setFormSerials(serials);
      setSerialMode("paste");
      setSerialPaste(serials.join("\n"));
    } else {
      setFormSerials([]);
      setSerialPaste("");
    }
    setShowAdd(true);
  };

  const handleSubmit = () => {
    if (!formName.trim()) return;
    if (formIsSerial && effectiveSerials.length === 0) return;
    const totalQty = formIsSerial ? effectiveSerials.length : formQty;
    if (editingItem) {
      onEditItem(editingItem.id, formName.trim(), formCategory, totalQty, formConsumable, formIsSerial ? effectiveSerials : undefined);
    } else {
      onAddItem(formName.trim(), formCategory, totalQty, formConsumable, formIsSerial ? effectiveSerials : undefined);
    }
    resetForm();
  };

  const removeSerialChip = (serial: string) => {
    setFormSerials((prev) => prev.filter((s) => s !== serial));
    setSerialPaste(formSerials.filter((s) => s !== serial).join("\n"));
  };

  const handleAddCat = () => {
    if (!catLabel2.trim()) return;
    const key = catLabel2.trim().replace(/\s+/g, "_").toLowerCase();
    onAddCategory(key, catLabel2.trim(), catSerialTracked, catConsumable);
    setCatLabel2("");
    setCatConsumable(false);
    setCatSerialTracked(false);
    setShowAddCategory(false);
  };

  const handleBulkDelete = () => {
    onBulkDeleteItems(Array.from(selectedIds));
    setSelectedIds(new Set());
    setShowBulkDeleteConfirm(false);
  };

  const openBulkSend = () => {
    setSendVisitId("");
    setSendBoxId("");
    const picks: Record<string, string[]> = {};
    selectedItems.forEach((item) => {
      if (isSerialCategory(categories, item.category)) picks[item.id] = [];
    });
    setSerialPicks(picks);
    setShowBulkSend(true);
  };

  const toggleSerialPick = (itemId: string, serial: string) => {
    setSerialPicks((prev) => {
      const cur = prev[itemId] || [];
      const next = cur.includes(serial) ? cur.filter((s) => s !== serial) : [...cur, serial];
      return { ...prev, [itemId]: next };
    });
  };

  const handleBulkSend = () => {
    if (!sendVisitId || !sendBoxId) return;
    const itemsToSend = selectedItems
      .map((item) => {
        if (isSerialCategory(categories, item.category)) {
          const picks = serialPicks[item.id] || [];
          return { warehouseItemId: item.id, qty: picks.length, serials: picks };
        }
        return { warehouseItemId: item.id, qty: Math.min(1, item.totalQty) };
      })
      .filter((i) => i.qty > 0);
    if (itemsToSend.length === 0) return;
    onBulkAddItemsToBox(sendVisitId, sendBoxId, itemsToSend);
    setSelectedIds(new Set());
    setShowBulkSend(false);
  };

  const openSingleSend = (item: WarehouseItem) => {
    setSingleSend(item);
    setSingleSendVisitId(activeVisits[0]?.id || "");
    setSingleSendBoxId(activeVisits[0]?.boxes[0]?.id || "");
    setSingleSendPicks([]);
  };

  const handleSingleSend = () => {
    if (!singleSend || !singleSendVisitId || !singleSendBoxId) return;
    onAddItemToBox(singleSendVisitId, singleSendBoxId, singleSend.id, singleSendPicks.length, singleSendPicks);
    setSingleSend(null);
  };

  const catLabel = (key: string) => categories.find((c) => c.key === key)?.label || key;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">المخزن الرئيسي</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            إدارة المواد والقطع — الإجمالي: {items.length} صنف
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير المخزن</span>
          </button>
          {!readonly && (
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة صنف</span>
            </button>
          )}
        </div>
      </div>

      {showExport && (
        <ExportSettingsModal
          title="تصدير المخزن الرئيسي"
          showFlatToggle={false}
          onExport={(opts) => {
            exportWarehouseToExcel(items, categories, opts);
            setShowExport(false);
          }}
          onClose={() => setShowExport(false)}
        />
      )}

      {showAddCategory && (
        <div className="bg-white rounded-xl border border-violet-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">إضافة فئة جديدة</h3>
            <button onClick={() => setShowAddCategory(false)} className="p-2 rounded-lg hover:bg-slate-100 min-w-[36px] min-h-[36px] flex items-center justify-center">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              placeholder="اسم الفئة (مثال: كابلات، شاشات...)"
              value={catLabel2}
              onChange={(e) => setCatLabel2(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCat()}
              className="flex-1 min-w-[200px] px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <label className="flex items-center gap-2 text-sm text-slate-600 shrink-0 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={catConsumable}
                onChange={(e) => setCatConsumable(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
              />
              استهلاكي
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600 shrink-0 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={catSerialTracked}
                onChange={(e) => setCatSerialTracked(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
              />
              تسلسلي (جهاز برقم تسلسلي)
            </label>
            <button
              onClick={handleAddCat}
              className="px-4 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors shrink-0"
            >
              إضافة
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="بحث بالاسم أو رقم الجهاز..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-3 pr-10 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-slate-100 min-w-[36px] min-h-[36px] flex items-center justify-center">
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>
        <select
          value={filterCategory}
          onChange={(e) => {
            if (e.target.value === "__add_category__") {
              setFilterCategory("All");
              setShowAddCategory(true);
              setShowAdd(false);
            } else {
              setFilterCategory(e.target.value);
            }
          }}
          className="py-2.5 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
        >
          <option value="All">كل الفئات</option>
          {categories.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
          {!readonly && (
            <option value="__add_category__">＋ إضافة فئة</option>
          )}
        </select>
        {!readonly && filtered.length > 0 && (
          <button
            onClick={selectedIds.size === filtered.length ? clearSelection : toggleSelectAll}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors min-h-[44px] ${
              selectedIds.size > 0 ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Check className="w-4 h-4" />
            {selectedIds.size > 0 ? `${selectedIds.size}` : "تحديد"}
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              {editingItem ? "تعديل الصنف" : "إضافة صنف جديد"}
            </h3>
            <button onClick={resetForm} className="p-2 rounded-lg hover:bg-slate-100 min-w-[36px] min-h-[36px] flex items-center justify-center">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="اسم الصنف (مثال: لابتوب، ماوس...)"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <select
              value={formCategory}
              onChange={(e) => {
                setFormCategory(e.target.value);
                const cat = categories.find((c) => c.key === e.target.value);
                if (cat) setFormConsumable(cat.consumable);
                if (!isSerialCategory(categories, e.target.value)) {
                  setFormSerials([]);
                  setSerialPaste("");
                }
              }}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {categories.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>

          {formIsSerial ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setSerialMode("range")}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                    serialMode === "range" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  توليد سلسلة
                </button>
                <button
                  onClick={() => setSerialMode("paste")}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                    serialMode === "paste" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  لصق قائمة
                </button>
              </div>

              {serialMode === "range" ? (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">البادئة</label>
                    <input
                      type="text"
                      placeholder="IT"
                      value={serialPrefix}
                      onChange={(e) => setSerialPrefix(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">رقم البداية</label>
                    <input
                      type="number"
                      min={1}
                      value={serialStart}
                      onChange={(e) => setSerialStart(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">العدد</label>
                    <input
                      type="number"
                      min={1}
                      value={serialCount}
                      onChange={(e) => setSerialCount(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              ) : (
                <textarea
                  placeholder="كل رقم في سطر (IT 01\nIT 02\nAD 10)"
                  value={serialPaste}
                  onChange={(e) => setSerialPaste(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              )}

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Hash className="w-3.5 h-3.5" />
                <span>عدد الأجهزة: {effectiveSerials.length}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                {(editingItem ? formSerials : effectiveSerials).map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 px-2 py-1 rounded-lg text-xs font-mono">
                    {s}
                    {editingItem && (
                      <button onClick={() => removeSerialChip(s)} className="text-sky-400 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <input
              type="number"
              min={0}
              placeholder="الكمية"
              value={formQty}
              onChange={(e) => setFormQty(Number(e.target.value))}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-1/2"
            />
          )}

          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formConsumable}
              onChange={(e) => setFormConsumable(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
            />
            صنف استهلاكي (ينتهي بالاستخدام لكن قد يُرجع)
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={formIsSerial && effectiveSerials.length === 0}
              className="px-4 py-2.5 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {editingItem ? "حفظ التعديلات" : "إضافة"}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {Array.from(grouped.entries()).map(([catKey, catItems]) => {
        const totalInCat = catItems.reduce((a, i) => a + i.totalQty, 0);
        return (
          <div key={catKey}>
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-900">{catLabel(catKey)}</span>
              <span className="text-xs text-slate-400">{catItems.length} صنف · {totalInCat} قطعة</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
              {catItems.map((item) => {
                const isSelected = selectedIds.has(item.id);
                const serials = isSerialCategory(categories, item.category) ? availableSerials(item) : [];
                const isSerial = serials.length > 0;
                const isExpanded = expandedIds.has(item.id);
                const shownSerials = isExpanded ? serials : serials.slice(0, 3);
                return (
                  <div
                    key={item.id}
                    onClick={() => !readonly && toggleSelect(item.id)}
                    className={`bg-white rounded-xl border p-3 sm:p-4 flex flex-col items-center text-center gap-2 min-h-[140px] justify-between cursor-pointer transition-all ${
                      isSelected
                        ? "border-sky-400 bg-sky-50 ring-2 ring-sky-200"
                        : item.totalQty === 0
                        ? "border-red-200 bg-red-50"
                        : item.totalQty < 5
                        ? "border-amber-200 bg-amber-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {!readonly && (
                      <div className="absolute top-2 left-2">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                          isSelected ? "bg-sky-500 border-sky-500" : "border-slate-300 bg-white"
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col items-center gap-1 min-w-0 w-full">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-slate-500" />
                      </div>
                      <span className="text-sm font-bold text-slate-900 leading-tight truncate">{item.name}</span>
                      {item.consumable && (
                        <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">استهلاكي</span>
                      )}
                      {isSerial && (
                        <div className="flex flex-wrap justify-center gap-1 w-full">
                          {shownSerials.map((s) => (
                            <span key={s} className="text-[10px] text-sky-600 font-mono bg-sky-50 px-1.5 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                          {serials.length > 3 && !isExpanded && (
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleExpand(item.id); }}
                              className="text-[10px] text-sky-500 hover:text-sky-700 font-medium"
                            >
                              +{serials.length - 3}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 w-full justify-center">
                      <span className={`text-lg font-bold ${
                        item.totalQty === 0 ? "text-red-600" : item.totalQty < 5 ? "text-amber-600" : "text-emerald-600"
                      }`}>
                        {item.totalQty}
                      </span>
                      <span className="text-[10px] text-slate-400">قطعة</span>
                      {isSerial && (
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleExpand(item.id); }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 min-w-[36px] min-h-[36px] flex items-center justify-center"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>
                      )}
                    </div>
                    {!readonly && (
                      <div className="flex gap-1.5 w-full" onClick={(e) => e.stopPropagation()}>
                        {activeVisits.length > 0 && (
                          <button
                            onClick={() => {
                              if (isSerial) {
                                openSingleSend(item);
                              } else {
                                onAddItemToBox(activeVisits[0].id, activeVisits[0].boxes[0]?.id || "", item.id, Math.min(1, item.totalQty));
                              }
                            }}
                            className="flex-1 py-2.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-[11px] font-medium transition-colors min-h-[44px] flex items-center justify-center gap-1"
                          >
                            <Send className="w-3.5 h-3.5" />
                            إرسال
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(item)}
                          className="flex-1 py-2.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-sky-100 hover:text-sky-700 text-[11px] font-medium transition-colors min-h-[44px] flex items-center justify-center"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="py-2.5 px-3 rounded-lg bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-500 transition-colors min-h-[44px] flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center">
          <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">لا توجد عناصر في المخزن.</p>
        </div>
      )}

      {selectedIds.size > 0 && !readonly && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 max-w-[95vw]">
          <span className="text-sm font-bold whitespace-nowrap">{selectedIds.size} محدد</span>
          <div className="w-px h-6 bg-slate-700" />
          {activeVisits.length > 0 && (
            <button
              onClick={openBulkSend}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-medium hover:bg-emerald-700 transition-colors min-h-[44px]"
            >
              <Send className="w-3.5 h-3.5" />
              إرسال
            </button>
          )}
          <button
            onClick={() => setShowBulkDeleteConfirm(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-red-600 text-white rounded-xl text-xs font-medium hover:bg-red-700 transition-colors min-h-[44px]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            حذف
          </button>
          <button
            onClick={clearSelection}
            className="p-2.5 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowBulkDeleteConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-slate-900">تأكيد الحذف</h3>
            <p className="text-sm text-slate-600">هل أنت متأكد من حذف {selectedIds.size} صنف من المخزن؟</p>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
              >
                حذف الكل
              </button>
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkSend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowBulkSend(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">إرسال {selectedIds.size} صنف إلى صندوق</h3>
              <button onClick={() => setShowBulkSend(false)} className="p-2 rounded-lg hover:bg-slate-100 min-w-[44px] min-h-[44px] flex items-center justify-center">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2">
              {selectedItems.map((item) => (
                <div key={item.id} className="text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{item.name}</span>
                    <span className="text-slate-400 shrink-0">({item.totalQty})</span>
                  </div>
                  {isSerialCategory(categories, item.category) && (
                    <div className="mt-1.5 mr-6 flex flex-wrap gap-1.5">
                      {availableSerials(item).map((s) => {
                        const picked = (serialPicks[item.id] || []).includes(s);
                        return (
                          <button
                            key={s}
                            onClick={() => toggleSerialPick(item.id, s)}
                            className={`text-[10px] font-mono px-2 py-1 rounded-lg border transition-colors min-h-[36px] flex items-center gap-1 ${
                              picked ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"
                            }`}
                          >
                            {picked && <Check className="w-3 h-3" />}
                            {s}
                          </button>
                        );
                      })}
                      {availableSerials(item).length === 0 && (
                        <span className="text-[10px] text-red-500">لا توجد أرقام متاحة</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <select
              value={sendVisitId}
              onChange={(e) => { setSendVisitId(e.target.value); setSendBoxId(""); }}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">اختر الزيارة</option>
              {activeVisits.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
            {sendVisitId && (
              <select
                value={sendBoxId}
                onChange={(e) => setSendBoxId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">اختر الصندوق</option>
                {activeVisits.find((v) => v.id === sendVisitId)?.boxes.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            )}
            <button
              disabled={!sendVisitId || !sendBoxId}
              onClick={handleBulkSend}
              className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              إرسال الأصناف المحددة
            </button>
          </div>
        </div>
      )}

      {singleSend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSingleSend(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">إرسال: {singleSend.name}</h3>
              <button onClick={() => setSingleSend(null)} className="p-2 rounded-lg hover:bg-slate-100 min-w-[44px] min-h-[44px] flex items-center justify-center">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {availableSerials(singleSend).map((s) => {
                const picked = singleSendPicks.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => setSingleSendPicks((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])}
                    className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-colors min-h-[44px] flex items-center gap-1 ${
                      picked ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"
                    }`}
                  >
                    {picked && <Check className="w-3.5 h-3.5" />}
                    {s}
                  </button>
                );
              })}
              {availableSerials(singleSend).length === 0 && (
                <p className="text-sm text-red-500 w-full text-center py-2">لا توجد أرقام متاحة لهذا الجهاز</p>
              )}
            </div>
            <select
              value={singleSendVisitId}
              onChange={(e) => { setSingleSendVisitId(e.target.value); setSingleSendBoxId(""); }}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">اختر الزيارة</option>
              {activeVisits.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
            {singleSendVisitId && (
              <select
                value={singleSendBoxId}
                onChange={(e) => setSingleSendBoxId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">اختر الصندوق</option>
                {activeVisits.find((v) => v.id === singleSendVisitId)?.boxes.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            )}
            <button
              disabled={!singleSendVisitId || !singleSendBoxId || singleSendPicks.length === 0}
              onClick={handleSingleSend}
              className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              إرسال {singleSendPicks.length} جهاز
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
