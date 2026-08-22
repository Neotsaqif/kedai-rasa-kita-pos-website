import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DateFilterRange } from '../../types';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { formatRupiah } from '../../utils/formatters';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  TrendingUp, DollarSign, ShoppingCart, Award,
  PieChart as PieIcon, BarChart3, AlertTriangle
} from 'lucide-react';

const PAYMENT_COLORS: Record<string, string> = {
  CASH: '#18181b', // zinc-900
  QRIS: '#ea580c', // orange-600
  DEBIT: '#2563eb', // blue-600
  TRANSFER: '#059669', // emerald-600
};

export const ReportsPage: React.FC = () => {
  const { currentUser, transactions } = useApp();

  const [dateRange, setDateRange] = useState<DateFilterRange>('THIS_MONTH');

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-zinc-200">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-zinc-900">Restricted Access</h3>
        <p className="text-xs text-zinc-500 mt-1">Financial and sales analytics are only accessible by Admin.</p>
      </div>
    );
  }

  // Filter transactions based on dateRange
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    return transactions.filter(t => {
      if (t.status === 'CANCELLED') return false;

      const tDate = new Date(t.date);

      if (dateRange === 'TODAY') {
        return t.date.startsWith(todayStr);
      }
      if (dateRange === 'THIS_WEEK') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return tDate >= weekAgo;
      }
      if (dateRange === 'THIS_MONTH') {
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        return tDate >= monthAgo;
      }
      return true;
    });
  }, [transactions, dateRange]);

  // Summary Metrics
  const totalRevenue = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + t.total, 0);
  }, [filteredTransactions]);

  const totalTransactionsCount = filteredTransactions.length;
  
  const averageTransactionValue = totalTransactionsCount > 0 
    ? Math.round(totalRevenue / totalTransactionsCount) 
    : 0;

  // Best seller in filtered range
  const productStats = useMemo(() => {
    const stats: Record<string, { name: string; quantity: number; revenue: number; category: string }> = {};

    filteredTransactions.forEach(t => {
      t.items.forEach(item => {
        if (!stats[item.productId]) {
          stats[item.productId] = {
            name: item.productName,
            quantity: 0,
            revenue: 0,
            category: item.category,
          };
        }
        stats[item.productId].quantity += item.quantity;
        stats[item.productId].revenue += item.subtotal;
      });
    });

    return Object.values(stats).sort((a, b) => b.quantity - a.quantity);
  }, [filteredTransactions]);

  const bestSeller = productStats[0] || { name: 'No data yet', quantity: 0, revenue: 0 };

  // 1. Sales Trend Data
  const salesTrendData = useMemo(() => {
    const grouped: Record<string, { label: string; total: number; count: number }> = {};

    filteredTransactions.forEach(t => {
      const dateKey = t.date.slice(0, 10);
      const formattedLabel = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' }).format(new Date(t.date));

      if (!grouped[dateKey]) {
        grouped[dateKey] = { label: formattedLabel, total: 0, count: 0 };
      }
      grouped[dateKey].total += t.total;
      grouped[dateKey].count += 1;
    });

    const result = Object.values(grouped);
    if (result.length === 1) {
      return [
        { label: 'Start', total: 0, count: 0 },
        ...result,
      ];
    }
    return result;
  }, [filteredTransactions]);

  // 2. Payment Method Data for Pie Chart
  const paymentMethodData = useMemo(() => {
    const counts: Record<string, number> = { CASH: 0, QRIS: 0, DEBIT: 0, TRANSFER: 0 };
    
    filteredTransactions.forEach(t => {
      counts[t.paymentMethod] = (counts[t.paymentMethod] || 0) + t.total;
    });

    return Object.entries(counts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value,
        color: PAYMENT_COLORS[name] || '#71717a',
      }));
  }, [filteredTransactions]);

  // 3. Top 5 Products Bar Chart Data
  const topProductsChartData = useMemo(() => {
    return productStats.slice(0, 5).map(p => ({
      name: p.name.length > 15 ? p.name.substring(0, 14) + '...' : p.name,
      portions: p.quantity,
      revenue: p.revenue,
    }));
  }, [productStats]);

  // Category Breakdown Data
  const categoryStats = useMemo(() => {
    const cats: Record<string, { revenue: number; quantity: number }> = {};
    filteredTransactions.forEach(t => {
      t.items.forEach(i => {
        if (!cats[i.category]) cats[i.category] = { revenue: 0, quantity: 0 };
        cats[i.category].revenue += i.subtotal;
        cats[i.category].quantity += i.quantity;
      });
    });
    return Object.entries(cats).map(([category, data]) => ({
      category,
      revenue: data.revenue,
      quantity: data.quantity,
      percentage: totalRevenue > 0 ? Math.round((data.revenue / totalRevenue) * 100) : 0,
    })).sort((a, b) => b.revenue - a.revenue);
  }, [filteredTransactions, totalRevenue]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
            Sales & Revenue Reports
          </h2>
          <p className="text-xs text-zinc-500">
            Revenue metrics, product performance, and payment distributions
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center bg-zinc-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'TODAY' as DateFilterRange, label: 'Today' },
            { id: 'THIS_WEEK' as DateFilterRange, label: '7 Days' },
            { id: 'THIS_MONTH' as DateFilterRange, label: '30 Days' },
            { id: 'CUSTOM' as DateFilterRange, label: 'All Time' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setDateRange(tab.id)}
              className={`flex-1 sm:flex-initial whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                dateRange === tab.id 
                  ? 'bg-white text-zinc-900 shadow-xs' 
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <StatCard
          title="Gross Revenue"
          value={formatRupiah(totalRevenue)}
          subtitle={dateRange === 'TODAY' ? 'Today' : dateRange === 'THIS_WEEK' ? 'Last 7 Days' : 'Last 30 Days'}
          icon={<DollarSign className="w-4 h-4 text-orange-600" />}
          highlight
        />

        <StatCard
          title="Orders"
          value={`${totalTransactionsCount}`}
          subtitle="Completed"
          icon={<ShoppingCart className="w-4 h-4 text-zinc-600" />}
        />

        <StatCard
          title="Avg Basket"
          value={formatRupiah(averageTransactionValue)}
          subtitle="Per order"
          icon={<TrendingUp className="w-4 h-4 text-zinc-600" />}
        />

        <StatCard
          title="Best Seller"
          value={bestSeller.name}
          subtitle={`${bestSeller.quantity} portions`}
          icon={<Award className="w-4 h-4 text-amber-500" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Sales Trend Over Time */}
        <Card className="lg:col-span-2 space-y-3" padding="md">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-zinc-900">
                Revenue Over Time
              </h3>
              <p className="text-[11px] text-zinc-500">
                Daily sales trend
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </div>

          <div className="h-56 w-full">
            {salesTrendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-zinc-400">
                No sales data in this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                  <XAxis dataKey="label" stroke="#a1a1aa" fontSize={10} />
                  <YAxis 
                    stroke="#a1a1aa" 
                    fontSize={10}
                    tickFormatter={(val) => `${(val / 1000)}k`}
                  />
                  <Tooltip 
                    formatter={(value: any) => [formatRupiah(Number(value)), 'Revenue']}
                    labelStyle={{ fontWeight: 'bold', color: '#18181b', fontSize: '11px' }}
                    contentStyle={{ borderRadius: '8px', fontSize: '11px', border: '1px solid #e4e4e7' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#ea580c" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Payment Method Distribution */}
        <Card className="space-y-3" padding="md">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-zinc-900">
                Payment Methods
              </h3>
              <p className="text-[11px] text-zinc-500">
                Revenue share by channel
              </p>
            </div>
            <PieIcon className="w-4 h-4 text-orange-600" />
          </div>

          <div className="h-56 w-full flex flex-col items-center justify-center">
            {paymentMethodData.length === 0 ? (
              <div className="text-xs text-zinc-400">No transactions recorded.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="45%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => formatRupiah(Number(value))}
                    contentStyle={{ borderRadius: '8px', fontSize: '11px', border: '1px solid #e4e4e7' }}
                  />
                  <Legend 
                    formatter={(val) => <span className="text-[11px] font-semibold text-zinc-700">{val}</span>} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Top 5 Products Bar Chart & Category Breakdown Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Bar Chart: Top 5 Products */}
        <Card className="space-y-3" padding="md">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-zinc-900">
                Top 5 Best-Selling Items
              </h3>
              <p className="text-[11px] text-zinc-500">
                Volume of portions sold
              </p>
            </div>
            <BarChart3 className="w-4 h-4 text-orange-600" />
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsChartData} layout="vertical" margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis type="number" stroke="#a1a1aa" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={10} width={95} />
                <Tooltip 
                  formatter={(value: any) => [`${value} portions`, 'Sold Volume']}
                  contentStyle={{ borderRadius: '8px', fontSize: '11px', border: '1px solid #e4e4e7' }}
                />
                <Bar dataKey="portions" fill="#18181b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Contribution Table */}
        <Card className="space-y-3" padding="md">
          <div className="border-b border-zinc-100 pb-2.5">
            <h3 className="text-xs sm:text-sm font-bold text-zinc-900">
              Revenue by Category
            </h3>
            <p className="text-[11px] text-zinc-500">
              Share across menu food & drinks
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400 font-semibold uppercase text-[10px]">
                  <th className="pb-2">Category</th>
                  <th className="pb-2">Qty</th>
                  <th className="pb-2">Revenue</th>
                  <th className="pb-2 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {categoryStats.map((cat, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50">
                    <td className="py-2 font-medium text-zinc-900">{cat.category}</td>
                    <td className="py-2 font-mono text-zinc-500">{cat.quantity}x</td>
                    <td className="py-2 font-mono font-bold text-zinc-900">{formatRupiah(cat.revenue)}</td>
                    <td className="py-2 text-right font-bold text-orange-600">{cat.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
