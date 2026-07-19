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
│   │   ├── layout.tsx        # Root layout: Arabic font, dir="rtl", <Providers>
│   │   └── page.tsx          # Main SPA: uses useAuth() + useData(), view routing
│   ├── components/
│   │   ├── Sidebar.tsx           # Collapsible RTL sidebar navigation (8 pages)
│   │   ├── Header.tsx            # Top bar: notifications badge, user name, logout
│   │   ├── LoginPage.tsx         # PIN-based login form (username + numeric PIN)
│   │   ├── Providers.tsx         # Wraps AuthProvider + DataProvider
│   │   ├── DashboardView.tsx     # Stats + visits comparison chart
│   │   ├── WarehouseView.tsx     # Grid cards: warehouse items + category management
│   │   ├── BoxesView.tsx         # Active visit boxes (display-only)
│   │   ├── BoxDetailView.tsx     # Display-only box view (boxes page) with +/- controls
│   │   ├── VisitsView.tsx        # Visit cards grouped by status
│   │   ├── VisitDetailView.tsx   # Visit detail: boxes, activation, collecting, activity log
│   │   ├── CollectionView.tsx    # Partial return controls per box/category
│   │   ├── VisitReport.tsx       # Full comparison report per visit
│   │   ├── TransfersView.tsx     # Completed visits archive (expandable cards)
│   │   ├── SettingsView.tsx      # Users page container
│   │   ├── UsersSettings.tsx     # User CRUD table + add/edit modal (with PIN)
│   │   ├── CategoriesSettings.tsx # Category CRUD table + consumable toggle
│   │   ├── ActivityLogView.tsx   # Searchable/filterable activity log with date picker
│   ├── contexts/
│   │   ├── AuthContext.tsx        # Auth state: login(username, pin), logout, session persistence
│   │   └── DataContext.tsx        # Data state: Firestore real-time listeners, all CRUD handlers
│   ├── lib/
│   │   ├── firebase.ts           # Firebase app init + Firestore + offline persistence
│   │   └── firestore.ts          # Service layer: subscribe (onSnapshot), CRUD, seed helper
│   ├── data/
│   │   └── mockData.ts       # Seed data: warehouse items, visits, users, activity log
│   └── types/
│       └── index.ts          # TypeScript types, constants, helpers
├── .env.local               # Firebase credentials (not committed)
├── .env.local.example       # Firebase credentials template
├── tailwind.config.js
├── next.config.js
├── tsconfig.json
├── postcss.config.js
└── package.json
```

## Component Tree

```
RootLayout (layout.tsx) — <html dir="rtl" lang="ar">
└── Providers (Providers.tsx)
    ├── AuthProvider (AuthContext.tsx) — login/logout, session persistence
    └── DataProvider (DataContext.tsx) — Firestore real-time listeners, CRUD handlers
        └── Page (page.tsx) — View router, auth gate
            ├── !user → LoginPage (username + PIN)
            └── user →
                ├── Sidebar — Fixed right-side navigation (RTL)
                ├── Header — Notifications badge + user name + logout
                └── Active View (conditional render):
                    │
                    ├── DashboardView
                    │   ├── Stat cards (3x): إجمالي المخزن, العناصر في الزيارات, زيارات نشطة
                    │   └── Visits comparison stacked bar chart (returned/consumed/missing)
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
                    ├── VisitsView (all statuses including completed)
                    │   ├── Visit cards grouped by status
                    │   ├── Inactive with boxes: تعبئة (fill) + تفعيل (activate) buttons
                    │   ├── Shortage warning panel (amber) with item details
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
                    │   └── UsersSettings — CRUD table + add/edit modal (with PIN field)
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
page.tsx — Uses contexts, no local data state
├── useAuth() → AuthContext
│   ├── user: User | null         — Current logged-in user (or null → LoginPage)
│   ├── login(username, pin)      — Authenticate against Firestore users collection
│   ├── logout()                  — Clear session (localStorage)
│   └── loading: boolean          — True while Firestore initializes
│
├── useData() → DataContext
│   ├── warehouseItems: WarehouseItem[]  — Real-time from Firestore
│   ├── visits: Visit[]                  — Real-time from Firestore
│   ├── categories: Category[]           — Real-time from Firestore
│   ├── users: User[]                    — Real-time from Firestore
│   ├── activityLog: ActivityLogEntry[]  — Real-time from Firestore (ordered by timestamp desc)
│   ├── loading: boolean                 — True while initial data loads
│   ├── newNotificationCount: number     — Tracks new activity entries since last clear
│   ├── clearNotifications()             — Resets notification badge count
│   │
│   ├── handleAddWarehouseItem(name, cat, serial, qty, consumable) → saveWarehouseItem()
│   ├── handleEditWarehouseItem(id, name, cat, serial, qty, consumable) → saveWarehouseItem()
│   ├── handleDeleteWarehouseItem(id) → deleteWarehouseItemFS()
│   ├── handleAddCategory(key, label, serial, consumable) → saveCategory()
│   ├── handleEditCategory(id, key, label, serial, consumable) → saveCategory()
│   ├── handleDeleteCategory(id) → deleteCategoryFS()
│   ├── handleAddVisit(name, date, hijriDate?) → saveVisit()
│   ├── handleToggleVisit(id) → saveVisit()
│   ├── handleCollectVisit(id, collected[]) → saveVisit()
│   ├── handleFillBox(visitId, boxId, items) → saveVisit() + saveWarehouseItem()
│   ├── handleReturnItems(visitId, boxId, returned[]) → saveVisit() + saveWarehouseItem()
│   ├── handleAddBox(visitId, name, label) → saveVisit()
│   ├── handleDeleteBox(visitId, boxId) → saveVisit()
│   ├── handleReactivateVisit(visitId) → saveVisit() + saveWarehouseItem()
│   ├── handleFillBoxesFromTemplate(visitId) → saveVisit() + saveWarehouseItem()
│   ├── handleUpdateBoxItemQty(visitId, boxId, warehouseItemId, delta) → saveVisit()
│   ├── handleAddUser(name, email, role, pin) → saveUser()
│   ├── handleEditUser(id, name, email, role, pin) → saveUser()
│   ├── handleDeleteUser(id) → deleteUserFS()
│   └── handleToggleUser(id) → saveUser()
│
└── Firestore subscriptions (real-time via onSnapshot)
    ├── subscribeWarehouseItems → setWarehouseItems
    ├── subscribeVisits → setVisits
    ├── subscribeCategories → setCategories
    ├── subscribeActivityLog → setActivityLog (ordered by timestamp desc)
    └── subscribeUsers → setUsers
```

### First-Run Seed
- `seedFirestoreIfNeeded()` in DataContext checks if Firestore collections are empty
- If any collection is empty, seeds all collections from `mockData.ts` + `defaultCategories`
- Runs once per app session (module-level `seeded` flag)
- Seed function: `seedCollection<T>(colName, items[])` in firestore.ts

## Data Model

```
WarehouseItem (صنف مخزن)     — id, name, category, serialNumber?, totalQty, consumable
Visit (زيارة)                 — id, name, date, hijriDate?, year?, status (inactive|active|collecting|completed), boxes[]
Box (صندوق)                   — id, name, label?, items[]
BoxItem (صنف صندوق)          — warehouseItemId, name, category, serialNumber?, qty, consumable, returnedQty?, status?
Category (فئة)                — id, key, label, serialTracked, consumable
User (مستخدم)                 — id, name, email, role (admin|technician|viewer), pin, active
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

## Mock Data / Seed Data

- 66 warehouse items: 40 laptops (IT 01–IT 40, serial-tracked) + peripherals (monitors, printers, keyboards, mice, cables, labels, headsets, adapters, docking stations)
- 6 visits (2 template/inactive + 4 completed with realistic returned/consumed/missing statuses)
- 4 users (admin, 2 technicians, viewer) — all with PIN: "1234"
- 6 activity log entries with visitIds
- 10 default categories (Laptop, Keyboard, Mouse, Monitor, Printer, Cable, Label, Headset, Adapter, Docking Station)

## Firebase Integration

### Firestore Collections
- `users` — User documents with pin field for PIN-based authentication
- `warehouseItems` — All warehouse items with serial numbers and quantities
- `visits` — Visit documents containing nested boxes and box items
- `categories` — Category definitions (10 defaults seeded on first run)
- `activityLog` — Activity entries ordered by timestamp descending

### Auth Flow
1. User opens app → LoginPage shown (username + numeric PIN)
2. AuthContext checks Firestore `users` collection for matching name + active status
3. On match, user stored in state + localStorage for session persistence
4. Subsequent visits auto-restore session from localStorage (no re-login needed)

### Real-Time Sync
- All data reads use `onSnapshot` (real-time Firestore listeners)
- All writes use `setDoc` with document IDs (client-generated, not auto-generated)
- Offline persistence enabled via `enableIndexedDbPersistence`
- Changes sync automatically across all connected clients
