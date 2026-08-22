import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, StockMovementType } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDateTime } from '../../utils/formatters';
import { 
  Plus, Search, AlertTriangle, 
  ArrowUpRight, ArrowDownRight, Layers, History
} from 'lucide-react';

export const StockManagementPage: React.FC = () => {
  const { currentUser, products, stockMovements, addStock } = useApp();

  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'HISTORY'>('INVENTORY');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Restock Modal State
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedProductForRestock, setSelectedProductForRestock] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState<number>(20);
  const [restockNotes, setRestockNotes] = useState<string>('Daily kitchen grocery restock');

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-zinc-200">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-zinc-900">Restricted Access</h3>
        <p className="text-xs text-zinc-500 mt-1">Inventory management is only accessible by Admin.</p>
      </div>
    );
  }

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  // Filtered Stock Movements
  const filteredMovements = useMemo(() => {
    return stockMovements.filter(m => {
      return m.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
             m.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
             (m.notes && m.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    });
  }, [stockMovements, searchQuery]);

  const handleOpenRestock = (product: Product) => {
    setSelectedProductForRestock(product);
    setRestockQty(20);
    setRestockNotes('Daily grocery restock');
    setIsRestockModalOpen(true);
  };

  const handleConfirmRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForRestock || restockQty <= 0) return;

    addStock(selectedProductForRestock.id, Number(restockQty), restockNotes.trim());
    setIsRestockModalOpen(false);
  };

  const renderMovementTypeBadge = (type: StockMovementType) => {
    switch (type) {
      case 'RESTOCK':
        return <Badge variant="success" size="sm">Restock In</Badge>;
      case 'SALE':
        return <Badge variant="neutral" size="sm">POS Sale</Badge>;
      case 'ADJUSTMENT':
        return <Badge variant="warning" size="sm">Adjustment</Badge>;
      case 'DAMAGE':
        return <Badge variant="danger" size="sm">Damaged</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
            Inventory & Stock Control
          </h2>
          <p className="text-xs text-zinc-500">
            Monitor inventory counts, restock portions, and track audit history
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-zinc-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('INVENTORY')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'INVENTORY' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Product Stock</span>
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'HISTORY' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit History ({stockMovements.length})</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card padding="sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'INVENTORY' ? "Search product name or SKU..." : "Search in stock logs..."}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
            />
          </div>

          {activeTab === 'INVENTORY' && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-2 text-xs rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
            >
              <option value="ALL">All Categories</option>
              <option value="Main Dishes">Main Dishes</option>
              <option value="Noodles & Meatballs">Noodles & Meatballs</option>
              <option value="Snacks & Appetizers">Snacks & Appetizers</option>
              <option value="Cold Drinks">Cold Drinks</option>
              <option value="Indonesian Coffee">Indonesian Coffee</option>
              <option value="Hot Drinks">Hot Drinks</option>
            </select>
          )}
        </div>
      </Card>

      {/* Tab: Inventory List */}
      {activeTab === 'INVENTORY' && (
        <>
          {filteredProducts.length === 0 ? (
            <Card padding="lg">
              <EmptyState
                title="No Products Found"
                description="No stock items matched your search query."
              />
            </Card>
          ) : (
            <>
              {/* Mobile Card List (< sm) */}
              <div className="sm:hidden space-y-2.5">
                {filteredProducts.map((prod) => {
                  const isOutOfStock = prod.stock <= 0;
                  const isLowStock = !isOutOfStock && prod.stock <= prod.lowStockThreshold;

                  return (
                    <div 
                      key={prod.id}
                      className="bg-white rounded-xl border border-zinc-200 p-3 shadow-xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-zinc-900">{prod.name}</h4>
                          <p className="text-[10px] text-zinc-400 font-mono">{prod.sku} • {prod.category}</p>
                        </div>

                        <div>
                          {isOutOfStock ? (
                            <Badge variant="danger" size="sm" dot>Out of stock</Badge>
                          ) : isLowStock ? (
                            <Badge variant="warning" size="sm" dot>Low ({prod.stock})</Badge>
                          ) : (
                            <Badge variant="success" size="sm" dot>In Stock</Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 text-xs">
                        <div>
                          <span className="text-[10px] text-zinc-400 block">Available</span>
                          <span className="font-mono font-bold text-base text-zinc-900">{prod.stock}</span>
                          <span className="text-[10px] text-zinc-400 ml-1">units</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-zinc-400 block">Warning Threshold</span>
                          <span className="font-mono text-zinc-600">&le; {prod.lowStockThreshold} units</span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="accent"
                        fullWidth
                        onClick={() => handleOpenRestock(prod)}
                        icon={<Plus className="w-3.5 h-3.5" />}
                        className="min-h-[38px]"
                      >
                        Restock + Add Stock
                      </Button>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table (>= sm) */}
              <div className="hidden sm:block">
                <Card padding="none" className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-2.5 px-4">Product Name</th>
                          <th className="py-2.5 px-4">Category</th>
                          <th className="py-2.5 px-4">Current Stock</th>
                          <th className="py-2.5 px-4">Min Threshold</th>
                          <th className="py-2.5 px-4">Stock Status</th>
                          <th className="py-2.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 text-zinc-700">
                        {filteredProducts.map((prod) => {
                          const isOutOfStock = prod.stock <= 0;
                          const isLowStock = !isOutOfStock && prod.stock <= prod.lowStockThreshold;

                          return (
                            <tr key={prod.id} className="hover:bg-zinc-50 transition-colors">
                              <td className="py-2.5 px-4 font-bold text-zinc-900">
                                {prod.name}
                                <span className="block text-[10px] font-mono text-zinc-400 font-normal">
                                  {prod.sku}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 font-medium text-zinc-600">
                                {prod.category}
                              </td>
                              <td className="py-2.5 px-4">
                                <span className="font-mono font-bold text-sm text-zinc-900">
                                  {prod.stock}
                                </span>{' '}
                                <span className="text-zinc-400 text-[10px]">units</span>
                              </td>
                              <td className="py-2.5 px-4 font-mono text-zinc-500">
                                {prod.lowStockThreshold}
                              </td>
                              <td className="py-2.5 px-4">
                                {isOutOfStock ? (
                                  <Badge variant="danger" size="sm" dot>Out of stock</Badge>
                                ) : isLowStock ? (
                                  <Badge variant="warning" size="sm" dot>Low ({prod.stock})</Badge>
                                ) : (
                                  <Badge variant="success" size="sm" dot>In Stock</Badge>
                                )}
                              </td>
                              <td className="py-2.5 px-4 text-right">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleOpenRestock(prod)}
                                  icon={<Plus className="w-3.5 h-3.5 text-orange-600" />}
                                >
                                  Restock
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </>
          )}
        </>
      )}

      {/* Tab: Stock Movement History */}
      {activeTab === 'HISTORY' && (
        <>
          {filteredMovements.length === 0 ? (
            <Card padding="lg">
              <EmptyState
                title="No Stock Mutation Logs"
                description="All restocking and checkout deduction actions will be recorded here automatically."
              />
            </Card>
          ) : (
            <>
              {/* Mobile History Cards (< sm) */}
              <div className="sm:hidden space-y-2">
                {filteredMovements.map((movement) => {
                  const isPositive = movement.quantityChange > 0;
                  return (
                    <div key={movement.id} className="bg-white rounded-xl border border-zinc-200 p-3 shadow-xs space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h5 className="font-bold text-xs text-zinc-900">{movement.productName}</h5>
                          <p className="text-[10px] text-zinc-400 font-mono">{formatDateTime(movement.date)}</p>
                        </div>
                        <div>
                          {renderMovementTypeBadge(movement.type)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100">
                        <span className="text-zinc-500 font-mono">
                          {movement.previousStock} &rarr; <strong className="text-zinc-900">{movement.newStock}</strong>
                        </span>
                        <span className={`font-mono font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isPositive ? `+${movement.quantityChange}` : movement.quantityChange}
                        </span>
                      </div>

                      {movement.notes && (
                        <p className="text-[11px] text-zinc-500 italic bg-zinc-50 px-2 py-1 rounded">
                          "{movement.notes}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Desktop History Table (>= sm) */}
              <div className="hidden sm:block">
                <Card padding="none" className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-2.5 px-4">Timestamp</th>
                          <th className="py-2.5 px-4">Product</th>
                          <th className="py-2.5 px-4">Type</th>
                          <th className="py-2.5 px-4">Delta (+/-)</th>
                          <th className="py-2.5 px-4">Prev &rarr; New</th>
                          <th className="py-2.5 px-4">User</th>
                          <th className="py-2.5 px-4">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 text-zinc-700">
                        {filteredMovements.map((movement) => {
                          const isPositive = movement.quantityChange > 0;

                          return (
                            <tr key={movement.id} className="hover:bg-zinc-50 transition-colors">
                              <td className="py-2.5 px-4 font-mono text-zinc-500 whitespace-nowrap">
                                {formatDateTime(movement.date)}
                              </td>
                              <td className="py-2.5 px-4 font-bold text-zinc-900">
                                {movement.productName}
                              </td>
                              <td className="py-2.5 px-4">
                                {renderMovementTypeBadge(movement.type)}
                              </td>
                              <td className="py-2.5 px-4 font-mono font-bold">
                                <span className={isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                                  {isPositive ? `+${movement.quantityChange}` : movement.quantityChange}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 font-mono text-zinc-600">
                                {movement.previousStock} &rarr; <span className="font-bold text-zinc-900">{movement.newStock}</span>
                              </td>
                              <td className="py-2.5 px-4 text-zinc-700">
                                {movement.userName}
                              </td>
                              <td className="py-2.5 px-4 text-zinc-500 italic max-w-xs truncate">
                                {movement.notes || '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </>
          )}
        </>
      )}

      {/* Restock Modal */}
      <Modal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        title={`Restock: ${selectedProductForRestock?.name || ''}`}
        subtitle={`Current stock: ${selectedProductForRestock?.stock || 0} units`}
        maxWidth="md"
      >
        <form onSubmit={handleConfirmRestock} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Stock Quantity to Add
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[10, 20, 50, 100].map(qty => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => setRestockQty(qty)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    restockQty === qty ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  +{qty}
                </button>
              ))}
            </div>
            <Input
              type="number"
              min="1"
              value={restockQty}
              onChange={(e) => setRestockQty(Number(e.target.value))}
              required
            />
          </div>

          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
            <span>New Stock Level:</span>
            <span className="font-bold font-mono text-sm">
              {(selectedProductForRestock?.stock || 0) + Number(restockQty)} units
            </span>
          </div>

          <Input
            label="Restock Notes / Source"
            placeholder="e.g. Daily supplier delivery..."
            value={restockNotes}
            onChange={(e) => setRestockNotes(e.target.value)}
          />

          <div className="flex gap-2.5 pt-2 border-t border-zinc-100">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setIsRestockModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              fullWidth
            >
              Confirm Restock
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
