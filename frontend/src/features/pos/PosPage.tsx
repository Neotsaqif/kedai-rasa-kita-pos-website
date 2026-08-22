import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductCategory, Product, Transaction } from '../../types';
import { ProductCard } from './ProductCard';
import { CartSection } from './CartSection';
import { PaymentModal } from './PaymentModal';
import { ReceiptModal } from './ReceiptModal';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatRupiah } from '../../utils/formatters';
import { Search, ShoppingCart, UtensilsCrossed, ArrowRight } from 'lucide-react';

const CATEGORIES: Array<{ label: string; value: ProductCategory | 'ALL' }> = [
  { label: 'All Items', value: 'ALL' },
  { label: 'Main Dishes', value: 'Main Dishes' },
  { label: 'Noodles & Meatballs', value: 'Noodles & Meatballs' },
  { label: 'Snacks & Appetizers', value: 'Snacks & Appetizers' },
  { label: 'Cold Drinks', value: 'Cold Drinks' },
  { label: 'Indonesian Coffee', value: 'Indonesian Coffee' },
  { label: 'Hot Drinks', value: 'Hot Drinks' },
];

export const PosPage: React.FC = () => {
  const { products, cart, addToCart, cartTotal } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'ALL'>('ALL');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [mobileActiveView, setMobileActiveView] = useState<'menu' | 'cart'>('menu');

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      if (!prod.isActive) return false;

      const matchesCategory = selectedCategory === 'ALL' || prod.category === selectedCategory;
      const matchesSearch = 
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prod.description && prod.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handlePaymentSuccess = (trx: Transaction) => {
    setIsPaymentModalOpen(false);
    setCompletedTransaction(trx);
    setIsReceiptModalOpen(true);
  };

  const cartQuantityMap = useMemo(() => {
    const map: Record<string, number> = {};
    cart.forEach(item => {
      map[item.product.id] = item.quantity;
    });
    return map;
  }, [cart]);

  const totalCartCount = useMemo(() => {
    return cart.reduce((s, i) => s + i.quantity, 0);
  }, [cart]);

  return (
    <div className="flex flex-col gap-3 pb-16 lg:pb-0 h-[calc(100vh-5rem)] min-h-[500px]">
      {/* Mobile Tab Switcher (< lg) */}
      <div className="lg:hidden flex items-center p-1 bg-zinc-200/80 rounded-xl shrink-0">
        <button
          type="button"
          onClick={() => setMobileActiveView('menu')}
          className={`
            flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer
            ${mobileActiveView === 'menu' 
              ? 'bg-white text-zinc-900 shadow-xs' 
              : 'text-zinc-600 hover:text-zinc-900'
            }
          `}
        >
          <UtensilsCrossed className="w-3.5 h-3.5 text-orange-600" />
          <span>Menu ({filteredProducts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileActiveView('cart')}
          className={`
            flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer relative
            ${mobileActiveView === 'cart' 
              ? 'bg-orange-600 text-white shadow-xs' 
              : 'text-zinc-600 hover:text-zinc-900'
            }
          `}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Cart ({totalCartCount})</span>
        </button>
      </div>

      {/* Main Container: 2-Cols on desktop */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden">
        {/* Left / Products Area */}
        <div 
          className={`
            flex-1 flex flex-col min-w-0 bg-white rounded-xl border border-zinc-200/80 p-3.5 sm:p-4 shadow-xs overflow-hidden
            ${mobileActiveView === 'menu' ? 'flex' : 'hidden lg:flex'}
          `}
        >
          {/* Search & Category Filter */}
          <div className="space-y-2.5 mb-3 shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food, drinks, or SKU..."
                className="w-full pl-9 pr-8 py-2 rounded-lg border border-zinc-200 bg-zinc-50/50 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-700 bg-zinc-200 rounded-full w-4 h-4 flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0
                      ${isSelected 
                        ? 'bg-zinc-900 text-white font-semibold' 
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                      }
                    `}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto pr-0.5">
            {filteredProducts.length === 0 ? (
              <EmptyState
                title="No Items Found"
                description={`No products match your search "${searchQuery}".`}
                actionLabel="Clear Filters"
                onAction={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="h-full min-h-[200px]"
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                    inCartQuantity={cartQuantityMap[product.id] || 0}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right / Cart Area */}
        <div 
          className={`
            w-full lg:w-80 xl:w-96 shrink-0 h-full
            ${mobileActiveView === 'cart' ? 'flex flex-col flex-1' : 'hidden lg:block'}
          `}
        >
          <CartSection onOpenPaymentModal={() => setIsPaymentModalOpen(true)} />
        </div>
      </div>

      {/* Floating Bottom Cart Bar for Mobile when on Menu View */}
      {mobileActiveView === 'menu' && totalCartCount > 0 && (
        <div className="lg:hidden fixed bottom-3 left-3 right-3 z-30 animate-in slide-in-from-bottom-2 duration-150">
          <div className="p-2.5 bg-zinc-900 text-white rounded-xl shadow-lg border border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-7 h-7 rounded-lg bg-orange-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {totalCartCount}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] text-zinc-400 uppercase font-medium">Order Total</p>
                <p className="text-xs sm:text-sm font-bold text-white font-mono truncate">
                  {formatRupiah(cartTotal)}
                </p>
              </div>
            </div>

            <button
              onClick={() => setMobileActiveView('cart')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
            >
              <span>View Cart</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />

      {/* Thermal Receipt Print Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        transaction={completedTransaction}
      />
    </div>
  );
};
