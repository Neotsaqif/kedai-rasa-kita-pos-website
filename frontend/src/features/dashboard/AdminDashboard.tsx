import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatRupiah, formatDateOnly, formatDateTime } from '../../utils/formatters';
import { 
  DollarSign, ShoppingCart, AlertTriangle, TrendingUp,
  Plus, Layers, FileText, ArrowRight, UtensilsCrossed
} from 'lucide-react';

interface AdminDashboardProps {
  onSelectTransaction?: (trxId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const { 
    transactions, products, setActiveTab
  } = useApp();

  const todayDateStr = new Date().toISOString().slice(0, 10);
  
  const todayTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(todayDateStr) && t.status !== 'CANCELLED');
  }, [transactions, todayDateStr]);

  const todaySales = useMemo(() => {
    return todayTransactions.reduce((sum, t) => sum + t.total, 0);
  }, [todayTransactions]);

  const averageTransaction = todayTransactions.length > 0 
    ? Math.round(todaySales / todayTransactions.length) 
    : 0;

  const bestSellers = useMemo(() => {
    const counts: Record<string, { name: string; quantity: number; revenue: number; category: string }> = {};
    
    transactions.forEach(trx => {
      if (trx.status === 'CANCELLED') return;
      trx.items.forEach(item => {
        if (!counts[item.productId]) {
          counts[item.productId] = {
            name: item.productName,
            quantity: 0,
            revenue: 0,
            category: item.category,
          };
        }
        counts[item.productId].quantity += item.quantity;
        counts[item.productId].revenue += item.subtotal;
      });
    });

    return Object.values(counts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 4);
  }, [transactions]);

  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.isActive && p.stock <= p.lowStockThreshold);
  }, [products]);

  const activeProductsCount = useMemo(() => {
    return products.filter(p => p.isActive).length;
  }, [products]);

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Top Banner Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white rounded-xl border border-zinc-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-zinc-900">
            Store Overview
          </h2>
          <p className="text-xs text-zinc-500">
            {formatDateOnly(new Date().toISOString())} • Real-time operational data
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="accent"
            icon={<ShoppingCart className="w-3.5 h-3.5" />}
            onClick={() => setActiveTab('pos')}
          >
            Open POS
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setActiveTab('products')}
          >
            Add Product
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<Layers className="w-3.5 h-3.5" />}
            onClick={() => setActiveTab('stock')}
          >
            Inventory
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<FileText className="w-3.5 h-3.5" />}
            onClick={() => setActiveTab('reports')}
          >
            Reports
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          title="Today's Revenue"
          value={formatRupiah(todaySales)}
          subtitle={`${todayTransactions.length} sales`}
          icon={<DollarSign className="w-4 h-4" />}
          highlight
          trend={{ value: '+14.2%', isPositive: true, label: 'vs yesterday' }}
        />

        <StatCard
          title="Transactions"
          value={todayTransactions.length}
          subtitle={`Avg ${formatRupiah(averageTransaction)}`}
          icon={<ShoppingCart className="w-4 h-4" />}
        />

        <StatCard
          title="Low Stock Items"
          value={lowStockProducts.length}
          subtitle={lowStockProducts.length > 0 ? 'Needs replenishment' : 'All stocks healthy'}
          icon={<AlertTriangle className="w-4 h-4" />}
        />

        <StatCard
          title="Active Menu Items"
          value={activeProductsCount}
          subtitle="Available for sale"
          icon={<UtensilsCrossed className="w-4 h-4" />}
        />
      </div>

      {/* 2-Column Content: Recent Transactions + Best Sellers & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Recent Transactions (2 cols) */}
        <Card className="lg:col-span-2 space-y-3.5">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Recent Sales</h3>
              <p className="text-xs text-zinc-500">Latest customer orders</p>
            </div>
            <button
              onClick={() => setActiveTab('sales')}
              className="text-xs font-semibold text-orange-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-400">No transactions recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 text-zinc-400 font-medium uppercase tracking-wider text-[10px]">
                    <th className="pb-2">Invoice</th>
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Items</th>
                    <th className="pb-2">Method</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  {recentTransactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-2.5 font-mono font-bold text-zinc-900">
                        {trx.invoiceNumber}
                      </td>
                      <td className="py-2.5 text-zinc-500">
                        {formatDateTime(trx.date)}
                      </td>
                      <td className="py-2.5 max-w-[180px] truncate">
                        {trx.items.map(i => `${i.productName} (${i.quantity})`).join(', ')}
                      </td>
                      <td className="py-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 font-mono text-[10px]">
                          {trx.paymentMethod}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-bold text-zinc-900 font-mono">
                        {formatRupiah(trx.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Right: Best Sellers & Stock Warning (1 col) */}
        <div className="space-y-5">
          {/* Best Sellers */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                Top Selling Items
              </h3>
              <TrendingUp className="w-3.5 h-3.5 text-orange-600" />
            </div>

            <div className="space-y-2">
              {bestSellers.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-zinc-50 last:border-0">
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-zinc-900 truncate">{item.name}</p>
                    <p className="text-[10px] text-zinc-400">{item.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-zinc-900 font-mono">{item.quantity} sold</span>
                    <p className="text-[10px] text-zinc-500 font-mono">{formatRupiah(item.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Low Stock Notice */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                Low Stock Alert
              </h3>
              <button
                onClick={() => setActiveTab('stock')}
                className="text-[11px] font-semibold text-orange-600 hover:underline cursor-pointer"
              >
                Restock
              </button>
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-zinc-500">All inventory items are sufficiently stocked.</p>
            ) : (
              <div className="space-y-2">
                {lowStockProducts.slice(0, 3).map((prod) => (
                  <div key={prod.id} className="flex items-center justify-between text-xs py-1">
                    <span className="font-medium text-zinc-800 truncate pr-2">{prod.name}</span>
                    <Badge variant={prod.stock === 0 ? 'danger' : 'warning'} size="sm">
                      {prod.stock === 0 ? 'Out of Stock' : `${prod.stock} left`}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
