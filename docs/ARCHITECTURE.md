# ARCHITECTURE.md — System Architecture

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
│   │   ├── Sidebar.tsx           # Collapsible RTL sidebar navigation (8 pages)
│   │   ├── Header.tsx            # Top bar: search, notifications, user avatar
│   │   ├── DashboardView.tsx     # Stats + visits comparison chart + activity feed
│   │   ├── WarehouseView.tsx     # Grid cards: warehouse items + category management
│   │   ├── BoxesView.tsx         # Active visit boxes (display-only)
│   │   ├── BoxDetailView.tsx     # Display-only box view (boxes page) with +/- controls
│   │   ├── VisitsView.tsx        # Visit cards grouped by status
│   │   ├── VisitDetailView.tsx   # Visit detail: boxes, activation, collecting, activity log
│   │   ├── CollectionView.tsx    # Partial return controls per box/category
│   │   ├── VisitReport.tsx       # Full comparison report per visit
│   │   ├── TransfersView.tsx     # Completed visits archive (expandable cards)
│   │   ├── SettingsView.tsx      # Tabbed settings container (users only)
│   │   ├── UsersSettings.tsx     # User CRUD table + add/edit modal
│   │   ├── CategoriesSettings.tsx # Category CRUD table + consumable toggle
│   │   ├── ActivityLogView.tsx   # Searchable/filterable activity log with date picker
│   ├── data/
│   │   └── mockData.ts       # Warehouse items, visits, users, activity log
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
    ├── warehouseItems, visits, users, categories, activityLog
    ├── activeView, searchQuery, sidebarCollapsed, mobileMenuOpen
    │
    ├── Sidebar — Fixed right-side navigation (RTL)
    │   └── Nav: لوحة التحكم, المخزن, الصناديق, الزيارات, الزيارات المكتملة
    │   └── Bottom: المستخدمين, الفئات, سجل النشاط
    │
    ├── Header — Top bar
    │   ├── Hamburger button (mobile only)
    │   ├── Global search input
    │   └── Notification bell + Current user name/avatar
    │
    └── Active View (conditional render):
        │
        ├── DashboardView
        │   ├── Stat cards (3x): إجمالي المخزن, العناصر في الزيارات, زيارات نشطة
        │   ├── Visits comparison stacked bar chart (returned/consumed/missing)
        │   └── Recent activity feed (last 5 entries)
        │
        ├── WarehouseView
        │   ├── Grid cards: warehouse items with consumable/serial badges
        │   ├── Search + category filter dropdown
        │   ├── "+ إضافة صنف" button → inline form
        │   └── "+ إضافة فئة" button → inline form (violet)
        │
        ├── BoxesView (display-only)
        │   ├── Active visit boxes with +/- quantity controls
        │   ├── Fixed reference qty under item name
        │   └── "لا توجد زيارة مفعلة" message when no active visit
        │
        ├── VisitsView (inactive/active/collecting only)
        │   ├── Visit cards grouped by status
        │   ├── Activation dialog (year + hijri date input)
        │   └── "+ إضافة زيارة" button
        │
        ├── VisitDetailView
        │   ├── Box cards grid with fill/collect/complete buttons
        │   ├── Activation confirmation dialog
        │   ├── Collecting mode (CollectionView per box)
        │   └── Per-visit activity log (expandable)
        │
        ├── CollectionView
        │   ├── Per-box or per-category view toggle
        │   ├── +/- controls for partial return
        │   ├── Consumables default to 0, non-consumable default to full
        │   └── No "missing" button (red indicator obvious)
        │
        ├── CompletedVisitsView (archive)
        │   ├── Expandable cards per completed visit
        │   ├── Full detail per box and item
        │   └── Reset button to reactivate template
        │
        ├── VisitReport
        │   ├── Per-box breakdown with statuses
        │   └── Summary: returned/consumed/missing
        │
        ├── SettingsView (users only)
        │   └── UsersSettings — CRUD table + add/edit modal
        │
        ├── CategoriesSettings
        │   └── Category table with consumable toggle
        │
        └── ActivityLogView
            ├── Filter panel: type filters + date picker + visit selector
            ├── Search by description/username
            └── Log entries with timestamp, user avatar, type badge
```

## Data Flow

```
page.tsx (State Owner)
├── warehouseItems: WarehouseItem[]  → WarehouseView (read/write), BoxesView (read)
├── visits: Visit[]                  → VisitsView, VisitDetailView, BoxesView, CompletedVisitsView
├── categories: Category[]           → CategoriesSettings (read/write), WarehouseView (read/write)
├── users: User[]                    → UsersSettings (read/write), Header (currentUser)
├── activityLog: ActivityLogEntry[]  → ActivityLogView (read), DashboardView (read)
├── activeView: View                 → Sidebar (read/write)
├── searchQuery: string              → Header (write), WarehouseView (read)
├── sidebarCollapsed: boolean        → Sidebar (read/write)
├── mobileMenuOpen: boolean          → Sidebar + Header (read/write)
│
├── logActivity(type, desc, details?, visitId?) → All mutation handlers
├── handleAddWarehouseItem(data)       → WarehouseView
├── handleEditWarehouseItem(id, data)  → WarehouseView
├── handleDeleteWarehouseItem(id)      → WarehouseView
├── handleAddCategory(key,serial,consumable) → WarehouseView
├── handleEditCategory(id, data)       → CategoriesSettings
├── handleDeleteCategory(id)           → CategoriesSettings
├── handleAddVisit(name, date)         → VisitsView
├── handleToggleVisit(id)              → VisitDetailView (activate/deactivate)
├── handleCollectVisit(id)             → VisitDetailView (start collecting)
├── handleCompleteVisit(id, report)    → CollectionView (finish, move to archive)
├── handleFillBox(visitId, boxId, items) → VisitDetailView (fill box from warehouse)
├── handleReturnItems(visitId, boxId, items) → CollectionView (return to warehouse)
├── handleAddUser(data)                → UsersSettings
├── handleEditUser(id, data)           → UsersSettings
├── handleToggleUserActive(id)         → UsersSettings
└── handleNavigate(view)              → Sidebar, Header
```

## Data Model

```
WarehouseItem (صنف مخزن)     — id, name, category, serialNumber?, totalQty, consumable
Visit (زيارة)                 — id, name, date, hijriDate?, year?, status (inactive|active|collecting|completed), boxes[]
Box (صندوق)                   — id, name, label?, items[]
BoxItem (صنف صندوق)          — warehouseItemId, name, category, serialNumber?, qty, consumable, returnedQty?, status?
Category (فئة)                — id, key, label, serialTracked, consumable
User (مستخدم)                 — id, name, email, role (admin|technician|viewer), active
ActivityLogEntry (سجل)        — id, type, description, userId, userName, timestamp, visitId?, details?
VisitReport (تقرير زيارة)    — visitId, visitName, hijriDate?, gregorianDate, completedAt, summary, boxReports[]
```

### Visit Lifecycle
```
inactive → active (confirmation dialog with year + hijri input)
active → collecting (start returning items)
collecting → completed (moves to archive, template stays for reactivation)
completed → inactive (reactivated from archive)
```

### Serial Number Rules
- Tracked categories: Laptop, Monitor, Printer, Docking Station
- Tracked items: individual +/- controls (1 at a time), serial number badge displayed
- Non-tracked items: bulk quantity +/- controls

### Consumable vs Non-Consumable
- **Consumable** (Cable, Label): Don't need return, default to 0 in CollectionView
- **Non-consumable** (Laptop, Mouse, etc.): Must be returned or flagged missing
- `consumable` flag on: Category, WarehouseItem, BoxItem

### View Types
```
dashboard | warehouse | boxes | visits | completed-visits | users | categories-settings | activity-log
```

## RTL (Arabic) Layout Strategy

- `<html dir="rtl" lang="ar">` at root level
- Arabic font: Cairo (Google Fonts, loaded in layout.tsx)
- Sidebar: Fixed to the RIGHT side (`right-0`)
- Main content: `mr-[68px] lg:mr-60`
- All directional classes flipped for RTL
- Site selector dropdown opens to the left in RTL

## Mobile Responsive Strategy

- Sidebar hidden below `lg`, toggled via hamburger
- Stats cards: 1 col → 2 col → 3 col
- Warehouse grid: 2 col → 3 col → 4 col → 5 col
- Visit/box cards: 1 col → 2 col → 3 col
- All buttons: 40-44px touch targets
- Bottom action buttons stack vertically on mobile
- Modals: full-width on mobile with padding

## Mock Data

- 66 warehouse items: 40 laptops (IT 01–IT 40, serial-tracked) + peripherals (monitors, printers, keyboards, mice, cables, labels, headsets, adapters, docking stations)
- 2 visits with boxes containing items
- 4 users (admin, 2 technicians, viewer)
- 6 activity log entries with visitIds
