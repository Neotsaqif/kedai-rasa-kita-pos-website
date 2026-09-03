import React, { useState, useEffect } from "react";
import {
  History,
  Search,
  User,
  Eye,
  RotateCcw,
  CheckCircle2,
  X,
  Printer,
  Loader2,
} from "lucide-react";
import {
  fetchSales as apiFetchSales,
  fetchProfiles as apiFetchProfiles,
  requestRefund as apiRequestRefund,
  approveRefund as apiApproveRefund,
} from "../lib/data";
import { formatRupiah, formatDate } from "../lib/format";
import ReceiptModal from "./ReceiptModal";

export default function SalesHistory({ isAdmin, currentUserId }) {
  const [sales, setSales] = useState([]);
  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cashierFilter, setCashierFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedSale, setSelectedSale] = useState(null);
  const [printableSale, setPrintableSale] = useState(null);
  const [refundReasonInput, setRefundReasonInput] = useState("");
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const data = await apiFetchSales(isAdmin ? null : currentUserId);
      setSales(data || []);
    } catch (err) {
      console.error("Error loading sales:", err);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCashiers = async () => {
    try {
      const data = await apiFetchProfiles();
      setCashiers(data || []);
    } catch {
      setCashiers([]);
    }
  };

  useEffect(() => {
    fetchSales();
    if (isAdmin) fetchCashiers();
  }, [isAdmin, currentUserId]);

  const filteredSales = sales.filter((sale) => {
    const receiptNum = sale.receipt_number || `REC-${sale.id}`;
    const items = sale.transaction_items || [];
    const matchesSearch =
      receiptNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      items.some((i) =>
        (i.product_name || "").toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCashier =
      cashierFilter === "all" || sale.cashier_id === cashierFilter;
    const matchesStatus =
      statusFilter === "all" || sale.status === statusFilter;

    let matchesDate = true;
    const saleDate = new Date(sale.created_at || sale.timestamp);
    const now = new Date();

    if (dateRangeFilter === "today") {
      matchesDate = saleDate.toDateString() === now.toDateString();
    } else if (dateRangeFilter === "7days") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      matchesDate = saleDate >= sevenDaysAgo;
    } else if (dateRangeFilter === "month") {
      matchesDate =
        saleDate.getMonth() === now.getMonth() &&
        saleDate.getFullYear() === now.getFullYear();
    }

    return matchesSearch && matchesCashier && matchesStatus && matchesDate;
  });

  const handleRequestRefundSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSale || !refundReasonInput.trim()) return;

    try {
      await apiRequestRefund(selectedSale.id, refundReasonInput.trim());
      setIsRefundModalOpen(false);
      setRefundReasonInput("");
      setSelectedSale(null);
      await fetchSales();
    } catch (err) {
      alert(err.message || "Gagal mengajukan refund.");
    }
  };

  const handleApproveRefundClick = async (saleId) => {
    try {
      await apiApproveRefund(saleId);
      setSelectedSale(null);
      await fetchSales();
    } catch (err) {
      alert(err.message || "Gagal menyetujui refund.");
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 font-sans text-brand-900 bg-cream-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-cream-200 p-5 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-brand-500" />
            <h1 className="text-xl font-bold text-brand-900 font-serif-heading">
              Riwayat Transaksi Penjualan
            </h1>
          </div>
          <p className="text-xs text-brand-500/70 mt-1">
            {isAdmin
              ? "Melihat seluruh transaksi penjualan dari semua kasir dan persetujuan refund."
              : "Melihat transaksi penjualan yang Anda proses."}
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-cream-200 p-4 sm:p-5 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-brand-500/60 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            id="history-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari No Struk atau Nama Menu..."
            className="w-full bg-cream-100 text-brand-900 border border-cream-200 py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-brand-500/60"
          />
        </div>

        <select
          id="history-date-select"
          value={dateRangeFilter}
          onChange={(e) => setDateRangeFilter(e.target.value)}
          className="bg-cream-100 text-brand-900 border border-cream-200 px-4 py-2 text-xs focus:outline-none focus:border-brand-500 cursor-pointer"
        >
          <option value="all">Semua Tanggal</option>
          <option value="today">Hari Ini</option>
          <option value="7days">7 Hari Terakhir</option>
          <option value="month">Bulan Ini</option>
        </select>

        {isAdmin ? (
          <select
            id="history-cashier-select"
            value={cashierFilter}
            onChange={(e) => setCashierFilter(e.target.value)}
            className="bg-cream-100 text-brand-900 border border-cream-200 px-4 py-2 text-xs focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="all">Semua Kasir &amp; Staf</option>
            {cashiers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        ) : (
          <div className="bg-cream-100 border border-cream-200 px-4 py-2 text-xs text-brand-500 flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-brand-500" />
            <span>Kasir POS</span>
          </div>
        )}

        <select
          id="history-status-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-cream-100 text-brand-900 border border-cream-200 px-4 py-2 text-xs focus:outline-none focus:border-brand-500 cursor-pointer"
        >
          <option value="all">Semua Status Transaksi</option>
          <option value="completed">Selesai (Completed)</option>
          <option value="refund_requested">Pengajuan Refund</option>
          <option value="refunded">Di-Refund / Batal</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-cream-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-brand-900">
            <thead className="bg-cream-100 text-brand-500 font-semibold border-b border-cream-200 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">No. Struk</th>
                <th className="py-3.5 px-4">Waktu</th>
                <th className="py-3.5 px-4">Kasir</th>
                <th className="py-3.5 px-4">Item &amp; Menu</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Metode Bayar</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-brand-500/70 font-medium">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-brand-500" />
                    <span>Memuat riwayat transaksi...</span>
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-brand-500/70 font-medium">
                    Tidak ada riwayat transaksi penjualan.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const items = sale.transaction_items || [];
                  const itemCount = items.reduce(
                    (sum, i) => sum + (i.quantity || 0),
                    0
                  );
                  const receiptNum = sale.receipt_number || `KRK-TX-${sale.id}`;

                  return (
                    <tr key={sale.id} className="hover:bg-cream-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-500">
                        {receiptNum}
                      </td>
                      <td className="py-3.5 px-4 text-brand-500/70">
                        {formatDate(sale.created_at || sale.timestamp)}
                      </td>
                      <td className="py-3.5 px-4 text-brand-900 font-medium">
                        {sale.cashier_name || "Kasir"}
                      </td>
                      <td className="py-3.5 px-4 text-brand-500/70 max-w-xs truncate">
                        <span className="font-semibold text-brand-900">
                          {itemCount} items:
                        </span>{" "}
                        {items
                          .map((i) => `${i.product_name} (${i.quantity}x)`)
                          .join(", ")}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-brand-900">
                        {formatRupiah(sale.total_amount || sale.total || 0)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold uppercase text-brand-500">
                        {sale.payment_method || sale.paymentMethod}
                      </td>
                      <td className="py-3.5 px-4">
                        {sale.status === "completed" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Selesai
                          </span>
                        )}
                        {sale.status === "refund_requested" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                            Refund Diminta
                          </span>
                        )}
                        {sale.status === "refunded" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            Refunded / Batal
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-view-sale-${sale.id}`}
                            onClick={() => setSelectedSale(sale)}
                            title="Detail Rincian Item"
                            className="p-1.5 bg-cream-100 hover:bg-cream-200 border border-cream-200 text-brand-500 transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-print-sale-${sale.id}`}
                            onClick={() => setPrintableSale(sale)}
                            title="Cetak Ulang Struk"
                            className="p-1.5 bg-cream-100 hover:bg-cream-200 border border-cream-200 text-brand-500 transition-all cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sale Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-900/50 backdrop-blur-xs">
          <div className="bg-white border border-cream-200 w-full max-w-md overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 bg-cream-100 border-b border-cream-200">
              <div>
                <h3 className="text-base font-bold text-brand-900 font-serif-heading">
                  Rincian Transaksi {selectedSale.receipt_number || `KRK-TX-${selectedSale.id}`}
                </h3>
                <span className="text-xs text-brand-500/70">
                  {formatDate(selectedSale.created_at || selectedSale.timestamp)}
                </span>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="text-brand-500/70 hover:text-brand-900 p-1 hover:bg-cream-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-cream-100 p-3 border border-cream-200">
                <div>
                  <span className="text-brand-500/70 block">Kasir</span>
                  <span className="font-semibold text-brand-900">
                    {selectedSale.cashier_name || "Kasir"}
                  </span>
                </div>
                <div>
                  <span className="text-brand-500/70 block">Metode Bayar</span>
                  <span className="font-semibold uppercase text-brand-500">
                    {selectedSale.payment_method || selectedSale.paymentMethod}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-brand-500 uppercase mb-2">
                  Item Dibeli:
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(selectedSale.transaction_items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-cream-100/60 p-2.5 border border-cream-200"
                    >
                      <div>
                        <div className="font-semibold text-brand-900 font-serif-heading">
                          {item.product_name}
                        </div>
                        <div className="text-[11px] text-brand-500/70">
                          {item.quantity} x {formatRupiah(item.price_at_sale)}
                        </div>
                      </div>
                      <div className="font-bold text-brand-500">
                        {formatRupiah(item.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-cream-200 space-y-1">
                <div className="flex justify-between items-center text-sm font-extrabold text-brand-900">
                  <span>TOTAL PENJUALAN</span>
                  <span className="text-brand-500 font-serif-heading text-base">
                    {formatRupiah(selectedSale.total_amount || selectedSale.total || 0)}
                  </span>
                </div>
              </div>

              {selectedSale.notes && (
                <div className="p-3 bg-rose-50 border border-rose-200 space-y-1">
                  <span className="font-bold text-rose-800 block">Catatan / Refund:</span>
                  <p className="text-rose-900 italic">{selectedSale.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t border-cream-200 flex flex-col gap-2">
                {selectedSale.status === "completed" && (
                  <button
                    id="btn-trigger-refund-request"
                    onClick={() => setIsRefundModalOpen(true)}
                    className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Ajukan Refund / Pembatalan Transaksi
                  </button>
                )}

                {selectedSale.status === "refund_requested" && isAdmin && (
                  <button
                    id="btn-approve-refund"
                    onClick={() => handleApproveRefundClick(selectedSale.id)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Setujui Refund &amp; Kembalikan Stok
                  </button>
                )}

                <button
                  id="btn-print-from-modal"
                  onClick={() => {
                    setPrintableSale(selectedSale);
                    setSelectedSale(null);
                  }}
                  className="w-full py-2.5 bg-cream-100 hover:bg-cream-200 text-brand-500 border border-cream-200 font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" />
                  Cetak Ulang Struk Pembayaran
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Request Reason Modal */}
      {isRefundModalOpen && selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-900/50 backdrop-blur-xs">
          <div className="bg-white border border-cream-200 w-full max-w-md overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 bg-cream-100 border-b border-cream-200">
              <h3 className="text-base font-bold text-rose-700 font-serif-heading">
                Pengajuan Refund Transaksi
              </h3>
              <button
                onClick={() => setIsRefundModalOpen(false)}
                className="text-brand-500/70 hover:text-brand-900 p-1 hover:bg-cream-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestRefundSubmit} className="p-6 space-y-4 text-xs">
              <p className="text-brand-900">
                Pengajuan refund transaksi{" "}
                <strong className="text-brand-500">
                  {selectedSale.receipt_number || `KRK-TX-${selectedSale.id}`}
                </strong>{" "}
                memerlukan persetujuan Admin.
              </p>

              <div>
                <label className="block font-semibold text-brand-500 uppercase mb-1">
                  Alasan Pembatalan / Refund (Wajib)
                </label>
                <textarea
                  value={refundReasonInput}
                  onChange={(e) => setRefundReasonInput(e.target.value)}
                  placeholder="e.g. Pelanggan salah pesan / Pembayaran double / Pesanan dibatalkan"
                  rows={3}
                  className="w-full bg-cream-100 border border-cream-200 p-3 text-brand-900 focus:border-brand-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => setIsRefundModalOpen(false)}
                  className="px-4 py-2 border border-cream-200 text-brand-500 hover:bg-cream-100 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Kirim Pengajuan Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Component */}
      {printableSale && (
        <ReceiptModal
          receipt={printableSale}
          sale={printableSale}
          onClose={() => setPrintableSale(null)}
          onNewSale={() => setPrintableSale(null)}
        />
      )}
    </div>
  );
}
