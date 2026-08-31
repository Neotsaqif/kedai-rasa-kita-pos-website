# Changelog

All notable changes to the Kedai Rasa Kita POS System project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
