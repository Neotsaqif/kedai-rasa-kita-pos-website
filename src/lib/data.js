// --------------------------------------------------------------------
// Data gateway: Kedai Rasa Kita POS.
//
// Every data read/write in the app funnels through this module. It reads
// VITE_DB_BACKEND ("mysql" | "supabase") and dispatches to the appropriate
// backend while normalising the payload shapes the UI components expect.
//
// Keeping Supabase intact means you can switch back at any time by setting:
//   VITE_DB_BACKEND=supabase   (in .env)
// --------------------------------------------------------------------

import { supabase } from "./supabase";
import * as mysql from "./mysql";

export const DB_BACKEND = (import.meta.env.VITE_DB_BACKEND || "mysql").toLowerCase();
export const isMysql = () => DB_BACKEND === "mysql";

// ====================================================================
// AUTH
// ====================================================================

/**
 * Resolve the currently logged-in user at boot (or null).
 * @returns {Promise<object|null>}
 */
export async function getInitialUser() {
  if (isMysql()) return mysql.getStoredUser();
  const { data } = await supabase.auth.getSession();
  return data?.session?.user ?? null;
}

/**
 * Subscribe to auth state changes. For the local MySQL backend there are no
 * server-side session events, so this returns a no-op unsubscribe.
 * @param {(user: object|null) => void} handler
 * @returns {{ unsubscribe: () => void }}
 */
export function subscribeAuthChange(handler) {
  if (isMysql()) return { unsubscribe: () => {} };
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    handler(session?.user ?? null);
  });
  return { unsubscribe: () => data?.subscription?.unsubscribe?.() };
}

/**
 * Sign in. Returns the authenticated user.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>}
 */
export async function login(email, password) {
  if (isMysql()) return mysql.login(email, password);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function logout() {
  if (isMysql()) return mysql.logout();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Fetch a single staff member's profile by id (or null if not found).
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
export async function fetchProfile(userId) {
  if (isMysql()) {
    // The MySQL login response already carries the full profile (role, name,
    // email), so return the stored user instead of the admin-only staff list.
    const stored = mysql.getStoredUser();
    return stored && stored.id === userId ? stored : null;
  }
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data || null;
}

// ====================================================================
// STAFF / USERS
// ====================================================================

export async function fetchProfiles() {
  if (isMysql()) return mysql.fetchProfiles();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

/**
 * Create a cashier account.
 * @returns {Promise<object>}
 */
export async function createCashier({ name, email, password }) {
  if (isMysql()) {
    return mysql.createCashier({ name, email, password });
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role: "cashier" } },
  });
  if (error) throw error;
  if (data?.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      name,
      role: "cashier",
      is_active: true,
    });
  }
  return data;
}

export async function toggleUserActive(id, isActive) {
  if (isMysql()) return mysql.toggleUserActive({ id, is_active: isActive });
  await supabase.from("profiles").update({ is_active: isActive }).eq("id", id);
}

// ====================================================================
// CATEGORIES
// ====================================================================

export function fetchCategories() {
  if (isMysql()) return mysql.fetchCategories();
  return supabase.from("categories").select("*").order("name", { ascending: true });
}

export async function createCategory(name) {
  if (isMysql()) return mysql.createCategory(name);
  await supabase.from("categories").insert([{ name }]);
}

export async function updateCategory(id, name) {
  if (isMysql()) return mysql.updateCategory(id, name);
  await supabase.from("categories").update({ name }).eq("id", id);
}

export async function deleteCategory(id) {
  if (isMysql()) return mysql.deleteCategory(id);
  await supabase.from("categories").delete().eq("id", id);
}

// ====================================================================
// PRODUCTS
// ====================================================================

/**
 * Fetch products (optionally only active ones). Each product carries a
 * nested `categories.name` so the POS filter `p.categories?.name` works.
 * @param {boolean} [onlyActive]
 * @returns {Promise<Array>}
 */
export async function fetchProducts(onlyActive = false) {
  if (isMysql()) {
    let products = await mysql.fetchProducts();
    if (onlyActive) products = products.filter((p) => p.is_active);
    return products;
  }
  let query = supabase
    .from("products")
    .select("*, categories(name)")
    .order("name", { ascending: true });
  if (onlyActive) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Lightweight references for category counts (id + category_id only).
 * @returns {Promise<Array>}
 */
export async function fetchProductCategoryRefs() {
  if (isMysql()) {
    const products = await mysql.fetchProducts();
    return products.map((p) => ({ id: p.id, category_id: p.category_id }));
  }
  const { data, error } = await supabase.from("products").select("id, category_id");
  if (error) throw error;
  return data || [];
}

export async function createProduct(payload) {
  if (isMysql()) return mysql.createProduct(payload);
  await supabase.from("products").insert([payload]);
}

export async function updateProduct(id, payload) {
  if (isMysql()) return mysql.updateProduct({ ...payload, id });
  await supabase.from("products").update(payload).eq("id", id);
}

export async function toggleProductActive(id, isActive) {
  if (isMysql()) return mysql.toggleProductActive(id, isActive);
  await supabase.from("products").update({ is_active: isActive }).eq("id", id);
}

/**
 * Delete a product permanently.
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function deleteProduct(id) {
  if (isMysql()) return mysql.deleteProduct(id);
  await supabase.from("products").delete().eq("id", id);
}

/**
 * Adjust a product's stock and log the change.
 * @param {object} params { product_id, product_name, new_stock, change_qty, reason, note, user_name }
 */
export async function adjustStock(params) {
  if (isMysql()) return mysql.adjustStock(params);
  await supabase.from("products").update({ stock_qty: params.new_stock }).eq("id", params.product_id);
  await supabase.from("stock_logs").insert([
    {
      product_id: params.product_id,
      product_name: params.product_name,
      change_qty: params.change_qty,
      quantity_change: params.change_qty,
      reason: params.reason,
      note: params.note,
    },
  ]);
}

export async function uploadImageFile(file) {
  if (isMysql()) return mysql.uploadImage(file);
  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const { data, error } = await supabase.storage
    .from("product-images")
    .upload(fileName, file);
  if (error) throw error;
  const { data: publicUrl } = supabase.storage
    .from("product-images")
    .getPublicUrl(data.path);
  return { success: true, image_url: publicUrl.publicUrl };
}

// ====================================================================
// SALES / TRANSACTIONS
// ====================================================================

/**
 * Fetch sales with their line items. The nested key is `transaction_items`
 * (what SalesHistory + Dashboard + ReceiptModal already read).
 * @param {string|null} [cashierId] Optional filter for non-admin cashiers.
 * @returns {Promise<Array>}
 */
export async function fetchSales(cashierId = null) {
  if (isMysql()) return mysql.fetchSales(cashierId || "");
  let query = supabase
    .from("transactions")
    .select(`
      *,
      transaction_items (
        product_id,
        product_name,
        quantity,
        price_at_sale,
        subtotal
      )
    `)
    .order("created_at", { ascending: false });
  if (cashierId) query = query.eq("cashier_id", cashierId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function requestRefund(id, reason) {
  if (isMysql()) return mysql.requestRefund(id, reason);
  await supabase
    .from("transactions")
    .update({
      status: "refund_requested",
      notes: `Refund Request: ${reason}`,
    })
    .eq("id", id);
}

export async function approveRefund(id) {
  if (isMysql()) return mysql.approveRefund(id);
  await supabase.from("transactions").update({ status: "refunded" }).eq("id", id);
}

/**
 * Atomically create a sale, sale items, decrement stock and log stock changes.
 * @param {object} params { receipt_number, cashier_id, total_amount, payment_method, items }
 * @returns {Promise<{ saleId: number, receiptNumber: string }>}
 */
export async function processCheckout(params) {
  if (isMysql()) {
    const res = await mysql.processCheckout({
      p_receipt_number: params.receipt_number,
      p_cashier_id: params.cashier_id,
      p_total_amount: params.total_amount,
      p_payment_method: params.payment_method,
      p_items: params.items,
    });
    return { saleId: res.sale_id, receiptNumber: params.receipt_number };
  }
  const { data, error } = await supabase.rpc("process_checkout", {
    p_receipt_number: params.receipt_number,
    p_cashier_id: params.cashier_id,
    p_total_amount: params.total_amount,
    p_payment_method: params.payment_method,
    p_items: params.items,
  });
  if (error) throw error;
  return { saleId: data, receiptNumber: params.receipt_number };
}

// ====================================================================
// STOCK LOGS
// ====================================================================

export async function fetchStockLogs() {
  if (isMysql()) return mysql.fetchStockLogs();
  const { data, error } = await supabase
    .from("stock_logs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error && error.code !== "42P01") throw error;
  return data || [];
}