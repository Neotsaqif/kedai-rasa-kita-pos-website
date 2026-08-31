# Implementation Plan: Kedai Rasa Kita POS System

## Tech Stack & Architecture

| Layer                 | Technology                           | Rationale & Details                                                                                   |
| --------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| **Frontend**          | React (Vite) + Tailwind CSS + Recharts | SPA execution with modern luxury warm cream aesthetic (`cream-50`, `cream-100`, `brand-500`, `brand-900`), Playfair Display & Plus Jakarta Sans fonts |
| **Backend & DB**      | Supabase (PostgreSQL + Auth + RLS)   | Managed database, real-time sync, built-in Auth, Row Level Security (RLS) policies                    |
| **Atomic Operations** | PostgreSQL Stored Procedures (RPC)   | `process_checkout` RPC function guarantees atomic transaction creation + stock decrement              |
| **Analytics/Charts**  | Recharts                             | Responsive SVG charts (BarChart & PieChart) for revenue trends and payment breakdowns                 |
| **Auth & Security**   | Supabase Auth (JWT + RLS)            | Role-based permissions (`admin` vs `cashier`) enforced directly at database level                     |
| **Receipt Printing**  | Thermal Printer CSS (`@media print`) | Native browser printing for 80mm thermal receipt format                                               |
| **Hosting**           | Vercel / Netlify + Supabase Cloud    | Free/cheap tier deployment accessible from store tablet/laptop and owner's home                       |
| **Backups**           | Supabase Cloud Daily Backups         | Automated Point-in-Time recovery & daily database snapshots                                           |

---

## Detailed Database Schema

```
+------------------+       +------------------+       +------------------+
|     profiles     |       |    categories    |       |     products     |
+------------------+       +------------------+       +------------------+
| id (UUID, PK)    |<-----+| id (PK)          |<-----+| id (PK)          |
| name             |       | name             |       | sku (UNIQUE)     |
| role             |       +------------------+       | name             |
| is_active        |                                  | category_id (FK) |
+------------------+                                  | price            |
         ^                                            | stock_qty        |
         |                                            | is_active        |
         |                                            +------------------+
         |                                                     ^
+------------------+       +------------------+                |
|   transactions   |       |transaction_items |                |
+------------------+       +------------------+                |
| id (PK)          |<-----+| id (PK)          |                |
| receipt_number   |       | transaction_idFK |                |
| cashier_id (FK)  |       | product_id (FK)  |----------------+
| total_amount     |       | product_name     |
| payment_method   |       | quantity         |       +------------------+
| status           |       | price_at_sale    |       |    stock_logs    |
| created_at       |       +------------------+       +------------------+
+------------------+                                  | id (PK)          |
                                                      | product_id (FK)  |
                                                      | quantity_change  |
                                                      | reason           |
                                                      | created_at       |
                                                      +------------------+
```

---

## UI Design System (Modernized)

### Brand & Visual Direction

- **Vibe:** Modern, elegant, high-end cafe & kitchen aesthetic
- **Color Palette:**
  - Base: soft cream (`#fcfbf7`, `#f7f4ed`)
  - Primary / Accent: deep olive brown (`#5A5A40`, hover `#2d2d2d`)
  - Text & Headers: rich dark (`#2d2d2d`)
  - Status: emerald green (active/completed), rose/burgundy (refunded/out of stock), amber (low stock)
- **Typography:**
  - Headings: *Playfair Display* (serif luxury typeface)
  - Body & Microcopy: *Plus Jakarta Sans* (modern, legible sans-serif)
- **Icons:** Lucide React

### Screens & Components Implemented

| #   | Screen            | File                                 | Key Features                                                                                                                                            |
| --- | ----------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Login             | `src/components/LoginScreen.jsx`     | Full-page layout, custom input fields, email + password auth, demo login option                                                                         |
| 2   | POS / Kasir       | `src/components/POSScreen.jsx`       | Split grid layout: category pills + search + product card grid w/ stock badges; cart drawer w/ quick cash buttons & checkout modal                       |
| 3   | Receipt Modal     | `src/components/ReceiptModal.jsx`    | Thermal paper receipt preview, receipt no., itemized breakdown, printable styling                                                                       |
| 4   | Dashboard         | `src/components/Dashboard.jsx`       | Recharts daily sales bar chart, payment method pie chart, metric cards, stock audit log table                                                            |
| 5   | Produk            | `src/components/ProductManager.jsx`  | Table view (SKU, Nama, Kategori, Harga, Stok, Status), search & status filter, Add/Edit modal, manual stock adjustment with log note                     |
| 6   | Kategori          | `src/components/CategoryManager.jsx` | Category card grid with product count badges, Add/Edit/Delete modals                                                                                    |
| 7   | Riwayat Penjualan | `src/components/SalesHistory.jsx`    | Filterable transaction table, status badges, detailed view modal, refund request & admin approval actions                                              |
| 8   | Akun Kasir        | `src/components/StaffAccounts.jsx`   | User card grid (Admin/Cashier badges), active toggle, Create Cashier modal                                                                             |
