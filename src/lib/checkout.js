import { supabase } from "./supabase";

/**
 * Generate a receipt number in the format KRK-YYYYMMDD-XXXX
 * @returns {string}
 */
export function generateReceiptNumber() {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  const seqPart = String(Math.floor(1000 + Math.random() * 9000));

  return `KRK-${datePart}-${seqPart}`;
}

/**
 * Process a checkout via the process_checkout RPC.
 * Atomically creates the sale, sale items, decrements stock, and logs stock changes.
 *
 * @param {Array} cart - Array of { id, name, price, qty }
 * @param {string} paymentMethod - 'cash' | 'qris' | 'debit' | 'transfer'
 * @param {string} cashierId - UUID of the logged-in user
 * @returns {Promise<{ saleId: number, receiptNumber: string }>}
 */
export async function processCheckout(cart, paymentMethod, cashierId) {
  const receiptNumber = generateReceiptNumber();
  const totalAmount = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.qty,
    0,
  );

  const items = cart.map((item) => ({
    product_id: item.id,
    product_name: item.name,
    qty: item.qty,
    price: Number(item.price),
  }));

  const { data, error } = await supabase.rpc("process_checkout", {
    p_receipt_number: receiptNumber,
    p_cashier_id: cashierId,
    p_total_amount: totalAmount,
    p_payment_method: paymentMethod,
    p_items: items,
  });

  if (error) {
    throw new Error(error.message || "Gagal memproses pembayaran");
  }

  return { saleId: data, receiptNumber };
}
