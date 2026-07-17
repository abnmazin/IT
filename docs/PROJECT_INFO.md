# PROJECT_INFO.md — IT Inventory Management Dashboard

## Overview

**Project Name:** IT Inventory Dashboard  
**Tagline:** Frictionless IT equipment management for high-pressure work environments.

A single-page web application designed for IT teams to manage physical equipment for events/visits. The core UX philosophy is **minimal clicks** — filling boxes and returning items must be instant, with no complex forms.

## Target Users

- IT technicians managing equipment across events and visits
- Warehouse / logistics staff tracking item deployment and return
- Site managers needing quick visibility into equipment availability

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI Library | React 18 |
| Styling | Tailwind CSS 3.4 |
| Icons | lucide-react |
| Language | TypeScript 5 |
| State | React hooks (useState, useCallback, useMemo) |

## Core Functional Requirements

### 1. Warehouse Management
- Grid card layout of all warehouse items with consumable/serial badges
- Search + category filter for quick item lookup
- Add/edit/delete items inline (all fields optional)
- Add/edit/delete categories with consumable and serial-tracked flags
- Serial-tracked items: Laptop, Monitor, Printer, Docking Station
- Consumable items: Cable, Label (don't need return)

### 2. Visit System (Template-Based)
- Visits are templates that can be reactivated multiple times
- **4-state lifecycle**: inactive → active → collecting → completed
- **Activation**: Confirmation dialog with year + hijri date input
- **Filling**: Pull items from warehouse into visit boxes (qty decreases)
- **Collecting**: Return items from boxes back to warehouse (partial returns supported)
- **Completed**: Moves to archive, template stays for re-use
- Consumables default to 0 on return; non-consumables default to full qty

### 3. Boxes Page (Display-Only)
- Shows only active visit's boxes
- Fixed reference qty under item name
- +/- controls adjustable between 0 and reference qty
- No fill/return/delete (editing done from visits page)
- "لا توجد زيارة مفعلة" message when no active visit

### 4. Dashboard
- Summary stat cards: warehouse items, items in visits, active visits
- Stacked bar chart comparing completed visits (returned/consumed/missing)
- Recent activity feed (last 5 entries)

### 5. Completed Visits Archive
- Expandable cards per completed visit with full detail
- Per-box breakdown showing returned/consumed/missing items
- Reset button to reactivate template

### 6. Visit Reports
- Full comparison report per box with statuses
- Summary: total deployed/returned/consumed/missing

### 7. Activity Log
- Date picker filter (any day)
- Type filters: Today/Visits/Checkout/Return/Add/Edit/Delete
- Visit filter: all visits (active + completed)
- Per-visit activity log in VisitDetailView

## UX Principles

- **Zero-friction interactions** — Every action is one tap/click
- **Instant feedback** — Quantities update immediately, no loading states
- **Visual status indicators** — Color coding at every level (boxes, items, badges)
- **Arabic-first RTL layout** — Full right-to-left support for Arabic-speaking users
- **Mobile-friendly** — Responsive layout with hamburger navigation, 40-44px touch targets
- **All fields optional** — No required fields when adding items
- **Consumable awareness** — Items flagged as consumable don't require return tracking
