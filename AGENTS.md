# AGENTS.md — IT Inventory Dashboard

## Quick Commands

```bash
npm run dev        # Start dev server (localhost:3000)
npm run build      # Production build (used to verify changes)
npm run lint       # ESLint via Next.js
```

No test suite. Verify changes with `npm run build` — it runs type checking and linting.

## Architecture

Single-page Arabic RTL app. All routing is in `src/app/page.tsx` using conditional view rendering (no Next.js file-based routing for pages).

**Key flow:** `layout.tsx` → `Providers.tsx` (AuthProvider + DataProvider) → `page.tsx` (auth gate + view router)

**Views:** `dashboard | warehouse | boxes | visits | completed-visits | users | categories-settings | activity-log | developer`

**Role system (4 roles):**
- `developer` — full access + developer page (المطور)
- `admin` — all pages except developer
- `member` — dashboard, warehouse, boxes, visits, completed-visits
- `viewer` — warehouse + boxes (read-only)

## Critical Conventions

### Firebase / Firestore
- Firebase SDK 12.16.0 with `initializeFirestore` + `persistentLocalCache()` (NOT the deprecated `enableIndexedDbPersistence`)
- Try/catch in `src/lib/firebase.ts` handles hot-reload double-init
- All data uses real-time `onSnapshot` listeners — never read Firestore directly, always subscribe
- Client-generated document IDs (not auto-generated)
- `.env.local` has Firebase credentials (not committed, in `.gitignore`)

### RTL Layout
- `<html dir="rtl" lang="ar">` at root
- Sidebar fixed to RIGHT: `right-0`, main content margin: `mr-[68px] lg:mr-60`
- All directional classes are RTL-native (Tailwind `rtl:` not needed)
- Cairo font loaded from Google Fonts

### User Roles
- Only the `developer` role can assign `developer` role to others (admin cannot)
- Role-based view access enforced in `ROLE_ALLOWED_VIEWS` in `page.tsx`
- Sidebar nav items filtered by `roles: UserRole[]` array

### Visit Lifecycle (4 states)
`inactive` → `active` → `collecting` → `completed` → (reactivate back to inactive)

### Data Model Gotchas
- `WarehouseItem.totalQty` (NOT `qty`) — the quantity field for warehouse items
- `BoxItem.qty` + `BoxItem.originalQty` — current and original quantities
- `BoxItem.status`: `"returned" | "consumed" | "missing"` — only set during collection
- Consumable items (Cable, Label): don't need return, default to 0 in collection
- Serial-tracked categories: Laptop, Monitor, Printer, Docking Station

### Seed Data
- `src/data/mockData.ts` has empty warehouse/visits/activity arrays (seed data cleared)
- Only user: `abnmazin` / PIN `077077` / role `developer`
- `seedFirestoreIfNeeded()` seeds users + categories only
- `resetFirestore()` exposed on `window.__resetFirestore` via `Providers.tsx` — clears all collections and re-seeds

### Developer Page
- Only visible to `developer` role in sidebar
- Full reset + per-section delete (warehouse/visits/activity/categories/users-extra)
- Uses dynamic imports for Firestore operations

## File Map

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | SPA router, auth gate, all view rendering |
| `src/contexts/DataContext.tsx` | All Firestore handlers and state |
| `src/contexts/AuthContext.tsx` | Login/logout, localStorage session |
| `src/lib/firestore.ts` | Firestore CRUD + subscribe functions |
| `src/lib/firebase.ts` | Firebase init + offline persistence |
| `src/types/index.ts` | All types, constants, role labels |
| `src/data/mockData.ts` | Seed data (mostly empty now) |
| `src/components/Providers.tsx` | Auth + Data context wrappers |
