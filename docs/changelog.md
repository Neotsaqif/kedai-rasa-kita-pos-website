# Changelog

All notable changes to the Kedai Rasa Kita POS System project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Completed **Week 1 — Foundation & Auth Infrastructure**:
  - Successfully deployed `supabase/schema.sql` database schema to Supabase Cloud with RLS policies, `process_checkout` RPC function, and `handle_new_user` auth trigger.
  - Implemented Supabase Auth & role checking (`admin` / `cashier`) in `src/context/AuthContext.jsx`.
  - Built custom Login Screen component (`src/components/LoginScreen.jsx`).
  - Implemented Admin Category CRUD interface (`src/components/CategoryManager.jsx`).
  - Implemented Admin Product & Inventory CRUD interface with category filters (`src/components/ProductManager.jsx`).
  - Integrated role-restricted menu and real product data fetching in `src/App.jsx`.
  - Configured user seeding SQL script with automatic profile creation and password hashing.
  - Completed system test checklist (`docs/test-checklist.md`).
- Initialized React single-page application using Vite.
- Configured Tailwind CSS with custom theme colors (`cream-50`, `cream-100`, `cream-200`, `brand-500`, `brand-900`) for Kedai Rasa Kita branding.
- Added Supabase JS SDK (`@supabase/supabase-js`) and client configuration (`src/lib/supabase.js`).
- Created complete Supabase PostgreSQL database migration schema (`supabase/schema.sql`).
- Created initial POS UI shell (`src/App.jsx`).
- Updated project documentation (`README.md`, `docs/implementation-plan.md`, `docs/changelog.md`, `docs/test-checklist.md`).

### Added — Full UI Design System (Week 1–3)

- **Design system foundation:**
  - Updated `tailwind.config.js` with brand palette: `brand.500` = `#C96A1F` (deep amber/burnt orange), `brand.900` = `#2D1A0E` (dark brown), `cream.50` = `#F9F6F0`, `cream.100` = `#F0EBE1`.
  - Added Inter font family via Google Fonts in `index.html` with `<html lang="id">`.
  - Added custom scrollbar utilities and thermal print CSS in `src/index.css`.
- **Shared utilities:**
  - `src/lib/format.js` — Indonesian formatting helpers: `formatRupiah` ("Rp 15.000"), `formatDateTime`, `formatDate`, `formatShortDay`, `paymentMethodLabel`, `statusLabel`.
  - `src/lib/checkout.js` — `generateReceiptNumber` (KRK-YYYYMMDD-XXXX) and `processCheckout` RPC wrapper for atomic checkout.
- **Screens (all Indonesian labels):**
  - `src/components/LoginScreen.jsx` — Rewritten with "Kasir Digital Kedai Rasa Kita" tagline, "Masuk" button, email + kata sandi fields.
  - `src/components/POSScreen.jsx` — New cashier POS screen: category tabs (Semua/Makanan/Minuman/Snack), search bar, product grid with stock badges (green/red/grey, out-of-stock disabled), cart with qty steppers, payment method pills (Tunai/QRIS/Debit/Transfer), "Proses Pembayaran" checkout.
  - `src/components/ReceiptModal.jsx` — New 80mm thermal receipt modal with shop header, receipt number, line items, total, payment method, "Cetak Struk" + "Transaksi Baru" actions.
  - `src/components/SalesHistory.jsx` — New sales history screen: table (No. Struk/Kasir/Tanggal/Item/Total/Metode/Status), date range + cashier filters, row click → detail modal with full item breakdown. Cashiers see only their own transactions.
  - `src/components/Dashboard.jsx` — New admin dashboard: summary cards (Pendapatan Hari Ini, Total Transaksi, Produk Terlaris), 7-day CSS bar chart, payment method breakdown with progress bars.
  - `src/components/StaffAccounts.jsx` — New staff account management: table (Nama/Email/Role/Status), active/inactive toggle, "Tambah Kasir" modal creating auth users with cashier role.
  - `src/components/ProductManager.jsx` — Rewritten with Indonesian labels, stock badges, and **mandatory stock adjustment reason** (writes to `stock_logs` with reason `adjustment`).
  - `src/components/CategoryManager.jsx` — Rewritten with Indonesian labels and empty/loading states.
- **Navigation:**
  - `src/App.jsx` — Rewritten with role-aware navigation: sidebar (desktop ≥1024px) with logo + shop name, bottom tab bar (tablet/mobile <1024px), "Keluar" logout.
  - Cashier sees: Kasir + Riwayat; Admin sees: Kasir, Riwayat, Dashboard, Produk, Kategori, Laporan, Akun Kasir.
- **Documentation:**
  - Updated `docs/implementation-plan.md` with UI design system section, screens table, navigation details, and UX principles.
  - Updated `docs/test-checklist.md` with new test items for POS, receipt, sales history, dashboard, and staff accounts.
