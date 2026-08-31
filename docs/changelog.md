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
- Initialized React single-page application using Vite.
- Configured Tailwind CSS with custom theme colors (`cream-50`, `cream-100`, `cream-200`, `brand-500`, `brand-900`) for Kedai Rasa Kita branding.
- Added Supabase JS SDK (`@supabase/supabase-js`) and client configuration (`src/lib/supabase.js`).
- Created complete Supabase PostgreSQL database migration schema (`supabase/schema.sql`).
- Created initial POS UI shell (`src/App.jsx`).
- Updated project documentation (`README.md`, `docs/implementation-plan.md`, `docs/changelog.md`).


