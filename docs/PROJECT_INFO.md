# PROJECT_INFO.md — IT Inventory Management Dashboard

## Overview

**Project Name:** IT Inventory Dashboard  
**Tagline:** Frictionless IT equipment management for high-pressure work environments.

A single-page web application designed for IT teams to manage physical equipment boxes across multiple sites. The core UX philosophy is **minimal clicks** — checking items in and out must be instant, with no complex forms.

## Target Users

- IT technicians managing equipment across office floors and remote sites
- Warehouse / logistics staff tracking box contents during relocations
- Site managers needing quick visibility into equipment availability

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI Library | React 18 |
| Styling | Tailwind CSS 3.4 |
| Icons | lucide-react |
| Language | TypeScript 5 |
| State | React hooks (useState, useCallback) |

## Core Functional Requirements

### 1. Box Management
- Grid view of numbered equipment boxes with color-coded status (full / partial / empty / relocating)
- Each box contains categorized inventory items (Laptops, Keyboards, Cables, etc.)
- Status auto-calculated from item quantities

### 2. Quick Check-In / Check-Out
- Inside any box, items display `[-] qty [+]` inline controls
- Pressing `-` instantly checks out one unit (moves it to a visual "Checked Out" section)
- Pressing `+` on a checked-out item instantly returns it
- No forms, no confirmations — one tap does the job

### 3. Global Search
- Header search bar filters boxes and items in real-time
- Searches across box labels, item names, categories, and sites

### 4. Dashboard
- Summary stat cards: Total Boxes, Ready Boxes, Checked-Out Items, Low Stock Alerts
- Active checkouts list
- Box health progress bars

### 5. Relocations
- Track box movements between sites (pending / in-transit / completed)
- Visual route display with from/to sites

### 6. Full Inventory Table
- Flat table view of every item across all boxes
- Filterable via global search

## UX Principles

- **Zero-friction interactions** — Every action is one tap/click
- **Instant feedback** — Quantities update immediately, no loading states
- **Visual status indicators** — Color coding at every level (boxes, items, badges)
- **Arabic-first RTL layout** — Full right-to-left support for Arabic-speaking users
- **Mobile-friendly** — Responsive layout with hamburger navigation on small screens
