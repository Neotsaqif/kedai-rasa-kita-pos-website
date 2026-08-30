# Changelog

All notable changes to the Kedai Rasa Kita POS System project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initialized React single-page application using Vite.
- Configured Tailwind CSS with custom theme colors (`cream-50`, `cream-100`, `cream-200`, `brand-500`, `brand-900`) for Kedai Rasa Kita branding.
- Added Supabase JS SDK (`@supabase/supabase-js`) and client configuration (`src/lib/supabase.js`).
- Created complete Supabase PostgreSQL database migration schema (`supabase/schema.sql`) including:
  - Tables: `profiles`, `categories`, `products`, `sales`, `sale_items`, `stock_logs`.
  - Row Level Security (RLS) policies.
  - `process_checkout` stored procedure (RPC) for atomic sales checkout & stock decrements.
- Created initial POS UI shell (`src/App.jsx`) with POS grid catalog, interactive cart panel, navigation sidebar, and thermal receipt print styles (`src/index.css`).
- Created project setup files: `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `.env.example`, `.gitignore`.
- Updated project documentation (`README.md`, `docs/implementation-plan.md`, `docs/project-brief.md`) to reflect Supabase stack.
