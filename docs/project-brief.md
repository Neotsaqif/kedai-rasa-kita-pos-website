# Project Brief: Kedai Rasa Kita POS System

## Overview
- **Client:** Kedai Rasa Kita (small F&B shop)
- **Users:** Owner (admin) + cashiers
- **Timeline:** 4 weeks
- **Budget:** $600–900 target, prefer ~$750
- **References:** Moka POS (workflow, inventory, reports), Square POS (checkout, permissions, receipts)

## Goals
Replace Excel/handwritten tracking with a POS system for sales, stock, products, and reporting, with role-based access for admin vs. cashiers.

## Core Daily Workflow (must work reliably)
`Login → Sell → Payment → Checkout → Stock update → Receipt → Transaction history`

| Step | Requirement |
|---|---|
| Login | Cashier/admin authenticates with role-based access |
| Sell | Cashier adds items to sale on POS screen |
| Payment | Cashier records method: Cash, QRIS, Debit Card, or Bank Transfer (record-only, not processed) |
| Checkout | Sale finalized, total confirmed |
| Stock update | Stock quantities auto-decrement on checkout |
| Receipt | Receipt printed for the transaction |
| Transaction history | Sale logged with items, total, payment method, timestamp, cashier; viewable in history |

## Core Features (V1 — Required)
1. Login for admin and cashiers
2. POS/cashier screen for processing sales
3. Product/menu management (admin only)
4. Stock tracking, incl. automatic deduction on sale
5. Payment recording (Cash, QRIS, Debit Card, Bank Transfer — record-only, no payment gateway)
6. Receipt printing
7. Sales history and reports (admin only)
8. Role-based permissions

## Optional / Future Features
- Discounts/promo codes (not needed now)
- Customer records
- Low-stock notifications
- Expense tracking
- Daily/weekly/monthly comparison reports
- Product categories
- Supplier management (uncertain need)

## Data to Store
- **User accounts:** name, login credentials, role
- **Products:** name, price, category, stock quantity
- **Sales transactions:** items sold, quantity, total, payment method, timestamp, cashier
- **Stock changes:** additions/reductions log
- **Receipts/transaction history**
- Reports generated from sales data (not stored separately)

## Business Rules
- Cashiers cannot edit prices or stock
- Cashiers cannot view reports
- Cashiers can process sales and view their own transaction history
- Refunds/cancellations require admin approval
- Only admin creates/deactivates cashier accounts
- Every transaction records the handling cashier
- Discount logic: deferred, TBD

## Design
- No existing UI/UX design — build from scratch
- Style: simple, clean, cashier-friendly (esp. sales screen)
- Colors: warm/clean — cream/white base with dark brown or orange accent; open to variation as long as professional and readable

## Integrations
- Payment gateway: **not needed** (Cash, QRIS, Debit Card, Bank Transfer all recorded manually)
- Email: not needed
- WhatsApp: not needed

## Data Migration
- Existing product/menu list and some sales records in Excel (migrate)
- Handwritten stock records (not worth migrating)

## Non-Functional Requirements
- Backups required (critical — no data loss)
- Hosting: Supabase Cloud + Vercel/Netlify; accessible from store and home
- Monitoring/maintenance: open to it if needed for reliability, but avoid costly monthly packages

## Process
- 2 rounds of revisions included
- Small changes included; net-new unscoped features billed separately
- Client review pass before final delivery

## Definition of Done
- All agreed features working correctly
- Cashiers can run daily sales without major issues
- Admin can manage products, stock, users, and reports
- Receipts and payment recording work correctly
- System accessible from store and home
- Initial product data imported
- Agreed revisions completed
- No major bugs blocking normal operations