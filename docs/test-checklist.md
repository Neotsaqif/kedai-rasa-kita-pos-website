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
- [x] Delete behavior handles related records correctly