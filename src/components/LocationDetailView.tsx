"use client";

import { useState } from "react";
import {
  Location,
  InventoryItem,
  Site,
  User,
  Category,
  isSerialTracked,
} from "@/types";
import {
  ArrowRight,
  MapPin,
  Plus,
  Minus,
  RotateCcw,
  Package,
  Truck,
  Tag,
} from "lucide-react";
import AddItemModal from "./AddItemModal";
import TransferModal from "./TransferModal";

interface LocationDetailViewProps {
  location: Location;
  items: InventoryItem[];
  siteName: string;
  allSites: Site[];
  currentUser: User;
  categories: Category[];
  onBack: () => void;
  onUpdateItemQty: (itemId: string, delta: number) => void;
  onCheckoutItem: (itemId: string, by: string) => void;
  onReturnItem: (itemId: string) => void;
  onAddItem: (
    name: string,
    category: InventoryItem["category"],
    locationId: string,
    serialNumber?: string,
    qty?: number
  ) => void;
  onTransferItems: (
    itemIds: string[],
    fromSiteId: string,
    toSiteId: string,
    fromLocationId: string
  ) => void;
}

export default function LocationDetailView({
  location,
  items,
  siteName,
  allSites,
  currentUser,
  categories,
  onBack,
  onUpdateItemQty,
  onCheckoutItem,
  onReturnItem,
  onAddItem,
  onTransferItems,
}: LocationDetailViewProps) {
  const [filter, setFilter] = useState<"all" | "available" | "checked-out">("all");
  const [showAddItem, setShowAddItem] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

  const checkedOutItems = items.filter((i) => i.checkedOut > 0);
  const totalExpected = items.reduce((a, i) => a + i.expectedQty, 0);
  const totalCurrent = items.reduce((a, i) => a + i.currentQty, 0);

  const filteredItems = items.filter((item) => {
    if (filter === "checked-out") return item.checkedOut > 0;
    if (filter === "available") return item.currentQty > 0;
    return true;
  });

  return (
    <div className="p-3 sm:p-6 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={onBack}
          className="flex items-center gap-2 h-11 px-3 rounded-lg text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للأماكن
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddItem(true)}
            className="flex items-center gap-2 px-4 h-11 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">إضافة صنف</span>
          </button>
          {items.length > 0 && (
            <button
              onClick={() => setShowTransfer(true)}
              className="flex items-center gap-2 px-4 h-11 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium transition-colors"
            >
              <Truck className="w-4 h-4" />
              <span className="hidden sm:inline">نقل إلى موقع آخر</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{location.name}</h1>
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 flex-wrap">
            {location.label && <span className="truncate">{location.label}</span>}
            <span className="flex items-center gap-1 min-w-0">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{siteName}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-xl sm:text-2xl font-bold text-slate-900">
              {totalCurrent}/{totalExpected}
            </p>
            <p className="text-xs text-slate-500">عنصر متاح</p>
          </div>
          <div className="h-10 w-px bg-slate-200" />
          <div className="text-right">
            <p className="text-xl sm:text-2xl font-bold text-amber-600">
              {checkedOutItems.reduce((a, i) => a + i.checkedOut, 0)}
            </p>
            <p className="text-xs text-slate-500">مستلم</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { value: "all" as const, label: `الكل (${items.length})` },
          {
            value: "available" as const,
            label: `متاح (${items.filter((i) => i.currentQty > 0).length})`,
          },
          {
            value: "checked-out" as const,
            label: `مستلم (${checkedOutItems.length})`,
          },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 h-10 rounded-lg text-xs font-medium transition-colors ${
              filter === f.value
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-3 sm:px-5 py-3 border-b border-slate-100 bg-slate-50">
          <div className="grid grid-cols-[1fr_auto] gap-4 items-center text-xs font-medium text-slate-500 uppercase tracking-wider">
            <span>الصنف</span>
            <span>الكمية</span>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              لا توجد عناصر مطابقة لهذا المرشح.
            </div>
          ) : (
            filteredItems.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                currentUser={currentUser}
                onCheckout={(by) => onCheckoutItem(item.id, by)}
                onReturn={() => onReturnItem(item.id)}
                onUpdateQty={(delta) => onUpdateItemQty(item.id, delta)}
              />
            ))
          )}
        </div>
      </div>

      {checkedOutItems.length > 0 && filter !== "checked-out" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4">
          <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            مستلم — اضغط إعادة للإرجاع
          </h3>
          <div className="space-y-2">
            {checkedOutItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 py-1.5"
              >
                <button
                  onClick={() => onReturnItem(item.id)}
                  className="flex items-center gap-1.5 px-4 h-11 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors shrink-0"
                >
                  إعادة
                  <Plus className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="text-right min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-amber-600 truncate">
                      {item.checkedOut} مستلم
                      {item.checkedOutBy && ` — ${item.checkedOutBy}`}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-amber-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddItem && (
        <AddItemModal
          locationId={location.id}
          categories={categories}
          onClose={() => setShowAddItem(false)}
          onAdd={onAddItem}
        />
      )}

      {showTransfer && (
        <TransferModal
          items={items}
          fromSiteId={location.siteId}
          fromLocationId={location.id}
          allSites={allSites}
          onClose={() => setShowTransfer(false)}
          onTransfer={onTransferItems}
        />
      )}
    </div>
  );
}

function ItemRow({
  item,
  currentUser,
  onCheckout,
  onReturn,
  onUpdateQty,
}: {
  item: InventoryItem;
  currentUser: User;
  onCheckout: (by: string) => void;
  onReturn: () => void;
  onUpdateQty: (delta: number) => void;
}) {
  const isFullyOut = item.currentQty === 0;
  const isAtMax = item.currentQty >= item.expectedQty;
  const tracked = isSerialTracked(item.category);
  const isBulk = item.expectedQty > 1 && !tracked;

  return (
    <div
      className={`px-3 sm:px-5 py-3 flex items-center gap-2 sm:gap-3 transition-colors ${
        isFullyOut ? "bg-red-50/50" : "hover:bg-slate-50"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {isFullyOut && (
            <span className="text-[10px] font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
              مستلم
            </span>
          )}
          <p className="text-sm font-medium text-slate-800 truncate">
            {item.name}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <p className="text-xs text-slate-400">{item.category}</p>
          {item.serialNumber && (
            <span className="flex items-center gap-1 text-xs text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded font-mono">
              <Tag className="w-3 h-3" />
              {item.serialNumber}
            </span>
          )}
          {!tracked && (
            <span className="text-xs text-slate-400">
              المطلوب: {item.expectedQty}
            </span>
          )}
          {item.checkedOutBy && (
            <span className="text-xs text-amber-600 truncate">
              المستلم: {item.checkedOutBy}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {tracked ? (
          <>
            <button
              onClick={() => onCheckout(currentUser.name)}
              disabled={isFullyOut}
              className="w-11 h-11 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="استلام"
            >
              <Minus className="w-5 h-5" />
            </button>
            <div className="w-10 text-center">
              <span
                className={`text-lg font-bold ${
                  isFullyOut ? "text-red-500" : "text-emerald-600"
                }`}
              >
                {isFullyOut ? "0" : "1"}
              </span>
            </div>
            <button
              onClick={onReturn}
              disabled={!isFullyOut}
              className="w-11 h-11 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="إعادة"
            >
              <Plus className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onUpdateQty(-1)}
              disabled={isFullyOut}
              className="w-11 h-11 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="خصم واحد"
            >
              <Minus className="w-5 h-5" />
            </button>
            <div className="w-10 text-center">
              <span
                className={`text-lg font-bold ${
                  isFullyOut ? "text-red-500" : "text-slate-800"
                }`}
              >
                {item.currentQty}
              </span>
            </div>
            <button
              onClick={() => onUpdateQty(1)}
              disabled={isAtMax}
              className="w-11 h-11 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="إضافة واحد"
            >
              <Plus className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
