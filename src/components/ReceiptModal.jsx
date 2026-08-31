import React from "react";
import { Printer, PlusCircle, X, CheckCircle2 } from "lucide-react";
import {
  formatRupiah,
  formatDateTime,
  paymentMethodLabel,
} from "../lib/format";

export default function ReceiptModal({ receipt, onNewSale }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-brand-900/10 overflow-hidden">
        {/* Success Header */}
        <div className="bg-green-50 border-b border-green-100 p-4 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
          <div>
            <h3 className="font-bold text-green-800">Pembayaran Berhasil</h3>
            <p className="text-xs text-green-600">Transaksi telah diproses</p>
          </div>
        </div>

        {/* Receipt Preview */}
        <div className="p-4 bg-cream-50">
          <div
            id="printable-receipt"
            className="bg-white mx-auto p-4 rounded-lg shadow-sm border border-gray-200 font-mono text-[11px] leading-relaxed text-gray-900"
            style={{ width: "80mm", maxWidth: "100%" }}
          >
            {/* Shop Header */}
            <div className="text-center border-b border-dashed border-gray-300 pb-2 mb-2">
              <p className="font-bold text-sm tracking-wide">KEDAI RASA KITA</p>
              <p className="text-[10px]">Jl. Rasa Kita No. 1, Indonesia</p>
              <p className="text-[10px]">Telp: 0812-3456-7890</p>
            </div>

            {/* Receipt Meta */}
            <div className="border-b border-dashed border-gray-300 pb-2 mb-2">
              <div className="flex justify-between">
                <span>No. Struk</span>
                <span className="font-semibold">{receipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal</span>
                <span>{formatDateTime(receipt.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir</span>
                <span>{receipt.cashierName || "Kasir"}</span>
              </div>
            </div>

            {/* Line Items */}
            <div className="border-b border-dashed border-gray-300 pb-2 mb-2">
              <div className="flex justify-between font-bold mb-1">
                <span>Item</span>
                <span>Subtotal</span>
              </div>
              {receipt.items.map((item, idx) => (
                <div key={idx} className="mb-1">
                  <p className="font-semibold">{item.name}</p>
                  <div className="flex justify-between text-[10px]">
                    <span>
                      {item.qty} x {formatRupiah(item.price)}
                    </span>
                    <span>{formatRupiah(Number(item.price) * item.qty)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-b border-dashed border-gray-300 pb-2 mb-2">
              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL</span>
                <span>{formatRupiah(receipt.totalAmount)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Metode</span>
                <span>{paymentMethodLabel(receipt.paymentMethod)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center">
              <p className="font-semibold">Terima kasih!</p>
              <p className="text-[10px]">
                Barang yang sudah dibeli tidak dapat ditukar
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-100 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Cetak Struk
          </button>
          <button
            onClick={onNewSale}
            className="flex-1 py-3 bg-white border border-brand-900/10 hover:bg-cream-50 text-gray-700 font-bold rounded-xl transition flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Transaksi Baru
          </button>
        </div>
      </div>
    </div>
  );
}
