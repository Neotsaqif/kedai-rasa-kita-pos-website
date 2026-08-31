// Formatting helpers for Kedai Rasa Kita POS

/**
 * Format a number as Indonesian Rupiah: "Rp 15.000"
 * @param {number|string} value
 * @returns {string}
 */
export function formatRupiah(value) {
  const num = Number(value || 0);
  return `Rp ${num.toLocaleString("id-ID")}`;
}

/**
 * Format a number without the Rp prefix: "15.000"
 * @param {number|string} value
 * @returns {string}
 */
export function formatNumber(value) {
  const num = Number(value || 0);
  return num.toLocaleString("id-ID");
}

/**
 * Format a date/time for Indonesian locale: "31/08/2026 13:45"
 * @param {string|Date} value
 * @returns {string}
 */
export function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a date for Indonesian locale: "31/08/2026"
 * @param {string|Date} value
 * @returns {string}
 */
export function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Format a short day name for charts: "Sen", "Sel", etc.
 * @param {string|Date} value
 * @returns {string}
 */
export function formatShortDay(value) {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString("id-ID", { weekday: "short" });
}

export function formatDateShort(value) {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

/**
 * Map payment method key to Indonesian label
 * @param {string} method
 * @returns {string}
 */
export function paymentMethodLabel(method) {
  const labels = {
    cash: "Tunai",
    qris: "QRIS",
    debit: "Debit",
    transfer: "Transfer",
  };
  return labels[method] || method || "-";
}

/**
 * Map status key to Indonesian label
 * @param {string} status
 * @returns {string}
 */
export function statusLabel(status) {
  const labels = {
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };
  return labels[status] || status || "-";
}
