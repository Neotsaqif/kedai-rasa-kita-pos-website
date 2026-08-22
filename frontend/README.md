# 🍽️ Kedai Rasa Kita — Point of Sale (POS) & Store Management System

A modern, fast, and feature-rich Point of Sale (POS) and operational management web application designed specifically for food & beverage businesses, cafes, and restaurants. Built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Recharts**.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features & Modules](#-key-features--modules)
  - [1. Role-Based Access Control (RBAC)](#1-role-based-access-control-rbac)
  - [2. Cashier POS Terminal & Checkout](#2-cashier-pos-terminal--checkout)
  - [3. Transactions & Sales History](#3-transactions--sales-history)
  - [4. Order Cancellations & Refund Approval Workflow](#4-order-cancellations--refund-approval-workflow)
  - [5. Inventory & Stock Management with Audit Logs](#5-inventory--stock-management-with-audit-logs)
  - [6. Menu & Product Catalog Management](#6-menu--product-catalog-management)
  - [7. Financial Reports & Sales Analytics](#7-financial-reports--sales-analytics)
  - [8. Staff & Cashier User Administration](#8-staff--cashier-user-administration)
  - [9. Store Settings & Thermal Receipt Configuration](#9-store-settings--thermal-receipt-configuration)
  - [10. Responsive & Mobile-First UX](#10-responsive--mobile-first-ux)
- [Demo Accounts & Credentials](#-demo-accounts--credentials)
- [Technology Stack](#-technology-stack)
- [Project Architecture & Directory Structure](#-project-architecture--directory-structure)
- [Getting Started & Local Development](#-getting-started--local-development)
- [Data Storage & Persistence](#-data-storage--persistence)
- [License](#-license)

---

## 🌟 Overview

**Kedai Rasa Kita** provides a complete end-to-end operational software solution for running a food and beverage establishment. From fast order taking and multi-method payments to stock mutation tracking, manager refund authorization, and comprehensive business reporting, this application streamlines every daily cafe task.

The system is configured out of the box with realistic Indonesian culinary items (Special Fried Rice, Fried Chicken, Meatballs, Iced Sweet Tea, Aren Coffee, etc.) and native Indonesian Rupiah (`IDR / Rp`) formatting.

---

## 🚀 Key Features & Modules

### 1. Role-Based Access Control (RBAC)
The application strictly segments views and operational privileges between **Store Owner/Admin** and **Cashier Staff**:
- **Store Admin**: Complete access to business analytics, menu modifications, staff account creation, stock restocking, store settings, and refund authorization.
- **Cashier Staff**: Dedicated POS terminal, personal shift sales history, and the ability to submit order cancellation requests for manager approval.

---

### 2. Cashier POS Terminal & Checkout
- **Instant Product Search & Category Filtering**: Real-time filtering across categories (*Main Dishes*, *Noodles & Meatballs*, *Snacks*, *Cold Drinks*, *Indonesian Coffee*, *Hot Drinks*).
- **Stock-Aware Ordering**: Live stock badges prevent overselling; out-of-stock items are automatically disabled.
- **Order Customization**: Add item-specific kitchen notes (e.g., *"Extra spicy"*, *"Less ice"*, *"No onions"*).
- **Multi-Payment Modal**:
  - **Cash (`CASH`)**: Quick-tender bill buttons (e.g., `Rp 50,000`, `Rp 100,000`, exact cash) with automatic change calculation and shortfall validation.
  - **Dynamic QRIS (`QRIS`)**: Generates simulated QRIS payment code with payment verification simulation.
  - **Debit Card (`DEBIT`)**: Reference approval code input.
  - **Bank Transfer (`TRANSFER`)**: Virtual Account (BCA, Mandiri, BRI) transfer reference logging.
- **Thermal Receipt Generator**:
  - Itemized 58mm / 80mm printable thermal receipt formatting.
  - One-click native browser printing (`window.print()`).
  - Copyable raw text receipt format for instant sharing via WhatsApp.

---

### 3. Transactions & Sales History
- **Search & Filters**: Filter transactions by Invoice ID, Cashier Name, Date Range (*Today*, *Yesterday*, *Last 7 Days*, *All Time*), Payment Method, and Status (*Completed*, *Refund Pending*, *Refunded*).
- **Granular Invoice Inspection**: View subtotal, applied tax (PPN), cash tendered, change returned, and timestamped item details.
- **Reprint Receipts**: Cashiers and Admins can reprint or copy receipts for past transactions at any time.

---

### 4. Order Cancellations & Refund Approval Workflow
To prevent unauthorized register adjustments, a two-step refund governance workflow is implemented:
1. **Cashier Request**: Cashiers submit refund requests accompanied by mandatory justification notes.
2. **Admin Review**: Store Admins review pending requests with item snapshots, approve or reject with custom feedback.
3. **Automated Stock Restoration**: Upon refund approval, all sold inventory quantities are automatically returned to available stock and logged in the mutation audit trail.

---

### 5. Inventory & Stock Management with Audit Logs
- **Real-Time Stock Counts**: Clear visual badges for *In Stock*, *Low Stock* (at or below threshold), and *Out of Stock*.
- **Quick Restocking**: Incremental restocking shortcuts (`+10`, `+20`, `+50`, `+100` units) with delivery note tracking.
- **Comprehensive Audit Trail**: Every stock change is permanently logged with mutation type (`RESTOCK`, `SALE`, `REFUND_RETURN`, `ADJUSTMENT`, `DAMAGE`), timestamp, author, previous vs. new stock count, and delta.

---

### 6. Menu & Product Catalog Management
- **Product CRUD**: Add, edit, or remove menu items.
- **SKU Generation**: Automatic SKU assignment based on category.
- **Preset Image Selector**: Built-in curated culinary image library for fast product setup.
- **Pricing & Margins**: Configure retail price, cost price (COGS), stock count, and low-stock alert thresholds.
- **Status Toggle**: Temporarily deactivate seasonal or unavailable items without deleting them.

---

### 7. Financial Reports & Sales Analytics
Interactive, data-rich analytics powered by **Recharts**:
- **Key Performance Indicators (KPIs)**: Gross Revenue, Total Completed Orders, Average Basket Value (AOV), and Top Best Seller.
- **Revenue Over Time**: Interactive Area Chart illustrating daily revenue trends.
- **Payment Method Distribution**: Donut/Pie Chart comparing Cash vs. QRIS vs. Debit vs. Transfer share.
- **Top 5 Best-Selling Dishes**: Horizontal Bar Chart ranking items by portion volume sold.
- **Category Performance Table**: Breakdown of quantity, revenue, and percentage share per menu category.
- **Date Range Selectors**: Filter analytics by *Today*, *7 Days*, *30 Days*, or *All Time*.

---

### 8. Staff & Cashier User Administration
- **Cashier Management**: Register cashier accounts with login usernames, full names, and phone numbers.
- **Account Status Toggling**: Activate or deactivate cashier logins instantly.
- **Staff Performance Tracking**: Real-time summary of completed transaction count and total revenue generated per cashier.

---

### 9. Store Settings & Thermal Receipt Configuration
- **Store Identity**: Customize store name, phone number, physical address, and tagline.
- **Tax & PPN Configuration**: Toggle tax calculation on/off and set tax percentage (default 11%).
- **Receipt Customization**: Configure custom header notices and receipt footer thank-you messages.
- **Data Reset Tool**: Reset workspace state to default seed data at any time for demo or testing purposes.

---

### 10. Responsive & Mobile-First UX
- **Desktop**: Full navigation sidebar, dense data tables, and persistent multi-column views.
- **Mobile & Tablet**:
  - Sticky bottom navigation bar for one-thumb switching between POS, Sales, Products, Stock, Reports, and Settings.
  - Floating order drawer and bottom cart bar in the POS view.
  - Card-based responsive list layouts replacing wide tables on mobile viewports.
  - Large touch-friendly input buttons (minimum 44px touch targets).

---

## 🔑 Demo Accounts & Credentials

You can test both user roles using the pre-seeded accounts below:

| Role | Name | Username | Password | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **Store Admin** | Dimas Prasetyo (Owner) | `admin` | `admin123` | Full access (POS, Reports, Menu, Stock, Staff, Settings, Refund Approvals) |
| **Cashier Staff** | Siti Rahmawati | `cashier` | `cashier123` | Standard cashier (POS, My Sales History, Request Refunds) |
| **Cashier Staff** | Budi Santoso | `budi` | `budi123` | Standard cashier (POS, My Sales History, Request Refunds) |

*Quick login buttons are available directly on the login screen for instant one-click access.*

---

## 💻 Technology Stack

- **Framework**: [React 19](https://react.dev/) (Vite bundler)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict type safety)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Charts & Data Visualization**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/)
- **State & Storage**: React Context API with synchronous `localStorage` persistence

---

## 📁 Project Architecture & Directory Structure

```text
├── metadata.json              # App metadata & title configuration
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite configuration with Tailwind CSS plugin
├── src/
│   ├── main.tsx               # React application entry point
│   ├── App.tsx                # Master routing, authentication gate & responsive layout
│   ├── index.css              # Global styles & Tailwind CSS v4 imports
│   ├── types/
│   │   └── index.ts           # Shared TypeScript interfaces & types
│   ├── context/
│   │   └── AppContext.tsx     # Global state provider (Auth, Products, Cart, Transactions, Stock, Refunds)
│   ├── data/
│   │   └── mockData.ts        # Seed data (Products, Users, Transactions, Stock logs, Settings)
│   ├── utils/
│   │   └── formatters.ts      # Indonesian Rupiah currency, date, and invoice ID formatters
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx     # Top navigation bar with active user profile & quick shift summary
│   │   │   └── Sidebar.tsx    # Desktop sidebar and mobile bottom navigation bar
│   │   └── ui/
│   │       ├── Badge.tsx      # Status & notification pill component
│   │       ├── Button.tsx     # Reusable button with variants (accent, secondary, danger, outline)
│   │       ├── Card.tsx       # Container card component
│   │       ├── ConfirmationDialog.tsx # Action confirmation modal
│   │       ├── EmptyState.tsx # Clean zero-state display component
│   │       ├── Input.tsx      # Form input field with validation helpers
│   │       ├── Modal.tsx      # Accessible modal wrapper
│   │       └── StatCard.tsx   # Metrics & KPI card with icons
│   └── features/
│       ├── auth/
│       │   └── LoginPage.tsx  # Dual-role login view with quick-fill demo buttons
│       ├── dashboard/
│       │   ├── AdminDashboard.tsx   # Store owner executive dashboard with charts & low-stock alerts
│       │   └── CashierDashboard.tsx # Cashier daily shift dashboard & quick POS launch
│       ├── pos/
│       │   ├── PosPage.tsx          # Main POS terminal with category tabs & product grid
│       │   ├── CartDrawer.tsx       # Live shopping cart with quantity controls & note editor
│       │   ├── PaymentModal.tsx     # Multi-method payment modal (Cash, QRIS, Debit, Transfer)
│       │   └── ReceiptModal.tsx     # 58mm/80mm thermal receipt viewer & WhatsApp text exporter
│       ├── sales/
│       │   └── SalesHistoryPage.tsx # Complete transaction registry with filtering & reprint features
│       ├── refunds/
│       │   └── RefundRequestsPage.tsx # Refund authorization & cashier request management
│       ├── stock/
│       │   └── StockManagementPage.tsx# Live inventory balances, restocking tool & audit history
│       ├── products/
│       │   └── ProductManagementPage.tsx # Product catalog management with CRUD modals
│       ├── reports/
│       │   └── ReportsPage.tsx      # Comprehensive financial & sales performance charts
│       ├── users/
│       │   └── UserManagementPage.tsx # Staff cashier account management
│       └── settings/
│           └── SettingsPage.tsx     # Store profile, tax (PPN), and receipt customizations
```

---

## 🛠️ Getting Started & Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository or extract the project files:**
   ```bash
   git clone <repository-url>
   cd kedai-rasa-kita
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

4. **Verify TypeScript compilation & linting:**
   ```bash
   npm run lint
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```
   The compiled static assets will be output to the `dist/` directory.

---

## 💾 Data Storage & Persistence

- All mutations—including new orders, inventory restocking, refund requests, newly added menu items, staff accounts, and store settings—are persisted in the browser's **`localStorage`**.
- This guarantees data persistence across browser reloads while functioning entirely offline without external database setup requirements.
- To wipe test data and return to original seed data, navigate to **Settings** &rarr; **Reset to Seed Data**.

---

## 📄 License

Distributed under the **MIT License**. Feel free to adapt and expand for your own restaurant or retail operations.
