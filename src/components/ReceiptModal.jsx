import React from "react";
import { Printer, PlusCircle, X, CheckCircle2 } from "lucide-react";
import {
  formatRupiah,
  formatDate,
  paymentMethodLabel,
} from "../lib/format";

export default function ReceiptModal({ receipt, sale, onClose, onNewSale }) {
  const currentReceipt = receipt || sale;
  if (!currentReceipt) return null;

  const receiptNum =
    currentReceipt.receiptNumber ||
    currentReceipt.receipt_number ||
    `KRK-TX-${currentReceipt.id}`;
  const total =
    currentReceipt.totalAmount ||
    currentReceipt.total_amount ||
    currentReceipt.total ||
    0;
  const items = currentReceipt.items || currentReceipt.transaction_items || [];
  const createdAt = currentReceipt.createdAt || currentReceipt.created_at || new Date();
  const cashierName = currentReceipt.cashierName || currentReceipt.cashier_name || "Kasir POS";
  const payMethod = currentReceipt.paymentMethod || currentReceipt.payment_method || "cash";

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    if (onNewSale) onNewSale();
    else if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-900/50 backdrop-blur-xs">
      <div className="bg-white border border-cream-200 w-full max-w-md overflow-hidden shadow-xl font-sans text-brand-900">
        {/* Success Header */}
        <div className="bg-emerald-50 border-b border-emerald-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-bold text-emerald-900 font-serif-heading text-sm">
                Transaksi Berhasil
              </h3>
              <p className="text-[11px] text-emerald-700">Struk siap dicetak</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-emerald-800 hover:bg-emerald-100 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Thermal Paper Simulation */}
        <div className="p-6 bg-cream-50 overflow-y-auto max-h-[70vh]">
          <div
            id="printable-receipt"
            className="bg-white mx-auto p-5 shadow-xs border border-cream-200 font-mono text-[11px] leading-relaxed text-brand-900"
            style={{ width: "80mm", maxWidth: "100%" }}
          >
            {/* Shop Branding Header */}
            <div className="text-center border-b border-dashed border-cream-300 pb-3 mb-3">
              <p className="font-bold text-base tracking-wide font-serif-heading text-brand-900">
                KEDAI RASA KITA
              </p>
              <p className="text-[10px] text-brand-500/70">
                Kopi &amp; Masakan Nusantara
              </p>
              <p className="text-[10px] text-brand-500/70 mt-1">
                Jl. Rasa Kita No. 1, Jakarta
              </p>
              <p className="text-[10px] text-brand-500/70">Telp: 0812-3456-7890</p>
            </div>

            {/* Receipt Metadata */}
            <div className="border-b border-dashed border-cream-300 pb-3 mb-3 space-y-1">
              <div className="flex justify-between">
                <span>No. Struk</span>
                <span className="font-bold">{receiptNum}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal</span>
                <span>{formatDate(createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir</span>
                <span>{cashierName}</span>
              </div>
            </div>

            {/* Purchased Items List */}
            <div className="border-b border-dashed border-cream-300 pb-3 mb-3">
              <div className="flex justify-between font-bold mb-1.5 border-b border-cream-100 pb-1">
                <span>Menu Items</span>
                <span>Subtotal</span>
              </div>
              {items.map((item, idx) => {
                const name = item.name || item.product_name;
                const qty = item.qty || item.quantity;
                const price = item.price || item.price_at_sale;
                const itemSubtotal = item.subtotal || Number(price) * qty;

                return (
                  <div key={idx} className="mb-1.5">
                    <p className="font-semibold">{name}</p>
                    <div className="flex justify-between text-[10px] text-brand-500/80">
                      <span>
                        {qty} x {formatRupiah(price)}
                      </span>
                      <span>{formatRupiah(itemSubtotal)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment Summary */}
            <div className="border-b border-dashed border-cream-300 pb-3 mb-3 space-y-1">
              <div className="flex justify-between font-bold text-sm text-brand-900 pt-1">
                <span>TOTAL</span>
                <span className="font-serif-heading">{formatRupiah(total)}</span>
              </div>
              <div className="flex justify-between text-brand-500/80 pt-1">
                <span>Metode Pembayaran</span>
                <span className="uppercase font-semibold">
                  {paymentMethodLabel(payMethod)}
                </span>
              </div>
              {payMethod === "cash" && currentReceipt.cashPaid !== undefined && (
                <>
                  <div className="flex justify-between text-brand-500/80">
                    <span>Tunai Diterima</span>
                    <span>{formatRupiah(currentReceipt.cashPaid)}</span>
                  </div>
                  <div className="flex justify-between text-brand-500/80">
                    <span>Kembalian</span>
                    <span>{formatRupiah(currentReceipt.change || 0)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Footer Message */}
            <div className="text-center pt-2 space-y-1">
              <p className="font-bold text-brand-900 font-serif-heading">
                Terima kasih atas kunjungan Anda!
              </p>
              <p className="text-[9px] text-brand-500/60">
                Barang yang sudah dibeli tidak dapat ditukar/dikembalikan
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-cream-200 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 bg-brand-500 hover:bg-brand-900 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak Struk
          </button>
          <button
            onClick={handleClose}
            className="flex-1 py-3 bg-cream-100 border border-cream-200 hover:bg-cream-200 text-brand-500 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Transaksi Baru
          </button>
        </div>
      </div>
    </div>
  );
}
