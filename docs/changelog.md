# Changelog

All notable changes to the Kedai Rasa Kita POS System project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added — Checkout confirmation & empty-state POS

- **New `src/components/ConfirmTransactionModal.jsx`** — reusable confirmation dialog (warning header, summary details, Cancel/Confirm) shown before a sale is processed.
- **`POSScreen.jsx`** — the Checkout button now opens a confirmation popup ("Apakah Anda yakin ingin melanjutkan transaksi ini?") instead of processing immediately; transaction only runs on "Ya, Lanjutkan". Shows item count, payment method, and total in the dialog.
- **`POSScreen.jsx`** — removed the hardcoded mock `sampleProducts` fallback. When no products exist, the catalog now shows a "Tidak ada produk." empty state instead of fake data.

### Added — Product delete (+ image cleanup)

- **Backend `delete_product` action** (`backend/api/index.php`): validates the ID, deletes the row, and safely removes the product's uploaded image file from `backend/uploads/` (best-effort cleanup with path-traversal protection via `basename` + `realpath` checks).
- **`src/lib/mysql.js` / `src/lib/data.js`** — added `deleteProduct(id)` gateway (MySQL REST call + Supabase `.delete()`).
- **`ProductManager.jsx`** — added a trash "Hapus Produk" button per row with a `window.confirm` confirmation before deletion, then refresh.

### Changed — Image input hidden (file upload only)

- **`ProductManager.jsx`** — removed the raw "URL Gambar (Opsional)" text input from the Add/Edit product modal. Images are now set only via the "Unggah file" upload control (with an in-progress spinner). The stored `image_url` is still used internally to render thumbnails without exposing it as editable text.

### Fixed — Backend validation & stock integrity (found via API testing)

- **`create_product` / `update_product`** now reject **negative price** and **negative stock** (previously negative values silently created invalid rows).
- **`adjust_stock`** rewritten for correctness:
  - Computes the new stock **atomically from `change_qty`** (current stock + delta with `SELECT ... FOR UPDATE`), so a missing/inconsistent `new_stock` can no longer silently zero stock.
  - Rejects a resulting **negative stock**.
  - Rejects an **empty reason** (audit integrity).
  - Returns the new `stock_qty` and uses the DB product name when `product_name` isn't sent.

### Added — Demo seed (`backend/sql/seed_demo.php`)

- Runnable seed that inserts **12 realistic `DEMO-` products**, **20 sales spread across 7 distinct days** (relative to today), matching **sale line items**, and **stock logs** — fully populating the Dashboard, Sales History, Reports, and the stock audit trail. Guarded against double insertion (deleting the `DEMO-` products first allows a re-seed).

### Added — Switchable MySQL backend (local XAMPP)

- Introduced a **dual-backend** architecture. The React app still talks through a single
  gateway (`src/lib/data.js`) that dispatches to either **Supabase** (unchanged, via
  `src/lib/supabase.js`, RLS + `process_checkout` RPC) or a new **MySQL** backend based on
  the `VITE_DB_BACKEND` flag.
- **New `backend/` directory** (PHP/PDO):
  - `backend/config.php` — DB credentials + JSON/CORS helpers.
  - `backend/api/index.php` — single-entry REST API (login/logout, staff, products,
    categories, sales/checkout, refunds, stock logs).
  - `backend/sql/schema.sql` — MySQL DDL for `users`, `categories`, `products`, `sales`,
    `sale_items`, `stock_logs`.
  - `backend/sql/seed.php` — seeds default admin/cashier accounts with bcrypt hashes.
- **New frontend layer:** `src/lib/mysql.js` (REST client + client-side session) and
  `src/lib/data.js` (switchable gateway). All components now use the gateway instead of
  calling Supabase directly.
- **Config:** `vite.config.js` gains a dev proxy for `/api`; `.env` / `.env.example` now
  document `VITE_DB_BACKEND` and `VITE_API_BASE_URL`.
- **Choose backend via one flag:** `VITE_DB_BACKEND=mysql` (default) or `=supabase`.

### Changed — Default accounts

Updated the seeded default accounts (both `backend/sql/seed.php` and
`supabase/seed_users.sql`) to align with the demo quick-login buttons on the login screen:

- Admin: `admin@rasakita.id` / `password123`
- Cashier: `kasir@rasakita.id` / `password123`

Docs (`README.md`, `docs/implementation-plan.md`, `.env.example`) updated accordingly.

### Added & Modernized — UI Frontend Redesign (Ported from /frontend-example)

- **Design System & Typography:**
  - Modernized color palette in `tailwind.config.js` with `cream-50` (`#fcfbf7`), `cream-100` (`#f7f4ed`), `cream-200` (`#e6e1d7`), `brand-500` (`#5A5A40`), `brand-900` (`#2d2d2d`).
  - Added *Playfair Display* (serif header) and *Plus Jakarta Sans* (sans-serif body) fonts via Google Fonts in `src/index.css`.
  - Added specialized custom scrollbars and thermal paper receipt print styling.
- **Analytics & Visualization:**
  - Installed `recharts` package for interactive SVG charting.
  - Built `Dashboard.jsx` featuring responsive BarChart (daily revenue trends) and PieChart (payment method distribution), metric cards, and stock audit logs table.
- **Screen & Component Modernization:**
  - `LoginScreen.jsx` — Redesigned with sleek branding, modern typography, and demo account shortcuts.
  - `POSScreen.jsx` — Redesigned grid catalog with category tabs, search input, quick cash buttons, payment pills, and full cart checkout drawer.
  - `ProductManager.jsx` — Redesigned table view with status filters, manual stock adjustment modal with audit log notes, and add/edit forms.
  - `CategoryManager.jsx` — Redesigned category cards with registered product counts and modal management.
  - `SalesHistory.jsx` — Redesigned filterable sales history table with status badges, transaction details modal, and refund approval workflow.
  - `StaffAccounts.jsx` — Redesigned user cards displaying role badges and active/inactive toggles.
  - `ReceiptModal.jsx` — Redesigned thermal paper receipt modal with print and new transaction triggers.
- **Documentation Updates:**
  - Updated `docs/implementation-plan.md` to document new design tokens, Recharts integration, and database mapping.
  - Updated `docs/changelog.md` to reflect all UI modernization tasks completed.
