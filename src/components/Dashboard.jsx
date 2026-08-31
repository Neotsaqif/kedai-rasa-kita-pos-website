import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Loader2,
  TrendingUp,
  Receipt,
  Trophy,
  Banknote,
  QrCode,
  CreditCard,
  ArrowLeftRight,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import {
  formatRupiah,
  formatShortDay,
  paymentMethodLabel,
} from "../lib/format";

const PAYMENT_ICONS = {
  cash: Banknote,
  qris: QrCode,
  debit: CreditCard,
  transfer: ArrowLeftRight,
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todayTransactions, setTodayTransactions] = useState(0);
  const [topProduct, setTopProduct] = useState(null);
  const [weeklySales, setWeeklySales] = useState([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState([]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);

      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 6);
      weekAgo.setHours(0, 0, 0, 0);

      // Fetch sales for today
      const [todayRes, weekRes, itemsRes] = await Promise.all([
        supabase
          .from("sales")
          .select("total_amount, payment_method")
          .eq("status", "completed")
          .gte("created_at", todayStart.toISOString()),
        supabase
          .from("sales")
          .select("total_amount, payment_method, created_at")
          .eq("status", "completed")
          .gte("created_at", weekAgo.toISOString()),
        supabase
          .from("sale_items")
          .select("product_name, qty")
          .order("qty", { ascending: false })
          .limit(1),
      ]);

      // Today's stats
      const todaySales = todayRes.data || [];
      setTodayRevenue(
        todaySales.reduce((sum, s) => sum + Number(s.total_amount), 0),
      );
      setTodayTransactions(todaySales.length);

      // Payment breakdown (today)
      const breakdownMap = {};
      todaySales.forEach((s) => {
        breakdownMap[s.payment_method] =
          (breakdownMap[s.payment_method] || 0) + Number(s.total_amount);
      });
      setPaymentBreakdown(
        Object.entries(breakdownMap).map(([method, total]) => ({
          method,
          total,
        })),
      );

      // Weekly sales (last 7 days)
      const weekSales = weekRes.data || [];
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const next = new Date(d);
        next.setDate(next.getDate() + 1);

        const dayTotal = weekSales
          .filter((s) => {
            const created = new Date(s.created_at);
            return created >= d && created < next;
          })
          .reduce((sum, s) => sum + Number(s.total_amount), 0);

        days.push({
          date: d,
          total: dayTotal,
        });
      }
      setWeeklySales(days);

      // Top product
      const top = itemsRes.data?.[0];
      setTopProduct(top || null);
    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const maxWeekly = Math.max(...weeklySales.map((d) => d.total), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Memuat dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-brand-900/10 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-brand-600" />
          Dashboard
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Ringkasan performa penjualan Kedai Rasa Kita
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-brand-900/10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-50 rounded-xl">
              <TrendingUp className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">
                Pendapatan Hari Ini
              </p>
              <p className="text-xl font-extrabold text-gray-900">
                {formatRupiah(todayRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-brand-900/10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-xl">
              <Receipt className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">
                Total Transaksi Hari Ini
              </p>
              <p className="text-xl font-extrabold text-gray-900">
                {todayTransactions} transaksi
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-brand-900/10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 rounded-xl">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">
                Produk Terlaris
              </p>
              <p className="text-xl font-extrabold text-gray-900 truncate">
                {topProduct?.product_name || "Belum ada data"}
              </p>
              {topProduct && (
                <p className="text-xs text-gray-400">
                  {topProduct.qty} terjual
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-brand-900/10 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">
          Penjualan 7 Hari Terakhir
        </h3>
        <div className="flex items-end gap-3 h-48">
          {weeklySales.map((day, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-[10px] font-semibold text-gray-500">
                {day.total > 0 ? formatRupiah(day.total) : ""}
              </span>
              <div
                className={`w-full rounded-t-lg transition-all ${
                  day.total > 0
                    ? "bg-brand-500 hover:bg-brand-600"
                    : "bg-cream-200"
                }`}
                style={{
                  height: `${Math.max((day.total / maxWeekly) * 100, 4)}%`,
                }}
              />
              <span className="text-[10px] font-semibold text-gray-500">
                {formatShortDay(day.date)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-brand-900/10 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">
          Rincian Metode Pembayaran (Hari Ini)
        </h3>
        {paymentBreakdown.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            Belum ada transaksi hari ini.
          </p>
        ) : (
          <div className="space-y-3">
            {paymentBreakdown.map((item) => {
              const Icon = PAYMENT_ICONS[item.method] || Banknote;
              const pct =
                todayRevenue > 0
                  ? Math.round((item.total / todayRevenue) * 100)
                  : 0;
              return (
                <div key={item.method} className="flex items-center gap-3">
                  <div className="p-2 bg-cream-100 rounded-lg">
                    <Icon className="w-4 h-4 text-brand-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-gray-700">
                        {paymentMethodLabel(item.method)}
                      </span>
                      <span className="font-bold text-gray-900">
                        {formatRupiah(item.total)}
                        <span className="text-xs text-gray-400 font-medium ml-1">
                          ({pct}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-2 bg-cream-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
