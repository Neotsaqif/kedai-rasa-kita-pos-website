// REST client for the Kedai Rasa Kita POS MySQL (PHP/PDO) backend.
// All calls go to backend/api/index.php?action=<name> and return JSON.

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost/kedai-rasa-kita-pos-website/backend/api/index.php";

const STORAGE_KEY = "krk_mysql_user";
const TOKEN_KEY = "krk_mysql_token";

/**
 * Send a POST request to the PHP API and parse the JSON response. Attaches the
 * server-issued bearer token so the backend can authenticate the caller.
 * @param {string} action
 * @param {object} [params]
 * @returns {Promise<any>}
 */
async function call(action, params = {}) {
  const res = await fetch(`${API_BASE}?action=${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(getStoredToken() ? { Authorization: `Bearer ${getStoredToken()}` } : {}),
    },
    body: JSON.stringify(params),
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  // An expired/invalid session: drop stored credentials so the next page load
  // returns to the login screen cleanly.
  if (res.status === 401) {
    setStoredToken(null);
    setStoredUser(null);
  }

  if (!res.ok) {
    throw new Error(data.error || `API error (${action})`);
  }
  if (data && data.error) {
    throw new Error(data.error);
  }
  return data;
}

// --------------------------------------------------------------------
// Auth / session (client-side persistence for the local MySQL backend).
// The token is a server-issued random value stored alongside the user; the
// server validates it against its sessions table on every protected call.
// --------------------------------------------------------------------

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function login(email, password) {
  const data = await call("login", { email, password });
  if (!data.user) throw new Error("Data login tidak valid dari server.");
  setStoredToken(data.token || null);
  setStoredUser(data.user);
  return data.user;
}

export async function logout() {
  try {
    // Revoke the server-side session (best effort).
    await call("logout");
  } catch {
    // Ignore network/expiry errors — always clear local credentials.
  } finally {
    setStoredToken(null);
    setStoredUser(null);
  }
  return { success: true };
}

// --------------------------------------------------------------------
// Staff / users
// --------------------------------------------------------------------

export const fetchProfiles = () => call("get_profiles");
export const createCashier = (params) => call("create_cashier", params);
export const toggleUserActive = (params) => call("toggle_user_active", params);

// --------------------------------------------------------------------
// Categories
// --------------------------------------------------------------------

export const fetchCategories = () => call("get_categories");
export const createCategory = (name) => call("create_category", { name });
export const updateCategory = (id, name) => call("update_category", { id, name });
export const deleteCategory = (id) => call("delete_category", { id });

// --------------------------------------------------------------------
// Products
// --------------------------------------------------------------------

export const fetchProducts = () => call("get_products");
export const createProduct = (p) => call("create_product", p);
export const updateProduct = (p) => call("update_product", p);
export const toggleProductActive = (id, is_active) =>
  call("toggle_product_active", { id, is_active });
export const deleteProduct = (id) => call("delete_product", { id });
export const adjustStock = (params) => call("adjust_stock", params);
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const res = fetch(`${API_BASE}?action=upload_image`, {
    method: "POST",
    body: formData,
  }).then((r) => r.json());
  return res;
};

// --------------------------------------------------------------------
// Sales / transactions
// --------------------------------------------------------------------

export const fetchSales = (cashier_id) => call("get_sales", { cashier_id });
export const requestRefund = (id, reason) => call("request_refund", { id, reason });
export const approveRefund = (id) => call("approve_refund", { id });
export const processCheckout = (params) => call("process_checkout", params);

// --------------------------------------------------------------------
// Stock logs
// --------------------------------------------------------------------

export const fetchStockLogs = () => call("get_stock_logs");

export default { login, logout, getStoredUser, setStoredUser };