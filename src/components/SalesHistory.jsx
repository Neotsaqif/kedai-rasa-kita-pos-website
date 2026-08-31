import React, { useState, useEffect } from "react";
import {
  History,
  Loader2,
  Search,
  Calendar,
  User,
  X,
  Receipt,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import {
  formatRupiah,
  formatDateTime,
  paymentMethodLabel,
  statusLabel,
} from "../lib/format";

export default function SalesHistory({ isAdmin, currentUserId }) {
  const [sales, setSales] = useState([]);
  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCashier, setSelectedCashier] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailItems, setDetailItems] = useState([]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("sales")
        .select("*, profiles(name)")
        .order("created_at", { ascending: false });

      if (!isAdmin && currentUserId) {
        query = query.eq("cashier_id", currentUserId);
      }

      const { data, error } = await query;
      if (error) throw error;
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
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name")
        .eq("role", "cashier")
        .order("name", { ascending: true });
      if (error) throw error;
      setCashiers(data || []);
    } catch {
      setCashiers([]);
    }
  };

  useEffect(() => {
    fetchSales();
    if (isAdmin) fetchCashiers();
  }, [isAdmin, currentUserId]);

  const fetchSaleDetail = async (sale) => {
    setSelectedSale(sale);
    setDetailLoading(true);
    try {
      const { data, error } = await supabase
        .from("sale_items")
        .select("*")
        .eq("sale_id", sale.id);
      if (error) throw error;
      setDetailItems(data || []);
    } catch {
      setDetailItems([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.profiles?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesCashier =
      selectedCashier === "all" || sale.cashier_id === selectedCashier;

    let matchesDate = true;
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      matchesDate = matchesDate && new Date(sale.created_at) >= from;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && new Date(sale.created_at) <= to;
    }

    return matchesSearch && matchesCashier && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-brand-900/10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <History className="w-5 h-5 text-brand-600" />
            Riwayat Penjualan
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {isAdmin
              ? "Semua transaksi dari seluruh kasir"
              : "Riwayat transaksi Anda"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari no. struk atau kasir..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-brand-900/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
          />
        </div>

        {isAdmin && (
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedCashier}
              onChange={(e) => setSelectedCashier(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-brand-900/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm appearance-none"
            >
              <option value="all">Semua Kasir</option>
              {cashiers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="relative">
          <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-brand-900/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
          />
        </div>

        <div className="relative">
          <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-brand-900/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Memuat riwayat...</span>
        </div>
      ) : filteredSales.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-brand-900/10 shadow-sm text-gray-500 text-sm">
          <Receipt className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p>Belum ada transaksi.</p>
          <p className="text-xs text-gray-400 mt-1">
            Transaksi yang diproses akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-brand-900/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-cream-50 text-xs font-semibold text-gray-700 uppercase border-b border-brand-900/10">
                <tr>
                  <th className="px-6 py-4">No. Struk</th>
                  <th className="px-6 py-4">Kasir</th>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Item</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Metode</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSales.map((sale) => (
                  <tr
                    key={sale.id}
                    onClick={() => fetchSaleDetail(sale)}
                    className="hover:bg-cream-50/50 transition cursor-pointer"
                  >
                    <td className="px-6 py-4 font-semibold text-brand-600">
                      {sale.receipt_number}
                    </td>
                    <td className="px-6 py-4">
                      {sale.profiles?.name || "Kasir"}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {formatDateTime(sale.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-cream-100 text-brand-900 text-xs font-medium rounded-lg">
                        {sale.item_count ?? "-"} item
                      </span>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-gray-900">
                      {formatRupiah(sale.total_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-brand-50 text-brand-700 text-xs font-medium rounded-lg">
                        {paymentMethodLabel(sale.payment_method)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          sale.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {statusLabel(sale.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-brand-900/10 overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">Detail Transaksi</h3>
                <p className="text-xs text-brand-600 font-semibold mt-0.5">
                  {selectedSale.receipt_number}
                </p>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Kasir</p>
                  <p className="font-semibold text-gray-800">
                    {selectedSale.profiles?.name || "Kasir"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Tanggal</p>
                  <p className="font-semibold text-gray-800">
                    {formatDateTime(selectedSale.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Metode</p>
                  <p className="font-semibold text-gray-800">
                    {paymentMethodLabel(selectedSale.payment_method)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <p className="font-semibold text-gray-800">
                    {statusLabel(selectedSale.status)}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Item
                </p>
                {detailLoading ? (
                  <div className="flex items-center justify-center p-6 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    <span className="text-xs">Memuat item...</span>
                  </div>
                ) : detailItems.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">
                    Tidak ada item.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {detailItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center text-sm"
                      >
                        <div>
                          <p className="font-semibold text-gray-800">
                            {item.product_name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {item.qty} x {formatRupiah(item.price_at_sale)}
                          </p>
                        </div>
                        <span className="font-bold text-gray-900">
                          {formatRupiah(Number(item.price_at_sale) * item.qty)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                <span className="font-bold text-gray-800">Total</span>
                <span className="text-xl font-extrabold text-brand-600">
                  {formatRupiah(selectedSale.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
