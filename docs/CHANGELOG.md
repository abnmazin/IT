# CHANGELOG.md

All notable changes to this project will be documented in this file.

---

## [2026-07-18] — Reactivation Fix + Fill Button + Shortage Check

### Changed
- **handleReactivateVisit**: Only returns items with `status="returned"` to warehouse; consumed/missing items NOT returned
- **Template preserved**: Boxes keep item names/categories, qty reset to 0, status cleared for new cycle
- **Fill from template**: New `handleFillBoxesFromTemplate` checks warehouse stock before filling
- **Shortage warning**: If warehouse has less than template requires, shows amber warning panel with item names, needed vs available qty
- **Fill options**: "متابعة بالتناقص" (fill available) or "إلغاء" (cancel)
- **VisitsView buttons**: Inactive visits with boxes show "تعبئة" (fill) + "تفعيل" (activate); without boxes only "تفعيل"

### Build
- Build passes: 22.6 kB page / 110 kB first load

---

## [2026-07-18] — Mobile Activity Log + Visit Filter Year + Completed Visits Reactivation

### Fixed
- **ActivityLogView mobile**: Simplified log entries stack vertically, removed separate user/date column, moved all metadata into single row below description
- **ActivityLogView padding**: Added page padding `p-3 sm:p-6` for consistency
- **Filter buttons**: More compact with shorter Arabic labels

### Changed
- **Visit filter dropdown**: Now shows `visit name — year (or hijri date)` to distinguish same visit across years
- **Visits page**: Completed visits now visible on visits page (not hidden)
- **Completed visit card**: Purple "إعادة تفعيل" button with RotateCcw icon
- **handleReactivateVisit**: Resets status to inactive, clears box items, returns warehouse quantities

### Build
- Build passes: 21.9 kB page / 109 kB first load

---

## [2026-07-18] — Dashboard Charts + Activity Log Date Picker

### Added
- **Dashboard visits comparison chart**: Stacked bar chart comparing completed visits (returned/consumed/missing items)
- **Dashboard recent activity feed**: Last 5 activity log entries on dashboard
- **Activity log date picker**: "Today" filter replaced with full date picker (select any day)
- **Activity log visit filter**: Now includes ALL visits (active + completed), not just completed
- **DashboardView receives `visits` + `activityLog` props**

### Changed
- ActivityLogView: `FilterType` changed from `"today"` to `"date"` with `filterDate` state
- Visit dropdown in activity log shows all visits regardless of status
- DashboardView: Added stacked bar chart with color legend (green=returned, amber=consumed, red=missing)
- DashboardView: Recent activity list shows last 5 entries with type badge and timestamp

### Build
- Build passes: 21.6 kB page / 109 kB first load

---

## [2026-07-18] — Per-Visit Activity Log + Global Log Filters + Mobile Fixes

### Added
- **Per-visit activity log**: VisitDetailView has expandable activity log section filtered by `visitId`
- **Global activity log filters**: Filter panel with type filters (Today/Visits/Checkout/Return/Add/Edit/Delete)
- **Completed visit selector** in activity log filter panel
- **`visitId` on ActivityLogEntry**: All handlers (handleToggleVisit, handleCollectVisit, handleFillBox, handleReturnItems, handleAddVisit) pass `visitId` to `logActivity`
- **Visit type `year` field**: Optional year input on activation confirmation dialog

### Changed
- Activity log filter panel: type buttons + completed visit dropdown selector
- All activity handlers updated to log `visitId` for per-visit filtering

---

## [2026-07-18] — Mobile Responsiveness Across All Pages

### Fixed
- **All pages**: +/- buttons 40-44px touch targets, action buttons 44px min-h, close buttons 36px
- **Search clear buttons**: Padded for touch targets
- **Bottom action buttons**: Stack vertically on mobile (`flex-col sm:flex-row`)
- **Empty states**: Responsive padding (`p-4 sm:p-8`)
- **CollectionView**: Per-item +/- controls fully responsive
- **BoxesView**: Empty state and active visit display responsive
- **VisitDetailView**: Box cards, activation dialog, collecting mode all responsive
- **WarehouseView**: Grid cards, search bar, category filter responsive

---

## [2026-07-18] — Boxes Page + Display-Only Mode

### Added
- **Boxes page** (`boxes` view): Dedicated page showing only active visit's boxes
- **Display-only BoxDetailView**: Read-only mode for boxes page with +/- controls
  - Fixed reference qty displayed under item name
  - +/- buttons adjustable between 0 and reference qty
  - No fill/return/delete buttons (editing done from visits page)
- **"لا توجد زيارة مفعلة"** message when no active visit exists

### Changed
- BoxesView: Now shows only active visit boxes, not all visits
- BoxDetailView: Dual mode (display-only for boxes page, full edit for visit detail)

---

## [2026-07-18] — Warehouse Grid Card Layout

### Added
- **Warehouse grid card layout**: Items displayed as square cards in responsive grid (2-5 columns)
- **Consumable badge** on cards for consumable items
- **Serial number badge** on cards for serial-tracked items
- **Quantity display** on cards
- **Edit/Delete buttons** on each card
- **Add Category button**: Inline form in WarehouseView header (violet color)
- **Auto-select category**: When category filter is active, add item form pre-selects that category

### Changed
- WarehouseView completely rewritten from list to grid card layout
- Grid responsive: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`
- Each card: icon + name + serial + qty + consumable badge + edit/delete

---

## [2026-07-18] — Completed Visits Archive + Visit Reports

### Added
- **CompletedVisitsView** (archive page): Expandable cards for all completed visits with full detail
- **VisitReport**: Full comparison report per box with statuses (returned/consumed/missing)
- **Sidebar navigation**: "الزيارات المكتملة" (completed-visits) page
- **Partial returns**: CollectionView supports returning partial quantities per item
- **Qty 0 support**: Allow pulling 0 items from warehouse

### Changed
- Visits page now only shows inactive/active/collecting visits (completed go to archive)
- TransfersView renamed to CompletedVisitsView (archive)

---

## [2026-07-18] — Consumable Items + Collection View Redesign

### Added
- **Consumable system**: `consumable` property on Category, WarehouseItem, BoxItem types
- **Visit lifecycle (4 states)**: inactive → active → collecting → completed
- **Activation confirmation dialog** with year + hijri date input
- **CollectionView redesign**: Per-box/category view toggle, +/- controls for partial return
  - Consumables default to 0 (not returned)
  - Non-consumables default to full qty
  - No "missing" button (obvious from red indicator)

### Changed
- Categories: Added `consumable` boolean field
- WarehouseItem: Added `consumable` boolean field
- BoxItem: Added `consumable`, `returnedQty`, `status` fields
- Visit: Added `hijriDate`, `year` fields
- VisitReport: Full comparison with per-box breakdown

---

## [2026-07-18] — Fill Modal Redesign + Category Management

### Added
- **Fill modal redesign**: Search bar + category filter dropdown + collapsible accordion groups
- **Add Category button**: In WarehouseView header, violet color, inline form with name + serialTracked + consumable checkboxes
- **Category CRUD**: Add/edit/delete categories from WarehouseView

### Changed
- Fill modal: Groups items by category in collapsible accordions
- Fill modal: Search filters across all items
- Fill modal: Category dropdown filters items

---

## [2026-07-17] — BoxDetailView Full Page View

### Added
- **BoxDetailView**: Full page view for box items with +/- controls
- **Visit cards as grid**: Visits displayed as compact card grid

### Changed
- Visit cards: Grid layout with status indicators
- Box cards: Display visit info and box contents

---

## [2026-07-17] — Major Restructure: Warehouse + Visits System

### New Data Model
- `WarehouseItem`, `Visit` (inactive/active/completed), `Box`, `BoxItem`
- Removed: `Site`, `Location`, `InventoryItem` (old models)

### New Pages (8 in Sidebar)
1. لوحة التحكم — stats dashboard with charts
2. المخزن — central inventory grid cards
3. الصناديق — active visit boxes (display-only)
4. الزيارات — visits list + detail + fill/return boxes
5. الزيارات المكتملة — completed visits archive
6. المستخدمين — user management
7. الفئات — category management
8. سجل النشاط — activity log with filters

### Visit Workflow
- Activate → fill boxes from warehouse (qty decreases)
- Collecting → return items to warehouse (qty restored)
- Completed → moves to archive, template stays for reactivation

### Deleted Files
- LocationsView, LocationCard, LocationDetailView, AddLocationModal
- InventoryView, AddItemModal, TransferModal, SitesSettings

### Build: 21.6 kB / 109 kB

---

## [2026-07-16] — Settings Split into Sidebar Navigation

### Changed
- Sites, Categories, Activity Log moved from SettingsView tabs to separate Sidebar nav items
- Sidebar bottom section: المستخدمين (Users), الفئات (Categories), سجل النشاط (Activity Log)
- SettingsView simplified to only UsersSettings (removed tabs, sites, categories, activity props)
- Added 3 new View types: `sites-settings`, `categories-settings`, `activity-log`
- Each new view has its own page header + standalone component in page.tsx

---

## [2026-07-16] — Inventory List Layout (Rows instead of Grid)

### Changed
- Items within each category changed from grid cards to vertical list rows
- Each row: icon + item name (right) + total qty + checked-out count + locations count + chevron (left)
- Cleaner, easier-to-read layout on all screen sizes
- Expanded detail panel remains the same (per-location breakdown)

---

## [2026-07-16] — Inventory 3-Level Hierarchy (Categories → Items → Detail)

### Added
- Categories accordion sections: each category collapsible with icon, item count, total pieces
- Item cards within categories: grid of cards showing item name, total qty, checked-out count, number of locations
- Item detail expansion: click item card → inline panel showing per-location breakdown (location name, site, available qty, checked-out qty + person)
- `categories` prop added to InventoryView

### Changed
- InventoryView completely rewritten from table to 3-level hierarchy
- All categories open by default, toggle on click
- Only categories with items are shown
- Search filters across name, category, serial number
- Mobile: `grid-cols-2`, compact cards, full-width detail panels
- Item detail panel uses `col-span-full` on all breakpoints when expanded

### Build
- Build passes: 19.6 kB page / 107 kB first load

---

## [2026-07-16] — Inventory Mobile Cards + Desktop Table

### Changed
- InventoryView completely redesigned for mobile: card-based layout on `< sm`, table on `sm+`
- Mobile cards: compact white cards with item name, category/location/site tags, serial number badge, quantity, status badge
- Desktop: table with responsive hidden columns (serial hidden < md, location/site hidden < lg)
- All text truncated, no overflow on any screen size

---

## [2026-07-16] — Dashboard Stat Widgets (Box-style)

### Changed
- Dashboard overview stats redesigned as compact colored box-style widgets (like LocationCard)
- Stat cards: colored backgrounds (`bg-sky-50`, `bg-emerald-50`, `bg-amber-50`, `bg-red-50`), icon in white badge, label, bold value
- Grid: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` — 2 per row on mobile, compact `p-2.5 sm:p-4`
- Hover lift + shadow animation on stat widgets
- Bottom panels (checked-out items + location status): tighter spacing, smaller text on mobile

---

## [2026-07-16] — Pin Locations & Compact Mobile Grid

### Added
- `pinned?: boolean` field on `Location` type
- Pin/Unpin button on LocationCard (Pin icon, toggles fill)
- Pinned locations sorted to top of the grid
- Pin button 44px touch target, shows filled icon when pinned

### Changed
- Site names updated: مقر اللجنة, موكب كربلاء, موكب النجف, موكب سامرا
- LocationCard compact design: padding `p-2.5 sm:p-4`, smaller text on mobile, smaller icons
- Locations grid: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5` (2 boxes per row on mobile)
- Grid gap: `gap-2 sm:gap-3` for tighter mobile layout
- `initialLocations` — 2 locations pre-pinned (loc-1, loc-4)

### Build
- Build passes: 18.8 kB page / 106 kB first load

---

## [2026-07-16] — Mobile Responsive Overhaul

### Fixed
- **Header.tsx** — Search input no longer disappears on mobile (< 640px); full-screen search overlay on mobile; hamburger/site/bell buttons all 44px touch targets; site dropdown `w-56 sm:w-64`; header height `h-14 sm:h-16`
- **Sidebar.tsx** — Nav buttons `h-11` (44px) instead of `py-2.5` (~40px); added close (X) button inside mobile sidebar
- **SettingsView.tsx** — Tab labels always visible (removed `hidden sm:inline`); tabs `h-11` (44px)
- **LocationDetailView.tsx** — +/- buttons `w-11 h-11` (44px); action buttons `h-11`; filter tabs `h-10`; return button `h-11`; page padding `p-3 sm:p-6`; metadata row `flex-wrap`; title `text-xl sm:text-2xl`; truncation on name/label/site
- **LocationCard.tsx** — Added `truncate` to location name, label, site name; `min-w-0 flex-1` on text container
- **InventoryView.tsx** — Table cell padding `px-3 sm:px-5`; added `truncate` on item name and serial number
- **TransfersView.tsx** — Page padding `p-3 sm:p-6`; card padding `p-3 sm:p-5`; `flex-wrap` on header and direction rows; `truncate` on site names
- **DashboardView.tsx** — Page padding `p-3 sm:p-6`; panel padding `p-3 sm:p-4`; `flex-wrap` on header and item rows; `truncate` on item name and user name
- **ActivityLogView.tsx** — Log entry padding `px-3 sm:px-5`; filter buttons `h-9`; search input `h-10`; `truncate` on description/details/user name
- **UsersSettings.tsx** — Table cells `px-3 sm:px-5`; all buttons (edit/delete/close) 40-44px touch targets; submit/cancel `h-11`; role buttons `h-11`
- **SitesSettings.tsx** — Header `flex-wrap`; add/edit/delete buttons 44px; card padding `p-3`; truncation on site name
- **CategoriesSettings.tsx** — Header `flex-wrap`; all buttons 44px; serial toggle `w-12 h-12` (48px)
- **AddItemModal.tsx** — Header `px-4 sm:px-6`; body `p-4 sm:p-6`; close 44px; submit/cancel `h-11`
- **AddLocationModal.tsx** — Header `px-4 sm:px-6`; body `p-4 sm:p-6`; close 44px; type buttons `h-11`; submit/cancel `h-11`
- **TransferModal.tsx** — `max-w-md sm:max-w-lg`; header `px-4 sm:px-6`; body `p-4 sm:p-6`; close 44px; submit/cancel `h-11`

### Build
- Build passes: 18.4 kB page / 106 kB first load

---

## [2026-07-16] — Categories Management & Empty Fields

### Added
- `Category` type with `id, key, label, serialTracked` fields
- `defaultCategories` — 10 seed categories with Arabic labels and serial tracking flags
- `CategoriesSettings` — Full CRUD table for managing categories (key, name, serial tracked toggle)
- الفئات tab in SettingsView (Tag icon) with add/edit/delete
- Category activity types: `add_category`, `edit_category`, `delete_category`
- Dynamic categories passed through LocationsView → LocationDetailView → AddItemModal

### Changed
- `AddItemModal` — Uses dynamic categories from props instead of hardcoded list; removed `*` required markers; removed name submit validation (all fields optional)
- `LocationDetailView` — Passes `categories` to AddItemModal
- `LocationsView` — Accepts and passes `categories` prop
- `ActivityLogView` — Added `Tag` icon import, `add_category`/`edit_category`/`delete_category` icons and colors
- `types/index.ts` — Added `Category` interface, `defaultCategories`, 3 category activity types

### Build
- Build passes: 18 kB page / 105 kB first load

---

## [2026-07-16] — Settings & Activity Log

### Added
- `SettingsView` — Tabbed settings container with 3 tabs: المستخدمين / المواقع / سجل النشاطات
- `UsersSettings` — Full CRUD user management table with add/edit modal, role selection, active/inactive toggle
- `SitesSettings` — Site CRUD grid with add/edit modal and stats per site
- `ActivityLogView` — Searchable/filterable activity log sorted by newest first, with type badge and user avatar
- `User` type with `id, name, email, role (admin|technician|viewer), active`
- `ActivityLogEntry` type with `id, type, description, userId, userName, timestamp, details`
- `ACTIVITY_TYPE_LABELS` — Arabic labels for 11 activity types (checkout, return, transfer, add/edit/delete for items, locations, sites, users)
- Activity logging on all mutations: checkout, return, transfer, add item/location/site/user, edit/delete user/site
- `currentUser` prop in Header — displays logged-in user name next to avatar (resolved `User` name conflict with lucide-react icon by aliasing import to `UserIcon`)
- `initialUsers` — 4 seed users (أحمد محمد admin, سارة العلي technician, خالد الشمري technician, نورة الحربي viewer)
- `initialActivityLog` — 6 historical activity entries with realistic timestamps
- الإعدادات nav item in Sidebar (bottom-aligned with Shield icon)
- Settings view routing in page.tsx and view type union
- Auto-assign current user as recipient on checkout (no manual name prompt)
- `currentUser` prop threaded through LocationsView → LocationDetailView

### Changed
- `page.tsx` — Added `users`, `currentUser`, `activityLog` state; `logActivity()` wrapper for all mutations; settings view handling; passes `currentUser` to LocationsView
- `Sidebar.tsx` — Added الإعدادات nav item at bottom with top border separator
- `Header.tsx` — Added `currentUser` prop, displays user name text alongside avatar icon
- `LocationDetailView.tsx` — Removed `prompt()` for recipient name (uses `currentUser.name`); moved checked-out items panel (amber return banner) from above items table to below it
- `LocationsView.tsx` — Added `currentUser` prop, passes through to LocationDetailView

### Build
- Build passes: 17.1 kB page / 104 kB first load

---

## [2026-07-16]

### Added
- `docs/PROJECT_INFO.md` — Core project knowledge base (overview, tech stack, requirements, UX principles)
- `docs/ARCHITECTURE.md` — System architecture map (folder structure, component tree, data flow, RTL strategy)
- `docs/CHANGELOG.md` — This modification ledger (Keep-a-Changelog format)
- `"relocating"` status filter button in Box Management view
- Mobile hamburger menu button in Header (visible below `lg` breakpoint)
- Mobile sidebar overlay with backdrop blur and click-to-close
- `scrollbar-none` utility class in globals.css
- Cairo Arabic font loaded via `next/font/google` with `arabic` + `latin` subsets
- `onMenuToggle` callback prop in Header component

### Fixed
- **Sidebar collapse desync:** Removed duplicate `collapsed` state from Sidebar; lifted ownership to `page.tsx`. Sidebar now receives `collapsed`/`onToggle` as props. Main content margin (`mr-[68px] lg:mr-60`) reacts to parent state.
- **Missing relocating filter:** Added `"relocating"` to `StatusFilter` union type and filter button array in BoxManagementView.
- **RelocationsView static data:** Now receives live `boxes` prop from page.tsx (was receiving hardcoded reference).
- **BoxDetailView missing relocating status:** Status badge now uses lookup maps (`statusLabels`, `statusColors`) covering all four status values including `relocating`.

### Changed
- **Arabic RTL conversion (all files):** `<html dir="rtl" lang="ar">` on root layout. All directional Tailwind classes flipped: `left`↔`right`, `pl`↔`pr`, `ml`↔`mr`, `text-left`↔`text-right`. Sidebar fixed to right side (`right-0`). Bell notification dot moved to `left-1.5`.
- **All UI text → Arabic:** Dashboard (لوحة التحكم), Boxes (الصناديق), Inventory (المخزون), Relocations (النقل), all stat labels, filter buttons, empty states, action labels, search placeholder.
- **Mobile responsive layout:** Sidebar hidden below `lg`, toggled via hamburger. Stats grid: 1→2→4 cols. Box grid: 1→2→3→4 cols. Table horizontal scroll on small screens. All padding responsive (`p-4 sm:p-6`).
- **Sidebar:** Now accepts `mobileOpen`/`onMobileClose` props. Renders backdrop overlay on mobile. Collapse toggle hidden on mobile (`hidden lg:flex`). Transition uses `translate-x` for mobile show/hide.
- **Header:** Added `onMenuToggle` prop. Hamburger `<Menu>` icon button visible only below `lg`. Search placeholder in Arabic.
- **BoxCard:** RTL text alignment (`text-right`). Badge positioned on start side (left in RTL). Item count and type count swapped order.
- **BoxDetailView:** Back button uses `ArrowRight` icon (RTL-appropriate). Status badges use lookup maps. Filter labels in Arabic. Item return banner layout flipped for RTL.
- **InventoryView:** Table headers `text-right`. Removed unused `@/components/ui-table` import.
- **RelocationsView:** Route direction flipped (`toSite → fromSite` with `ArrowLeft`). All text in Arabic.
- **page.tsx:** Added `mobileMenuOpen` state. `onNavigate` closes mobile menu. Sidebar receives all new props.
- **globals.css:** Added `scrollbar-none` utility class.

## [2026-07-16 — Feature Expansion]

### Added
- **Site System** — New `Site` type and `initialSites` mock data (4 sites: HQ floors + committee warehouse). Header includes a site selector dropdown that filters all views by the selected site.
- **Location System** — New `Location` type replacing `Box`. Supports 5 types: box (صندوق), warehouse (مخزن), shelf (رف), room (غرفة), other (أخرى). Each location belongs to a site. 8 mock locations created.
- **Serial Number Tracking** — `InventoryItem` now has optional `serialNumber` field. `SERIAL_TRACKED_CATEGORIES` constant defines which categories require serial numbers (Laptop, Monitor, Printer, Docking Station). Serial-tracked items use individual +/- (checkout/return) instead of quantity controls. Serial numbers displayed as `IT-LAP-001` style badges in item rows and inventory table.
- **Transfer System** — New `Transfer` and `TransferItem` types. `TransferModal` component: select destination site + pick items with checkboxes → immediate transfer. `TransfersView` shows transfer history with date, route, and item list. 2 mock transfers included.
- **Add Location Modal** (`AddLocationModal.tsx`) — Create new storage locations via modal: name, type selector (grid buttons), site dropdown, optional description.
- **Add Item Modal** (`AddItemModal.tsx`) — Add items to any location: name, category dropdown (Arabic labels), serial number input (shown only for tracked categories), quantity input (for bulk items).
- **LocationCard** (`LocationCard.tsx`) — New card component with type icon/badge, location name, site, item count, progress bar.
- **LocationsView** (`LocationsView.tsx`) — Grid of LocationCards with type filters (all/boxes/warehouses/shelves/rooms), "إضافة مكان" button, drills into LocationDetailView.
- **LocationDetailView** (`LocationDetailView.tsx`) — Full item list with tracked/untracked item controls, serial number badges, "إضافة صنف" button, "نقل إلى موقع آخر" button, quick return banner.
- **TransferModal** (`TransferModal.tsx`) — Modal with destination site selector, item checklist with serial numbers, select all/none toggle, confirm button with count.
- `isSerialTracked()` helper function in types.
- `LOCATION_TYPE_LABELS` Arabic labels for location types.
- `CATEGORY_AR` Arabic category name mapping in AddItemModal.

### Changed
- **Data Model (complete rewrite):** `Box` → `Location` (with type field). `Relocation` → `Transfer` (immediate, not in-transit). `InventoryItem` gains `serialNumber`, `locationId`, `checkedOutBy`, `checkedOutDate`. Items tracked individually for serial-tracked categories, by quantity for bulk items.
- **Mock Data (complete rewrite):** 4 sites, 8 locations (mix of boxes, warehouse, shelf), 35 items with serial numbers on 8 expensive items. Items distributed across sites and locations realistically.
- **page.tsx (complete rewrite):** State now manages `sites`, `locations`, `items`, `transfers`. `selectedSiteId` state controls site filtering. New handlers: `handleUpdateItemQty`, `handleCheckoutItem`, `handleReturnItem`, `handleAddLocation`, `handleAddItem`, `handleTransferItems`. `filteredLocations` and `filteredItems` computed via `useMemo`.
- **Header:** Added site selector dropdown with all sites + "جميع المواقع" option. Uses click-outside detection. Shows current site name with MapPin icon.
- **Sidebar:** Nav items renamed: "الصناديق" → "الأماكن", "النقل" → "عمليات النقل". Icons updated (Package → MapPin for locations).
- **DashboardView:** Now receives `sites`, `locations`, `items`, `siteName`. Stats: "إجمالي الأماكن", "إجمالي العناصر", "المستلمة", "تنبيهات النقص". Checked-out items list shows serial numbers and `checkedOutBy`. Box health section replaced with location health progress bars.
- **InventoryView:** New columns: Serial Number (with Tag icon badge), Location, Site. Serial-tracked items show "متوفر"/"مستلم" instead of quantity. Hidden columns on mobile (`hidden sm:table-cell`, `hidden md:table-cell`, `hidden lg:table-cell`).
- **TransfersView (replaces RelocationsView):** Shows transfer history with from→to site route, date, item count badge, item chips with serial number icons.

### Removed
- `BoxCard.tsx` — Replaced by `LocationCard.tsx`
- `BoxManagementView.tsx` — Replaced by `LocationsView.tsx`
- `BoxDetailView.tsx` — Replaced by `LocationDetailView.tsx`
- `RelocationsView.tsx` — Replaced by `TransfersView.tsx`
- `Box` interface — Replaced by `Location`
- `Relocation` interface — Replaced by `Transfer`
