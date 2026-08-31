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

| Peran (_Role_)      | Email                       | Password Default      | Akses Menu                                                       |
| ------------------- | --------------------------- | --------------------- | ---------------------------------------------------------------- |
| **Admin (Owner)**   | `admin@kedairasakita.com`   | `AdminRasaKita123!`   | Kasir, Riwayat, Dashboard, Produk, Kategori, Laporan, Akun Kasir |
| **Cashier (Kasir)** | `cashier@kedairasakita.com` | `CashierRasaKita123!` | Kasir, Riwayat (hanya transaksi sendiri)                         |

## Status

- Timeline: 4 weeks
- Budget: ~$750
- Stage: Week 1–3 Complete (Foundation, Supabase RLS, Auth, Product & Category Management, Full UI Design System, POS Flow, Receipt, Sales History, Dashboard, Staff Accounts)

## Tech Stack

React (Vite) · Tailwind CSS · Supabase (PostgreSQL, Auth, RLS) · Lucide Icons · Inter Font

See `docs/implementation-plan.md` for full details.
