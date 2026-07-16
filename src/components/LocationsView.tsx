"use client";

import { useState, useMemo } from "react";
import { Site, Location, InventoryItem, User, Category } from "@/types";
import LocationCard from "./LocationCard";
import LocationDetailView from "./LocationDetailView";
import AddLocationModal from "./AddLocationModal";
import { Search, Filter, Plus } from "lucide-react";

interface LocationsViewProps {
  sites: Site[];
  locations: Location[];
  items: InventoryItem[];
  currentUser: User;
  categories: Category[];
  searchQuery: string;
  selectedSiteId: string | null;
  onUpdateItemQty: (itemId: string, delta: number) => void;
  onCheckoutItem: (itemId: string, by: string) => void;
  onReturnItem: (itemId: string) => void;
  onAddLocation: (
    name: string,
    type: Location["type"],
    siteId: string,
    label?: string
  ) => void;
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
  onTogglePin: (locationId: string) => void;
}

type TypeFilter = "all" | Location["type"];

export default function LocationsView({
  sites,
  locations,
  items,
  currentUser,
  categories,
  searchQuery,
  selectedSiteId,
  onUpdateItemQty,
  onCheckoutItem,
  onReturnItem,
  onAddLocation,
  onAddItem,
  onTransferItems,
  onTogglePin,
}: LocationsViewProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredLocations = useMemo(() => {
    let result = locations;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          (l.label && l.label.toLowerCase().includes(q)) ||
          l.type.toLowerCase().includes(q) ||
          items.some(
            (i) => i.locationId === l.id && i.name.toLowerCase().includes(q)
          )
      );
    }
    if (typeFilter !== "all") {
      result = result.filter((l) => l.type === typeFilter);
    }
    return [...result].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
  }, [locations, items, searchQuery, typeFilter]);

  const currentLocationData = selectedLocation
    ? locations.find((l) => l.id === selectedLocation.id) ?? selectedLocation
    : null;

  if (currentLocationData) {
    const locItems = items.filter((i) => i.locationId === currentLocationData.id);
    const site = sites.find((s) => s.id === currentLocationData.siteId);
    return (
      <LocationDetailView
        location={currentLocationData}
        items={locItems}
        siteName={site?.name ?? ""}
        allSites={sites}
        currentUser={currentUser}
        categories={categories}
        onBack={() => setSelectedLocation(null)}
        onUpdateItemQty={onUpdateItemQty}
        onCheckoutItem={onCheckoutItem}
        onReturnItem={onReturnItem}
        onAddItem={onAddItem}
        onTransferItems={onTransferItems}
      />
    );
  }

  const typeFilters: { value: TypeFilter; label: string }[] = [
    { value: "all", label: "الكل" },
    { value: "box", label: "صناديق" },
    { value: "warehouse", label: "مخازن" },
    { value: "shelf", label: "رفوف" },
    { value: "room", label: "غرف" },
  ];

  return (
    <div className="p-3 sm:p-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">الأماكن</h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة أماكن التخزين واستلام/إعادة المعدات
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 h-11 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">إضافة مكان</span>
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-slate-400" />
        {typeFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setTypeFilter(f.value)}
            className={`px-3 h-9 rounded-lg text-xs font-medium transition-colors ${
              typeFilter === f.value
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="text-xs text-slate-400 mr-1">
          {filteredLocations.length} مكان
        </span>
      </div>

      {filteredLocations.length === 0 ? (
        <div className="py-20 text-center">
          <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-400">
            لا توجد أماكن مطابقة لمرشحاتك.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
          {filteredLocations.map((loc) => {
            const locItems = items.filter((i) => i.locationId === loc.id);
            const site = sites.find((s) => s.id === loc.siteId);
            return (
              <LocationCard
                key={loc.id}
                location={loc}
                items={locItems}
                siteName={site?.name ?? ""}
                onClick={() => setSelectedLocation(loc)}
                onTogglePin={() => onTogglePin(loc.id)}
              />
            );
          })}
        </div>
      )}

      {showAddModal && (
        <AddLocationModal
          sites={sites}
          selectedSiteId={selectedSiteId}
          onClose={() => setShowAddModal(false)}
          onAdd={onAddLocation}
        />
      )}
    </div>
  );
}
