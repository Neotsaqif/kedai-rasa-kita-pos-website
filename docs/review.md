# Code Review — Kedai Rasa Kita POS

**Date (review):** 2026-09-03
**Date (fixes applied):** 2026-09-03
**Reviewed by:** Cline (guided by `addyosmani/agent-skills@code-review-and-quality`)
**Scope:** Working changes on branch `feat/full-stack-pos-react-frontend-formatting-modular-components` (per `git status`), including the new `backend/` PHP/PDO API, the `supabase/` seed, and the refactored React frontend (components, `AuthContext`, `src/lib/*`).
**Validation after fixes:** ✅ `php -l` clean on all PHP files. ✅ `vite build` passes (17.5s, EXIT 0). No automated tests exist.

---

## Verdict: ✅ Major issues resolved — approve pending non-blocking items

The **Critical** and **High/Medium** issues from the original review have been fixed in this pass (server-side auth, checkout price pinning, upload hardening, refund stock restore, receipt-collision retry, seed no longer resets passwords). A few **Low / architectural** items remain as documented follow-ups.

---

## What Was Fixed

| # | Issue | Fix | File(s) |
|---|---|---|---|
| 1 🔥 Critical | No server-side auth; role forgeable via `localStorage`; open CORS | Added `sessions` table + bearer-token auth. All non-`login` actions require a valid token; admin-only actions additionally require an `admin` role. Login issues a 64-hex-char token; logout revokes it. CORS restricted to configured origins (`KRK_ALLOWED_ORIGINS`). Frontend stores the token, sends `Authorization: Bearer`, and drops credentials on 401. | `schema.sql`, `config.php`, `api/index.php`, `lib/mysql.js`, `lib/data.js` |
| 2 🟠 High | Checkout trusted client prices/totals/cashier | Cashier is taken from the authenticated token. Product prices/names/stock resolved server-side; total recomputed from DB; inactive/unknown products rejected. | `api/index.php` (`process_checkout`) |
| 3 🟠 High | Upload extension from client filename | Extension mapped from *verified* MIME (`jpg`/`png`/`gif`) — never the client filename. URL now scheme-aware (HTTP/HTTPS). | `api/index.php` (`upload_image`) |
| 4 🟡 Medium | Refunds didn't restore stock / log; unguarded status flip | `approve_refund` runs in a transaction: restores sold qty to stock + writes a `stock_log`, and validates the sale is in `refund_requested` state. `request_refund` restricted to sale-owner/admin and only from `completed`. | `api/index.php` (`request_refund` / `approve_refund`) |
| 5 🟡 Medium | Receipt-number collision → 500 | Server-side retry loop (up to 5×) regenerates a unique number on UNIQUE-key collision. | `api/index.php` (`process_checkout`, `server_receipt_number`) |
| 6 🟡 Medium | "insufficient stock" conflated with "not found" | Distinct validation: unknown product → 404; inactive/insufficient stock → clear messages. | `api/index.php` (`process_checkout`) |
| 7 🟡 Medium | seed.php reset passwords on every run | `ON DUPLICATE KEY UPDATE` no longer overwrites `password_hash` — changed passwords are preserved. | `sql/seed.php` |
| 9 🔵 Low | Hard-coded `http://` upload URL | Scheme-aware URL builder. | `api/index.php` (`upload_image`) |
| 12 🔵 Low | `fetchProfile` relied on admin-only staff list | MySQL `fetchProfile` returns the full profile carried by the login response instead of calling the admin-only list (fixes cashier profile fetch). | `lib/data.js` |

---

## Five-Axis Review (post-fix)

### 1. Correctness
- ✅ Prices, totals and cashier now come from the server (authoritative), not the client.
- ✅ Refund restores stock and logs it atomically; state machine enforced.
- ✅ Receipt collisions retried automatically.
- ⚠️ No automated tests yet (see R3).

### 2. Readability & Simplicity
- ✅ Helpers extracted: `bearer_token`, `current_user`, `require_auth`, `require_admin`, `create_session`, `attempt_checkout`, `server_receipt_number` — each single-responsibility.

### 3. Architecture
- ✅ Auth gate centralized at the top of the API before the dispatch switch — a single enforcement point, so the frontend role gating is no longer a security boundary.
- Remaining: dual MySQL/Supabase shim in `lib/data.js` (R1).

### 4. Security
- ✅ Server-side bearer-token auth with server-validated sessions — roles can no longer be forged client-side.
- ✅ CORS allow-list restricted (`KRK_ALLOWED_ORIGINS`) instead of `*`.
- ✅ Upload extension pinned to verified MIME; URL scheme-aware.
- ✅ Admin-only actions enforced server-side (staff, category/product management, stock adjust, image upload, refund approval, stock logs).
- ✅ Non-admin sales queries forced to own records server-side.

### 5. Performance
- ⚠️ Single 855 kB JS chunk — not code-split (R2).

---

## Remaining Items (non-blocking follow-ups)

### R1 — Dual backend shim lives on in `lib/data.js`
Every function still carries a `mysql`/`supabase` branch. Intentional migration shim; plan to delete the Supabase path once MySQL is the committed backend.

### R2 — Single large JS bundle (855 kB / 238 kB gzip)
No code-splitting. Consider `React.lazy` / `manualChunks` for `Dashboard`/`recharts`.

### R3 — No app-level tests; `npm run lint` unconfigured
Only `node_modules` tests exist; `package.json` declares `"lint": "eslint ."` with no `eslint.config.*`/`.eslintrc`. Add a flat ESLint config and at least a test for the checkout math.

---

## Verification
- ✅ **PHP syntax**: `php -l` clean on `api/index.php`, `config.php`, `seed.php`, `seed_demo.php`.
- ✅ **Build passes**: `vite build` → `✓ built in 17.53s`, EXIT 0.
- ⚠️ **No automated tests** in the repo.
- ⚠️ **`npm run lint` is unconfigured** (R3).

---

## Database Migration Note
The new **`sessions`** table is defined in `backend/sql/schema.sql`. **Re-import the schema** against the `kedai_rasa_kita` DB before using login (e.g. via phpMyAdmin or `mysql < backend/sql/schema.sql`). The `CREATE TABLE IF NOT EXISTS` makes it safe to run over existing data.

Existing `localStorage` sessions (pre-token) will be rejected once with a 401; after re-login the token flow takes over. Tokens expire after 7 days — users simply log back in.

