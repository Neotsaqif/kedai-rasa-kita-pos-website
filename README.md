# Kedai Rasa Kita — POS System

Point-of-sale system for Kedai Rasa Kita, a small food & beverage shop. Handles sales, stock, product management, and reporting with role-based access for the owner (admin) and cashiers.

## Project Docs

- [`docs/project-brief.md`](./docs/project-brief.md) — requirements, scope, business rules, data model, definition of done
- [`docs/implementation-plan.md`](./docs/implementation-plan.md) — tech stack, architecture, schema, build phases, testing checklist
- [`docs/changelog.md`](./docs/changelog.md) — record of project changes and milestones
- [`docs/test-checklist.md`](./docs/test-checklist.md) — system test checklist

## Core Daily Workflow

`Login → Sell → Payment → Checkout → Stock update → Receipt → Transaction history`

## Roles

- **Admin (owner):** manage products/prices, categories, stock, cashier accounts, view reports, approve refunds
- **Cashier:** process sales, view own transaction history

## Screens

| Screen          | Access          | Description                                                                          |
| --------------- | --------------- | ------------------------------------------------------------------------------------ |
| **Kasir (POS)** | Admin + Cashier | Two-column product grid + cart with payment method pills (Tunai/QRIS/Debit/Transfer) |
| **Riwayat**     | Admin + Cashier | Sales history; cashiers see only their own transactions                              |
| **Dashboard**   | Admin           | Summary cards, 7-day sales chart, payment method breakdown                           |
| **Produk**      | Admin           | Product & inventory management with stock adjustment + mandatory reason              |
| **Kategori**    | Admin           | Category management                                                                  |
| **Laporan**     | Admin           | Full sales history with date range + cashier filters                                 |
| **Akun Kasir**  | Admin           | Staff account management with active/inactive toggle                                 |

## Payment Methods (record-only, V1)

Cash · QRIS · Debit Card · Bank Transfer

## Default Credentials (Testing / Development)

> [!NOTE]
> Gunakan akun bawaan berikut untuk menguji login dan fitur peran user (_role-based access_):

| Peran (_Role_)      | Email                  | Password Default  | Akses Menu                                                       |
| ------------------- | ---------------------- | ----------------- | ---------------------------------------------------------------- |
| **Admin (Owner)**   | `admin@rasakita.id`    | `password123`     | Kasir, Riwayat, Dashboard, Produk, Kategori, Laporan, Akun Kasir |
| **Cashier (Kasir)** | `kasir@rasakita.id`    | `password123`     | Kasir, Riwayat (hanya transaksi sendiri)                         |

> [!TIP]
> Credentials di atas **persis sama** dengan tombol *Uji Coba Cepat (Demo Logins)* di layar
> login, jadi Anda bisa langsung memakai salah satu tombol tersebut untuk mengisi form.

## Status

- Timeline: 4 weeks
- Budget: ~$750
- Stage: Week 1–3 Complete (Foundation & Data Layer, UI Design System, POS Flow, Receipt, Sales History, Dashboard, Staff Accounts, Switchable Supabase ⇄ MySQL backend); Week 4 (Deployment & Delivery) In Progress — see `docs/implementation-plan.md` §8

## Tech Stack

React (Vite) · Tailwind CSS · **Switchable backend: MySQL (XAMPP / PHP/PDO)** or **Supabase** (PostgreSQL, Auth, RLS) · Lucide Icons · Inter/Plus Jakarta Sans · Playfair Display

See `docs/implementation-plan.md` for full details, including the **Backend Switcher**
section that explains how `VITE_DB_BACKEND` (`mysql` default / `supabase`) controls which
database the app uses.

## Running with local MySQL (XAMPP)

1. Start **Apache** + **MySQL** in XAMPP.
2. Import `backend/sql/schema.sql` (phpMyAdmin or `mysql` CLI) to create the `kedai_rasa_kita` DB.
3. Run `backend/sql/seed.php` once to create the default admin/cashier accounts.
4. Check `.env`: `VITE_DB_BACKEND=mysql` and `VITE_API_BASE_URL` pointing at `backend/api/index.php`.
5. `npm install` then `npm run dev`, and open the printed URL.

> To switch back to Supabase, set `VITE_DB_BACKEND=supabase` in `.env` and restart the dev server.
