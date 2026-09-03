# Test Checklist

## Foundation

- [x] `npm run build` succeeds
- [x] `.env` uses Supabase URL + anon/publishable key
- [x] `.env` is in `.gitignore`
- [x] `.env.example` exists without secrets
- [x] Supabase client initializes without errors
- [x] App loads correctly after fresh clone/install

## Database & RLS

- [x] All required tables exist in Supabase
- [x] Foreign keys/constraints work
- [x] Insert/update/delete works where expected
- [x] RLS is enabled on all intended tables
- [x] Unauthenticated users cannot access protected data
- [x] Cashier cannot perform admin-only operations
- [x] Admin can perform admin operations
- [x] Test policies with different user roles, not just the dashboard/service role

## Authentication

- [x] Login with valid admin credentials
- [x] Login with valid cashier credentials
- [x] Invalid credentials show an error
- [x] Session persists after page refresh
- [x] Logout actually invalidates the session
- [x] Unauthenticated users cannot access protected pages
- [x] Admin gets admin permissions
- [x] Cashier gets cashier permissions
- [x] User with missing/invalid profile role is handled safely

## Product & Category CRUD

For both **products** and **categories**:

- [x] Create
- [x] Read/list
- [x] Update
- [x] Delete
- [x] Form validation
- [x] Loading states
- [x] Error states
- [x] Empty states
- [x] Changes persist after refresh
- [x] Duplicate/invalid data is rejected
- [x] Negative price / negative stock rejected by the backend (`create_product` / `update_product`)
- [x] Delete behavior handles related records correctly
- [x] Delete product also removes its uploaded image file (best-effort, path-safe)

## UI Design System

- [x] Brand palette applied: `brand.500` = `#C96A1F`, `brand.900` = `#2D1A0E`, `cream.50` = `#F9F6F0`, `cream.100` = `#F0EBE1`
- [x] Inter font loads correctly
- [x] Currency displayed as "Rp 15.000" format (Indonesian Rupiah with dot separators)
- [x] All labels in Indonesian (Masuk, Keluar, Produk, Laporan, Kasir, dll.)
- [x] Responsive: sidebar on desktop (≥1024px), bottom tab bar on tablet/mobile (<1024px)
- [x] Loading states for all data tables and grids
- [x] Empty states for all data tables and grids

## POS / Kasir Screen

- [x] Product grid loads with category tabs (Semua/Makanan/Minuman/Snack)
- [x] Search bar filters products by name
- [x] Empty state shows "Tidak ada produk." when no products exist (no mock fallback)
- [x] Product cards show name, price (Rp format), and stock badge
- [x] Stock badges: green if in stock, red/orange if low (≤5), grey if 0
- [x] Out-of-stock products are disabled and cannot be added to cart
- [x] Tap product adds to cart
- [x] Cart shows item name, qty stepper (+/−), and subtotal
- [x] Remove item from cart works
- [x] Order total updates correctly
- [x] Payment method pills: Tunai, QRIS, Debit, Transfer
- [x] "Proses Pembayaran" button disabled when cart is empty
- [x] Checkout opens a confirmation popup ("Apakah Anda yakin ingin melanjutkan transaksi ini?") with item/payment/total summary
- [x] Confirming ("Ya, Lanjutkan") processes the sale; "Batal" cancels without side effects
- [x] Checkout processes via `process_checkout` RPC
- [x] Stock auto-decrements after successful checkout
- [x] Error message shown if checkout fails (e.g., insufficient stock)

## Receipt Modal

- [x] Receipt modal appears after successful checkout
- [x] 80mm thermal layout with shop name, date/time, receipt number (KRK-YYYYMMDD-XXXX)
- [x] Line items show name, qty, price each, subtotal
- [x] Total and payment method displayed
- [x] "Cetak Struk" triggers window.print()
- [x] "Transaksi Baru" resets cart and closes modal

## Sales History (Riwayat Penjualan)

- [x] Table shows: No. Struk, Kasir, Tanggal, Item, Total, Metode, Status
- [x] Search by receipt number or cashier name
- [x] Date range filter (from/to)
- [x] Cashier dropdown filter (admin only)
- [x] Cashier sees only their own transactions
- [x] Admin sees all transactions
- [x] Row click opens detail modal with full item breakdown
- [x] Detail modal shows total, payment method, status, and items

## Dashboard

- [x] Summary cards: Pendapatan Hari Ini, Total Transaksi, Produk Terlaris
- [x] 7-day bar chart (CSS bars) shows sales by day
- [x] Payment method breakdown with progress bars
- [x] Empty state when no transactions today

## Staff Accounts (Akun Kasir)

- [x] Table shows: Nama, Email, Role, Status
- [x] Active/inactive toggle works
- [x] Admin accounts cannot be deactivated
- [x] "Tambah Kasir" modal creates auth user with cashier role
- [x] Form validation (all fields required, password min 6 chars)
- [x] Success message shown after account creation

## Stock Adjustment

- [x] Editing product stock requires enabling "Penyesuaian stok" checkbox
- [x] Reason field is mandatory when stock adjustment is enabled
- [x] Stock change is logged to `stock_logs` with reason `adjustment`
- [x] Validation error shown if reason is empty
- [x] Backend recomputes stock from `change_qty` (missing `new_stock` cannot zero/corrupt stock)
- [x] Backend rejects a resulting negative stock
- [x] Backend rejects an empty reason on `adjust_stock`
