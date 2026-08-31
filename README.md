# Kedai Rasa Kita — POS System

Point-of-sale system for Kedai Rasa Kita, a small food & beverage shop. Handles sales, stock, product management, and reporting with role-based access for the owner (admin) and cashiers.

## Project Docs
- [`docs/project-brief.md`](./docs/project-brief.md) — requirements, scope, business rules, data model, definition of done
- [`docs/implementation-plan.md`](./docs/implementation-plan.md) — tech stack, architecture, schema, build phases, testing checklist
- [`docs/changelog.md`](./docs/changelog.md) — record of project changes and milestones

## Core Daily Workflow
`Login → Sell → Payment → Checkout → Stock update → Receipt → Transaction history`

## Roles
- **Admin (owner):** manage products/prices, categories, stock, cashier accounts, view reports, approve refunds
- **Cashier:** process sales, view own transaction history

## Payment Methods (record-only, V1)
Cash · QRIS · Debit Card · Bank Transfer

## Status
- Timeline: 4 weeks
- Budget: ~$750
- Stage: Week 1 Complete (Foundation, Supabase RLS, Auth, Product & Category Management)

## Tech Stack
React (Vite) · Tailwind CSS · Supabase (PostgreSQL, Auth, RLS)

See `docs/implementation-plan.md` for full details.