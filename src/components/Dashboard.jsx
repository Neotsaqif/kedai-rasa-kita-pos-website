import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { formatRupiah, formatDateShort, formatDate } from "../lib/format";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CreditCard,
  Award,
  AlertTriangle,
  History,
  Loader2,
} from "lucide-react";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [stockLogs, setStockLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("analytics");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch sales with items
      const { data: salesData, error: salesErr } = await supabase
        .from("transactions")
        .select(`
          id,
          total_amount,
          payment_method,
          status,
          created_at,
          transaction_items (
            product_id,
            product_name,
            quantity,
            price_at_sale,
            subtotal
          )
        `)
        .order("created_at", { ascending: false });

      if (salesErr) console.error("Error fetching sales:", salesErr);

      // Fetch products
      const { data: prodData, error: prodErr } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });

      if (prodErr) console.error("Error fetching products:", prodErr);

      // Fetch stock logs if table exists
      const { data: logsData, error: logsErr } = await supabase
        .from("stock_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (logsErr && logsErr.code !== "42P01") console.error("Error fetching logs:", logsErr);

      setSales(salesData || []);
      setProducts(prodData || []);
      setStockLogs(logsData || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-brand-900 font-semibold gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
        <span>Memuat Laporan & Analytics...</span>
      </div>
    );
  }

  const completedSales = sales.filter((s) => s.status === "completed");

  const now = new Date();
  const todayStr = now.toDateString();

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Revenue calculations
  const revenueToday = completedSales
    .filter((s) => new Date(s.created_at).toDateString() === todayStr)
    .reduce((sum, s) => sum + (s.total_amount || 0), 0);

  const revenueThisWeek = completedSales
    .filter((s) => new Date(s.created_at) >= startOfWeek)
    .reduce((sum, s) => sum + (s.total_amount || 0), 0);

  const revenueThisMonth = completedSales
    .filter((s) => new Date(s.created_at) >= startOfMonth)
    .reduce((sum, s) => sum + (s.total_amount || 0), 0);

  const totalTransactions = completedSales.length;
  const avgOrderValue =
    totalTransactions > 0 ? Math.round(revenueThisMonth / totalTransactions) : 0;

  // Breakdown by payment method
  const paymentBreakdown = {
    cash: completedSales
      .filter((s) => s.payment_method === "cash")
      .reduce((sum, s) => sum + (s.total_amount || 0), 0),
    qris: completedSales
      .filter((s) => s.payment_method === "qris")
      .reduce((sum, s) => sum + (s.total_amount || 0), 0),
    debit: completedSales
      .filter((s) => s.payment_method === "debit")
      .reduce((sum, s) => sum + (s.total_amount || 0), 0),
    transfer: completedSales
      .filter((s) => s.payment_method === "transfer")
      .reduce((sum, s) => sum + (s.total_amount || 0), 0),
  };

  const pieData = [
    { name: "Tunai (Cash)", value: paymentBreakdown.cash, color: "#5A5A40" },
    { name: "QRIS", value: paymentBreakdown.qris, color: "#8a8a80" },
    { name: "Kartu Debit", value: paymentBreakdown.debit, color: "#78785c" },
    { name: "Transfer Bank", value: paymentBreakdown.transfer, color: "#a0a090" },
  ].filter((d) => d.value > 0);

  // Daily sales trend chart data (Last 7 Days)
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toDateString();

    const daySales = completedSales.filter(
      (s) => new Date(s.created_at).toDateString() === dStr
    );
    const dayTotal = daySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);

    return {
      date: formatDateShort(d.toISOString()),
      Omset: dayTotal,
      Transaksi: daySales.length,
    };
  });

  // Best selling products leaderboard
  const productSalesMap = {};
  completedSales.forEach((s) => {
    (s.transaction_items || []).forEach((item) => {
      const pId = item.product_id || item.product_name;
      if (!productSalesMap[pId]) {
        productSalesMap[pId] = {
          name: item.product_name || "Produk",
          qty: 0,
          revenue: 0,
        };
      }
      productSalesMap[pId].qty += item.quantity || 0;
      productSalesMap[pId].revenue += item.subtotal || 0;
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Low stock alert items (< 10 units)
  const lowStockItems = products.filter(
    (p) => p.is_active !== false && (p.stock || 0) <= 10
  );

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 font-sans text-brand-900 bg-cream-50">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-cream-200 p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-brand-500" />
            <h1 className="text-xl font-bold text-brand-900 font-serif-heading">
              Laporan Penjualan &amp; Analytics
            </h1>
          </div>
          <p className="text-xs text-brand-500/70 mt-1">
            Ringkasan omset, performa produk terlaris, distribusi metode bayar, dan log audit stok.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-cream-100 p-1 border border-cream-200">
          <button
            id="report-tab-analytics"
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "bg-brand-500 text-white font-bold shadow-xs"
                : "text-brand-500/70 hover:text-brand-900"
            }`}
          >
            Laporan Omset &amp; Grafik
          </button>
          <button
            id="report-tab-audit"
            onClick={() => setActiveTab("stock_logs")}
            className={`px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "stock_logs"
                ? "bg-brand-500 text-white font-bold shadow-xs"
                : "text-brand-500/70 hover:text-brand-900"
            }`}
          >
            Log Audit Stok ({stockLogs.length})
          </button>
        </div>
      </div>

      {activeTab === "analytics" ? (
        <>
          {/* Low Stock Warning Alert */}
          {lowStockItems.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 p-4 flex items-center justify-between gap-4 text-amber-900 text-xs">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                <div>
                  <strong className="font-bold text-amber-950">
                    Peringatan Stok Menipis ({lowStockItems.length} produk)!
                  </strong>{" "}
                  <span>
                    {lowStockItems
                      .map((p) => `${p.name} (Sisa ${p.stock})`)
                      .join(", ")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-cream-200 p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-brand-500/70 text-xs">
                <span>Omset Hari Ini</span>
                <DollarSign className="w-4 h-4 text-brand-500" />
              </div>
              <div className="text-xl font-extrabold text-brand-900 font-serif-heading">
                {formatRupiah(revenueToday)}
              </div>
              <div className="text-[11px] text-brand-500/70">
                Penjualan realtime hari ini
              </div>
            </div>

            <div className="bg-white border border-cream-200 p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-brand-500/70 text-xs">
                <span>Omset Minggu Ini</span>
                <TrendingUp className="w-4 h-4 text-brand-500" />
              </div>
              <div className="text-xl font-extrabold text-brand-900 font-serif-heading">
                {formatRupiah(revenueThisWeek)}
              </div>
              <div className="text-[11px] text-brand-500/70">
                Total pendapatan minggu berjalan
              </div>
            </div>

            <div className="bg-white border border-cream-200 p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-brand-500/70 text-xs">
                <span>Omset Bulan Ini</span>
                <ShoppingBag className="w-4 h-4 text-brand-500" />
              </div>
              <div className="text-xl font-extrabold text-brand-900 font-serif-heading">
                {formatRupiah(revenueThisMonth)}
              </div>
              <div className="text-[11px] text-brand-500/70">
                Akumulasi pendapatan bulan ini
              </div>
            </div>

            <div className="bg-white border border-cream-200 p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-brand-500/70 text-xs">
                <span>Total Transaksi</span>
                <CreditCard className="w-4 h-4 text-brand-500" />
              </div>
              <div className="text-xl font-extrabold text-brand-900 font-serif-heading">
                {totalTransactions} Transaksi
              </div>
              <div className="text-[11px] text-brand-500/70">
                Rata-rata: {formatRupiah(avgOrderValue)}/order
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Trend Bar Chart */}
            <div className="lg:col-span-2 bg-white border border-cream-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-brand-900 font-serif-heading">
                  Tren Penjualan Harian (7 Hari Terakhir)
                </h3>
                <span className="text-[11px] text-brand-500/70">
                  Statistik Omset
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={last7DaysData}>
                    <XAxis
                      dataKey="date"
                      stroke="#8a8a80"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#8a8a80"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `Rp ${val / 1000}k`}
                    />
                    <Tooltip
                      formatter={(val) => [formatRupiah(Number(val)), "Omset"]}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderColor: "#E2DBD0",
                        fontSize: "12px",
                        color: "#2B2B1E",
                      }}
                    />
                    <Bar dataKey="Omset" fill="#5A5A40" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Payment Method Pie Distribution */}
            <div className="bg-white border border-cream-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-brand-900 font-serif-heading">
                Metode Pembayaran
              </h3>
              {pieData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-xs text-brand-500/70">
                  Belum ada data pembayaran.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={4}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val) => [formatRupiah(Number(val)), "Total"]}
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            borderColor: "#E2DBD0",
                            fontSize: "12px",
                            color: "#2B2B1E",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {pieData.map((d) => (
                      <div
                        key={d.name}
                        className="flex items-center justify-between text-brand-500/70"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: d.color }}
                          />
                          <span>{d.name}</span>
                        </div>
                        <span className="font-bold text-brand-900">
                          {formatRupiah(d.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Top Selling Products Leaderboard */}
          <div className="bg-white border border-cream-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-500" />
              <h3 className="text-sm font-bold text-brand-900 font-serif-heading">
                Produk Terlaris (Best Seller)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-brand-900">
                <thead className="bg-cream-100 text-brand-500 font-semibold border-b border-cream-200 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Peringkat</th>
                    <th className="py-3 px-4">Nama Produk</th>
                    <th className="py-3 px-4">Jumlah Terjual</th>
                    <th className="py-3 px-4 text-right">Total Pendapatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  {topProducts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-brand-500/70 font-medium"
                      >
                        Belum ada produk terjual.
                      </td>
                    </tr>
                  ) : (
                    topProducts.map((p, idx) => (
                      <tr key={idx} className="hover:bg-cream-100/50">
                        <td className="py-3 px-4 font-bold text-brand-500/70">
                          <span
                            className={`w-6 h-6 inline-flex items-center justify-center text-xs ${
                              idx === 0
                                ? "bg-brand-500 text-white font-extrabold"
                                : idx === 1
                                ? "bg-brand-500/70 text-white font-bold"
                                : idx === 2
                                ? "bg-brand-500/50 text-white font-bold"
                                : "bg-cream-200 text-brand-900"
                            }`}
                          >
                            #{idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-brand-900 font-serif-heading">
                          {p.name}
                        </td>
                        <td className="py-3 px-4 font-bold text-brand-500">
                          {p.qty} porsi / unit
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-brand-500 font-serif-heading">
                          {formatRupiah(p.revenue)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Stock Audit Logs Tab */
        <div className="bg-white border border-cream-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-brand-500" />
              <h3 className="text-sm font-bold text-brand-900 font-serif-heading">
                Riwayat Mutasi &amp; Penyesuaian Stok
              </h3>
            </div>
            <span className="text-xs text-brand-500/70">Audit Trail Lengkap</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-900">
              <thead className="bg-cream-100 text-brand-500 font-semibold border-b border-cream-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Nama Produk</th>
                  <th className="py-3 px-4">Perubahan Stok</th>
                  <th className="py-3 px-4">Alasan (Reason)</th>
                  <th className="py-3 px-4">Petugas / User</th>
                  <th className="py-3 px-4">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {stockLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-brand-500/70 font-medium"
                    >
                      Belum ada catatan log stok.
                    </td>
                  </tr>
                ) : (
                  stockLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-cream-100/50">
                      <td className="py-3 px-4 text-brand-500/70">
                        {formatDate(log.created_at || log.timestamp)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-brand-900 font-serif-heading">
                        {log.product_name || log.productName}
                      </td>
                      <td className="py-3 px-4 font-bold">
                        <span
                          className={`px-2.5 py-1 text-[11px] ${
                            (log.quantity_change || log.quantityChange) > 0
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-rose-100 text-rose-800 border border-rose-200"
                          }`}
                        >
                          {(log.quantity_change || log.quantityChange) > 0
                            ? `+${log.quantity_change || log.quantityChange}`
                            : log.quantity_change || log.quantityChange}{" "}
                          Unit
                        </span>
                      </td>
                      <td className="py-3 px-4 uppercase font-semibold text-brand-500">
                        {log.reason === "sale"
                          ? "Penjualan POS"
                          : log.reason === "adjustment"
                          ? "Penyesuaian Manual"
                          : "Refund / Batal"}
                      </td>
                      <td className="py-3 px-4 text-brand-900">
                        {log.user_name || log.userName || "System"}
                      </td>
                      <td className="py-3 px-4 text-brand-500/70 italic">
                        {log.note || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
