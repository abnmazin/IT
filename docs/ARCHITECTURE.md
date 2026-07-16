]# ARCHITECTURE.md — System Architecture

## Folder Structure

```
D:\Programing\Website\IT\
├── docs/
│   ├── PROJECT_INFO.md      # Core knowledge base
│   ├── ARCHITECTURE.md       # This file
│   └── CHANGELOG.md          # Modification ledger
├── src/
│   ├── app/
│   │   ├── globals.css       # Tailwind imports, scrollbar, RTL utilities
│   │   ├── layout.tsx        # Root layout: Arabic font, dir="rtl"
│   │   └── page.tsx          # Main SPA: state management, view routing
│   ├── components/
│   │   ├── Sidebar.tsx           # Collapsible RTL sidebar navigation
│   │   ├── Header.tsx            # Top bar: site selector, search, notifications
│   │   ├── DashboardView.tsx     # Stats cards, active checkouts, location health
│   │   ├── LocationCard.tsx      # Card for location grid (box/warehouse/shelf/room)
│   │   ├── LocationsView.tsx     # Location grid + type filters + add button
│   │   ├── LocationDetailView.tsx # Location items, +/- controls, serial numbers, transfer
│   │   ├── InventoryView.tsx     # Full item table with serial number column
│   │   ├── TransfersView.tsx     # Transfer history cards
│   │   ├── SettingsView.tsx      # Tabbed settings container (users/sites/categories/activity)
│   │   ├── UsersSettings.tsx     # User CRUD table + add/edit modal
│   │   ├── SitesSettings.tsx     # Site CRUD grid + add/edit modal
│   │   ├── CategoriesSettings.tsx # Category CRUD table + add/edit modal
│   │   ├── ActivityLogView.tsx   # Searchable/filterable activity log
│   │   ├── AddLocationModal.tsx  # Modal: create new location
│   │   ├── AddItemModal.tsx      # Modal: add item to location
│   │   └── TransferModal.tsx     # Modal: pick items + destination site
│   ├── data/
│   │   └── mockData.ts       # Sites, locations, items, transfers, users, activityLog
│   └── types/
│       └── index.ts          # TypeScript types, constants, helpers
├── tailwind.config.js
├── next.config.js
├── tsconfig.json
├── postcss.config.js
└── package.json
```

## Component Tree

```
RootLayout (layout.tsx) — <html dir="rtl" lang="ar">
└── Page (page.tsx) — State owner
    ├── sites, locations, items, transfers
    ├── selectedSiteId (site filter)
    ├── activeView, searchQuery, sidebarCollapsed, mobileMenuOpen
    │
    ├── Sidebar — Fixed right-side navigation (RTL)
    │   └── Nav: لوحة التحكم, الأماكن, المخزون, عمليات النقل, الإعدادات
    │
    ├── Header — Top bar
    │   ├── Site selector dropdown (all sites / specific site)
    │   ├── Hamburger button (mobile only)
    │   ├── Global search input
    │   └── Notification bell + Current user name/avatar
    │
    └── Active View (conditional render):
        │
        ├── DashboardView (site-filtered)
        │   ├── Stat cards (4x): الأماكن, العناصر, المستلمة, تنبيهات النقص
        │   ├── Active checkouts panel (with serial numbers)
        │   └── Location health progress bars
        │
        ├── LocationsView (site-filtered)
        │   ├── "+ إضافة مكان" button → AddLocationModal
        │   ├── Type filter buttons (الكل/صناديق/مخازن/رفوف/غرف)
        │   ├── LocationCard grid
        │   └── LocationDetailView (when location selected)
        │       ├── "إضافة صنف" button → AddItemModal
        │       ├── "نقل إلى موقع آخر" button → TransferModal
        │       ├── Quick return banner (with checkedOutBy name)
        │       └── ItemRow list
        │           ├── Tracked items: [−] 0/1 [+] with serial number badge
        │           └── Bulk items: [−] qty [+] with quantity display
        │
        ├── InventoryView (site-filtered)
        │   └── Table: الصنف | الرقم التسلسلي | الفئة | المكان | الموقع | الكمية | الحالة
        │
        └── TransfersView
            └── Transfer cards: date, from→to route, item count, item chips

        └── SettingsView (tabbed)
            ├── UsersSettings (المستخدمين tab)
            │   ├── User table with role badge, active/inactive toggle
            │   └── AddUserModal → create new user
            ├── SitesSettings (المواقع tab)
            │   ├── Site cards with stats, edit/delete buttons
            │   └── AddSiteModal → create new site
            ├── CategoriesSettings (الفئات tab)
            │   ├── Category table with key, name, serial tracked badge
            │   └── AddCategoryModal → create/edit category with serial toggle
            └── ActivityLogView (سجل النشاطات tab)
                ├── Filter by activity type
                ├── Search by description/username
                └── Log entries with timestamp, user avatar, type badge
```

## Data Flow

```
page.tsx (State Owner)
├── sites: Site[]                → Header (selector), all views (read)
├── locations: Location[]        → All views (read/write via handlers)
├── items: InventoryItem[]       → All views (read/write via handlers)
├── transfers: Transfer[]        → TransfersView (read), appended by handleTransferItems
├── users: User[]                → UsersSettings (read/write), Header (currentUser)
├── categories: Category[]       → CategoriesSettings (read/write), AddItemModal (read)
├── currentUser: User            → Header (display), activity logging
├── activityLog: ActivityLogEntry[] → ActivityLogView (read), appended by logActivity
├── selectedSiteId: string|null  → Header (read/write), filters locations+items
├── activeView: View             → Sidebar (read/write)
├── searchQuery: string          → Header (write), LocationsView+InventoryView (read)
├── sidebarCollapsed: boolean    → Sidebar (read/write)
├── mobileMenuOpen: boolean      → Sidebar + Header (read/write)
│
├── logActivity(type, desc, details?) → All mutation handlers
├── handleUpdateItemQty(itemId, delta)  → LocationDetailView (bulk items +/-)
├── handleCheckoutItem(itemId, by)      → LocationDetailView (tracked items −)
├── handleReturnItem(itemId)            → LocationDetailView (tracked items +, quick return)
├── handleAddLocation(name,type,siteId,label?) → AddLocationModal
├── handleAddItem(name,category,locId,serial?,qty?) → AddItemModal
├── handleTransferItems(itemIds[],fromSite,toSite,fromLoc) → TransferModal
├── handleAddSite(name)                → SitesSettings
├── handleEditSite(id, name)           → SitesSettings
├── handleDeleteSite(id)               → SitesSettings
├── handleAddCategory(key,label,serial) → CategoriesSettings
├── handleEditCategory(id,key,lbl,ser) → CategoriesSettings
├── handleDeleteCategory(id)           → CategoriesSettings
├── handleAddUser(data)                → UsersSettings
├── handleEditUser(id, data)           → UsersSettings
└── handleToggleUserActive(id)         → UsersSettings
```

## Data Model

```
Site (موقع)              — id, name
Location (مكان)          — id, name, type (box|warehouse|shelf|room|other), siteId, label?
InventoryItem (صنف)      — id, name, category, serialNumber?, locationId,
                           expectedQty, currentQty, checkedOut, checkedOutBy?, checkedOutDate?
Transfer (عملية نقل)      — id, date, fromSiteId, toSiteId, items[]
TransferItem             — itemId, itemName, serialNumber?, fromLocationId
User (مستخدم)           — id, name, email, role (admin|technician|viewer), active
Category (فئة)          — id, key, label, serialTracked
ActivityLogEntry (سجل)  — id, type, description, userId, userName, timestamp, details?
```

### Serial Number Rules
- Tracked categories: Laptop, Monitor, Printer, Docking Station
- Tracked items: individual +/- controls (1 at a time), serial number badge displayed
- Non-tracked items: bulk quantity +/- controls

### Location Types
- **Box (صندوق)** — Numbered equipment container
- **Warehouse (مخزن)** — Large storage room
- **Shelf (رف)** — Individual shelf/rack
- **Room (غرفة)** — Dedicated room
- **Other (أخرى)** — Custom/miscellaneous

## RTL (Arabic) Layout Strategy

- `<html dir="rtl" lang="ar">` at root level
- Arabic font: Cairo (Google Fonts, loaded in layout.tsx)
- Sidebar: Fixed to the RIGHT side (`right-0`)
- Main content: `mr-[68px] lg:mr-60`
- All directional classes flipped for RTL
- Site selector dropdown opens to the left in RTL

## Mobile Responsive Strategy

- Sidebar hidden below `lg`, toggled via hamburger
- Stats cards: 1 col → 2 col → 4 col
- Location grid: 1 col → 2 col → 3 col → 4 col
- Table columns hidden progressively (serial → location → site)
- Modals: full-width on mobile with padding
