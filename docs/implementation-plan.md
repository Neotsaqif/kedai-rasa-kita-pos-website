# Implementation Plan: Kedai Rasa Kita POS System

## Tech Stack
| Layer | Choice | Why |
|---|---|---|
| Frontend | React (Vite) | Fast, simple SPA for POS screen + admin dashboard |
| Backend & DB | Supabase (PostgreSQL + Auth + RLS) | Managed DB, built-in Auth, Row-Level Security, handles backups & API layer smoothly |
| Middleware / Server | Node.js + Express (Optional) / Supabase Client | Direct client interaction + RPC functions for atomic stock updates |
| Auth | Supabase Auth (JWT + RLS roles) | Built-in role management (`admin` / `cashier`) |
| Receipt printing | Browser print (thermal-printer CSS) or ESC/POS via USB | Avoids hardware SDK complexity for V1 |
| Hosting | Vercel / Netlify + Supabase Cloud | Free/cheap tier, accessible remotely from store & home |
| Backups | Automated daily DB dump (Supabase Point-in-time / Daily Backups) | Integrated cloud backup, low operational overhead |

## Architecture
- Single web app, responsive layout (desktop for admin, tablet/laptop for POS)
- Supabase JS Client + Database RPC for atomic checkout & stock decrement
- Row Level Security (RLS) policies enforcing role permissions (`admin` vs `cashier`)
- DB tables: `users` (or `profiles`), `categories`, `products`, `sales`, `sale_items`, `stock_logs`

## Database Schema (high-level)
- **profiles**: id (references auth.users), name, role (admin/cashier), is_active
- **categories**: id, name, created_at
- **products**: id, sku, name, category_id, price, stock_qty, is_active, created_at
- **sales**: id, receipt_number, cashier_id, total_amount, payment_method (cash/qris/debit/transfer), status (completed/cancelled), created_at
- **sale_items**: id, sale_id, product_id, product_name, qty, price_at_sale
- **stock_logs**: id, product_id, change_qty, reason (sale/manual adjustment/refund), created_at

## Build Phases (4 weeks)

### Week 1 — Foundation
- Project setup (repo, DB, hosting env)
- Auth: login, role-based access (admin/cashier)
- Product/menu management CRUD (admin)
- Base UI shell (POS layout + admin layout)

### Week 2 — Core POS Flow
- POS sales screen: add items, adjust qty, cart
- Payment recording (Cash, QRIS, Debit Card, Bank Transfer)
- Checkout: finalize sale, auto-decrement stock
- Receipt generation/printing

### Week 3 — Reporting & Admin Tools
- Sales history (cashier: own transactions; admin: all)
- Sales reports (admin) — totals, filter by date
- Stock tracking view + manual stock adjustment (admin)
- Cashier account management (admin: create/deactivate)
- Refund/cancellation flow with admin approval

### Week 4 — Data, Polish, Delivery
- Import existing Excel product data
- Backups setup (automated DB dump)
- Bug fixes, UI polish (cream/brown-orange theme)
- Client review session
- Revisions round 1
- Final deployment + walkthrough with staff

*(2nd revision round handled post-delivery per agreed terms.)*

## Testing Checklist Before Delivery
- Full daily workflow run-through: Login → Sell → Payment → Checkout → Stock update → Receipt → Transaction history
- Role permission checks (cashier blocked from prices/stock/reports)
- Stock doesn't go negative / edge cases (out-of-stock item)
- Refund/cancellation requires admin approval
- Receipt prints correctly
- System accessible from store network and remotely (home)
- Backup runs and is restorable

## Post-Launch
- Monitoring: basic uptime check (free/low-cost, e.g. UptimeRobot) — no paid ops package
- Maintenance: bug fixes covered under revision rounds; new features quoted separately