# Implementation Plan: Kedai Rasa Kita POS System

A living build plan for the Kedai Rasa Kita point-of-sale system — a small F&B shop with an
owner (admin) and cashiers. It consolidates the technical architecture, the feature scope
from `docs/project-brief.md`, and a **Week 1–4 build roadmap** with live status.

---

## 1. Overview

| Item        | Detail                                                        |
| ----------- | ------------------------------------------------------------- |
| **Product** | Point-of-sale (POS) system for sales, stock, products, reporting |
| **Users**   | Owner (admin) + cashiers                                      |
| **Timeline**| 4 weeks                                                       |
| **Budget**  | ~$750                                                         |
| **Workflow**| `Login → Sell → Payment → Checkout → Stock update → Receipt → History` |

The goal is to replace the shop's Excel / handwritten tracking with a reliable POS used
daily by cashiers, and managed remotely by the owner.

---

## 2. Goals & Scope (V1)

**Core features (required, V1):**
1. Login for admin and cashiers (role-based access)
2. POS / cashier screen for processing sales
3. Product / menu management (admin only)
4. Stock tracking, incl. automatic deduction on sale
5. Payment recording — Cash, QRIS, Debit Card, Bank Transfer (record-only, **no payment gateway**)
6. Receipt printing (80mm thermal)
7. Sales history and reports (admin)
8. Role-based permissions

**Deferred / optional (future):** discounts & promos, customer records, low-stock
notifications, expense tracking, period-comparison reports, supplier management.

---

## 3. Roles & Permissions

| Permission                              | Admin (Owner) | Cashier |
| --------------------------------------- | :-----------: | :-----: |
| Process sales (POS)                     | ✅             | ✅       |
| View own transaction history            | ✅             | ✅       |
| View all transactions / reports         | ✅             | ❌       |
| Manage products, prices, stock          | ✅             | ❌       |
| Manage categories                       | ✅             | ❌       |
| Manage cashier accounts (create/deactivate) | ✅          | ❌       |
| Approve refunds                         | ✅             | ❌       |
| Edit product stock / prices             | ✅             | ❌       |

> Business rules enforced: cashiers cannot edit prices or stock, cannot view reports, and
> see only their own history. Refunds/cancellations require **admin approval**. Every
> transaction records the handling cashier.

---

## 4. Tech Stack & Architecture

| Layer                 | Technology                           | Rationale & Details                                                                                   |
| --------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| **Frontend**          | React (Vite) + Tailwind CSS + Recharts | SPA with a modern warm-cream, luxury cafe aesthetic; Playfair Display + Plus Jakarta Sans fonts |
| **Backend & DB**      | **Switchable dual backend** — Primary: **MySQL (XAMPP)** via PHP/PDO REST API; Alternative: **Supabase** (PostgreSQL + Auth + RLS) | Controlled by `VITE_DB_BACKEND` (`mysql` default / `supabase`); all reads/writes go through the `src/lib/data.js` gateway |
| **Atomic Operations** | MySQL: PHP/PDO transaction in `process_checkout`; Supabase: `process_checkout` RPC | Atomic sale creation + stock decrement across both backends |
| **Analytics/Charts**  | Recharts                             | Responsive SVG bar & pie charts (revenue trends, payment breakdown) |
| **Auth & Security**   | MySQL: `password_hash`/`password_verify` (bcrypt); Supabase: JWT + RLS | Role-based `admin` vs `cashier` — enforced in-app for MySQL, at DB level for Supabase |
| **Receipt Printing**  | Thermal Printer CSS (`@media print`) | 80mm thermal receipt format                         |
| **Hosting**           | Vercel / Netlify + XAMPP/Apache (MySQL) or Supabase Cloud | Accessible from store tablet/laptop and owner's home |
| **Backups**           | MySQL: phpMyAdmin export / mysqldump; Supabase: daily backups | Point-in-time recovery & scheduled snapshots |

### Backend Switcher: Supabase ⇄ MySQL (XAMPP)

The app originally talked **directly to Supabase** from the browser. Because a browser cannot
connect to MySQL directly, the app now ships **two backends** that share one frontend. All data
access flows through a single gateway:

```
React components
      │
      ▼
src/lib/data.js  (single gateway — reads VITE_DB_BACKEND)
      │
      ├── VITE_DB_BACKEND="mysql"    ──►  backend/api/index.php (PHP/PDO)  ──►  MySQL
      └── VITE_DB_BACKEND="supabase" ──►  src/lib/supabase.js (+ RLS/RPC)  ──►  Supabase Cloud
```

**How to switch backends:** edit `.env`, set `VITE_DB_BACKEND=mysql` (default) **or**
`VITE_DB_BACKEND=supabase` (for MySQL also ensure `VITE_API_BASE_URL` points at
`backend/api/index.php`), then restart `npm run dev` and refresh. No app-code changes are
needed — the Supabase client, RLS policies, and `process_checkout` RPC remain intact under
`src/lib/supabase.js` and `supabase/*`.

**Key files (MySQL backend):**

| File                    | Purpose                                                              |
| ----------------------- | -------------------------------------------------------------------- |
| `src/lib/supabase.js`   | Supabase client (kept intact — used only when `VITE_DB_BACKEND=supabase`) |
| `src/lib/mysql.js`      | REST client for the PHP API (session persistence + typed endpoints)  |
| `src/lib/data.js`       | **Gateway** — dispatches every read/write to MySQL or Supabase and normalises shapes |
| `backend/config.php`    | DB credentials (defaults: `127.0.0.1` / `root` / empty pass / db `kedai_rasa_kita`) + CORS/JSON helpers |
| `backend/api/index.php` | Single-entry REST router (login, products, categories, sales, refunds, stock logs, staff) |
| `backend/sql/schema.sql`| MySQL DDL (create DB + 6 tables)                                      |
| `backend/sql/seed.php`  | Seeds the two testing accounts with bcrypt hashes                     |

---

## 5. Data Model (MySQL)

DDL lives in `backend/sql/schema.sql`. This mirrors the Supabase/PostgreSQL model with MySQL
conventions; the exact column names returned to the frontend are shown below.

| Table          | Key columns                                                                                     | Notes                                                              |
| -------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `users`        | `id` (VARCHAR(36) UUID string, PK), `email` (UNIQUE), `password_hash`, `name`, `role` (`admin`/`cashier`), `is_active` | replaces Supabase `auth.users` + `profiles` |
| `categories`   | `id` (auto-inc INT, PK), `name` (UNIQUE)                                                       |                                                                    |
| `products`     | `id` (PK), `sku` (UNIQUE), `name`, `category_id` (FK→`categories`), `price`, `stock_qty`, `image_url`, `is_active` | rendered with nested `categories.name` |
| `sales`        | `id` (PK), `receipt_number` (UNIQUE), `cashier_id` (FK→`users`), `total_amount`, `payment_method`, `status`, `notes`, `created_at` | status: `completed`/`cancelled`/`refund_requested`/`refunded` |
| `sale_items`   | `id` (PK), `sale_id` (FK→`sales`), `product_id`, `product_name`, `qty`, `price_at_sale`         | returned to UI as `transaction_items`                               |
| `stock_logs`   | `id` (PK), `product_id`, `product_name`, `change_qty`, `reason`, `user_name`, `note`, `created_at` | `change_qty` aliased to `quantity_change` in the API |

> The two enum-ish fields (`payment_method`, sales `status`) are validated in the PHP layer for
> MySQL; Supabase enforces them at the DB. Both backends accept the same methods (`cash`,
> `qris`, `debit`, `transfer`) and statuses.

---

## 6. Screens & Components

| #   | Screen            | File                                  | Key Features                                                                                                                          |
| --- | ----------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Login             | `src/components/LoginScreen.jsx`      | Full-page layout, custom inputs, email + password auth, demo login option                                                      |
| 2   | POS / Kasir       | `src/components/POSScreen.jsx`        | Category pills + search + product cards w/ stock badges; cart drawer w/ quick cash buttons, confirmation popup & checkout |
| 3   | Receipt Modal     | `src/components/ReceiptModal.jsx`     | Thermal paper preview, receipt no., itemized breakdown, print styling                                                              |
| 4   | Dashboard         | `src/components/Dashboard.jsx`        | Recharts daily sales bar + payment-method pie, metric cards, stock audit table                                                       |
| 5   | Produk            | `src/components/ProductManager.jsx`   | Table (SKU/Nama/Kategori/Harga/Stok/Status), search & filters, Add/Edit modal (file-upload image only), stock adjustment w/ log note, delete product |
| 6   | Kategori          | `src/components/CategoryManager.jsx`  | Category card grid with product counts, Add/Edit/Delete modals                                                                       |
| 7   | Riwayat Penjualan | `src/components/SalesHistory.jsx`     | Filterable table, status badges, detail modal, refund request & admin approval                                                      |
| 8   | Akun Kasir        | `src/components/StaffAccounts.jsx`    | User card grid (role badges), active toggle, Create Cashier modal                                                                    |

---

## 7. REST API (MySQL backend)

All calls are `POST` to `backend/api/index.php?action=<name>` with a JSON body.

| Action                       | Purpose                                                |
| ---------------------------- | ------------------------------------------------------ |
| `login` / `logout`           | Authenticate staff (bcrypt) / clear client session     |
| `get_profiles`               | List staff accounts                                    |
| `create_cashier`             | Create a cashier user                                  |
| `toggle_user_active`         | Enable / disable a staff account                       |
| `get_products`               | Products joined with category                          |
| `create_product`/`update_product` | Add / edit a product                               |
| `toggle_product_active`      | Activate / deactivate a product                        |
| `delete_product`             | Delete a product (+ remove its uploaded image file)    |
| `adjust_stock`               | Change stock + write an audit log (transactional)      |
| `get_categories` / `create_category` / `update_category` / `delete_category` | Category CRUD |
| `get_sales`                  | Sales with nested `transaction_items`                  |
| `process_checkout`           | Atomic sale + items + stock decrement + stock log      |
| `request_refund` / `approve_refund` | Set sale status to `refund_requested` / `refunded` |
| `get_stock_logs`             | Stock audit trail                                      |

---

## 8. Build Phases (Timeline)

### Week 1 — Foundation & Data Layer ✅ Done
- [x] Project scaffolding: React (Vite) + Tailwind + routing / auth shell
- [x] Data layer & auth via **Supabase** (auth.users + profiles, RLS policies)
- [x] Database schema (categories, products, sales, sale_items, stock_logs) + `process_checkout` RPC
- [x] Product & category management (CRUD)
- [x] Seed users & environment config

### Week 2 — UI Design System & POS Flow ✅ Done
- [x] Warm-cream / deep-olive design system, Playfair + Plus Jakarta Sans fonts
- [x] Login screen with demo quick-login buttons
- [x] POS / Kasir screen: category tabs, search, stock badges, cart, payment pills
- [x] `process_checkout`: atomic sale + auto stock decrement + stock log
- [x] 80mm thermal receipt printing (`ReceiptModal`)

### Week 3 — History, Reports & Staff ✅ Done
- [x] Sales history (`Riwayat`) with filters; cashier sees only own transactions
- [x] Dashboard + reports (Recharts bar/pie, metric cards)
- [x] Stock audit trail table
- [x] Staff accounts (`Akun Kasir`) — create cashier, active/inactive toggle
- [x] Refund request + admin approval workflow
- [x] **Switchable backend (Supabase ⇄ MySQL)**: PHP/PDO REST API (`backend/`), `src/lib/data.js` gateway, `VITE_DB_BACKEND` flag
- [x] MySQL (XAMPP) database + tables created and validated; default accounts seeded

### Week 4 — Deployment & Delivery ⏳ In Progress
- [x] **Initial product/menu data import + demo data** — `backend/sql/seed_demo.php` seeds 12 `DEMO-` products, 20 sales across 7 days, line items & stock logs (re-seedable after deleting `DEMO-` products)
- [x] **Product image upload feature** (local file upload support; raw image-URL input hidden in favour of uploads)
- [x] **Product delete** (`delete_product` action also removes the uploaded image file) + **checkout confirmation popup**
- [x] **Backend hardening (found via API testing):** negative price/stock rejected; `adjust_stock` recomputes stock from `change_qty`, forbids negative stock & empty reason
- [ ] **Hosting / deployment** — accessible from store and home (Vercel/Netlify frontend + hosted backend; note: local-MySQL path is local-only — the hosted path uses Supabase)
- [ ] Backups confirmed (MySQL export/mysqldump or Supabase daily backups)
- [ ] Client review pass + agreed revisions (2 rounds included in scope)
- [ ] Final sign-off / Definition of Done met

---

## 9. Security & Backups

- **MySQL path:** local MySQL has **no server-side JWT/RLS**. After `login` the user object is
  kept in `localStorage`; staff/role filters are enforced in the API and app. This is fine for a
  trusted **local POS**, but **not** for public/hosted deployments — for those, prefer
  `VITE_DB_BACKEND=supabase`, whose RLS policies already enforce admin-vs-cashier access at the
  database.
- **Backups:** MySQL via phpMyAdmin export / `mysqldump`; Supabase via daily snapshots. Backups
  are critical (no data loss allowed).

---

## 10. Setup & Run Guide

Run with local MySQL + XAMPP:

1. Start **Apache** + **MySQL** in XAMPP.
2. Import `backend/sql/schema.sql` (phpMyAdmin or `mysql` CLI) to create the `kedai_rasa_kita` DB.
3. Run `backend/sql/seed.php` once to create the default accounts.
4. *(Optional)* Run `backend/sql/seed_demo.php` to populate 12 `DEMO-` products, 20 sales across 7 days, line items & stock logs.
5. Check `.env`: `VITE_DB_BACKEND=mysql` and `VITE_API_BASE_URL` points at `backend/api/index.php`.
6. `npm install` then `npm run dev`; open the printed URL.

**Switch back to Supabase any time:** set `VITE_DB_BACKEND=supabase` in `.env` and restart the
dev server. (For Supabase you must first run `supabase/schema.sql` and `supabase/seed_users.sql`.)

**Default accounts:**

| Peran (_Role_)      | Email               | Password      | Akses Menu                                                       |
| ------------------- | ------------------- | ------------- | ---------------------------------------------------------------- |
| **Admin (Owner)**   | `admin@rasakita.id` | `password123` | Kasir, Riwayat, Dashboard, Produk, Kategori, Laporan, Akun Kasir |
| **Cashier (Kasir)** | `kasir@rasakita.id` | `password123` | Kasir, Riwayat (hanya transaksi sendiri)                         |

> 💡 These match the **demo login buttons** on the Login screen.

---

## 11. Definition of Done & Testing

**Definition of Done** (from `docs/project-brief.md`):
- All agreed V1 features working correctly
- Cashiers can run daily sales without major issues
- Admin can manage products, stock, staff, and reports
- Receipts and payment recording work correctly
- System accessible from store and home
- Initial product data imported
- Agreed revisions completed
- No blocking bugs

**Testing:** see `docs/test-checklist.md` — the system checklist (foundation, data layer, auth,
CRUD, UI, POS, receipt, sales history, dashboard, staff accounts, stock adjustment).

---

## 12. Current Status

- **Timeline:** 4 weeks
- **Budget:** ~$750
- **Build:** Week 1–3 **complete**; Week 4 (deployment & delivery) **in progress**
- **Backend:** MySQL (XAMPP) active; Supabase switchable via `VITE_DB_BACKEND`
- **Database:** `kedai_rasa_kita` created and seeded (admin + cashier + demo data via `backend/sql/seed_demo.php`)
- **Open items:** hosting/deployment, backup confirmation, client review revisions, sign-off