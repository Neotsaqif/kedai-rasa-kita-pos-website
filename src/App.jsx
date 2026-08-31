import React, { useState, useEffect } from 'react';
import { ShoppingBag, LayoutDashboard, Package, BarChart3, Users, LogOut, Coffee, Tag, Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './components/LoginScreen';
import CategoryManager from './components/CategoryManager';
import ProductManager from './components/ProductManager';
import { supabase } from './lib/supabase';

function MainApp() {
  const { user, profile, logout, isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('pos');
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Initial Sample items fallback
  const sampleProducts = [
    { id: 1, name: 'Kopi Susu Gula Aren', price: 18000, category: 'Beverage', stock_qty: 25 },
    { id: 2, name: 'Americano', price: 15000, category: 'Beverage', stock_qty: 40 },
    { id: 3, name: 'Roti Bakar Coklat Keju', price: 20000, category: 'Food', stock_qty: 15 },
    { id: 4, name: 'Nasi Goreng Special', price: 25000, category: 'Food', stock_qty: 10 },
    { id: 5, name: 'Es Teh Manis', price: 6000, category: 'Beverage', stock_qty: 50 },
  ];

  const fetchPosProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error || !data || data.length === 0) {
        setProducts(sampleProducts);
      } else {
        setProducts(data);
      }
    } catch {
      setProducts(sampleProducts);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'pos') {
      fetchPosProducts();
    }
  }, [activeTab]);

  if (authLoading) {
    return (
      <div className="h-screen bg-cream-50 flex items-center justify-center text-brand-900 font-semibold gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
        <span>Loading Kedai Rasa Kita POS...</span>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="flex h-screen bg-cream-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-brand-900 text-amber-50 flex flex-col justify-between p-4 shadow-xl select-none">
        <div>
          <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-amber-900/40">
            <div className="p-2 bg-brand-500 rounded-lg text-white">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Kedai Rasa Kita</h1>
              <span className="text-xs text-amber-300/80">POS System</span>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('pos')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                activeTab === 'pos' ? 'bg-brand-500 text-white shadow-md' : 'text-amber-200/70 hover:bg-brand-900/60 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              POS Sales
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                    activeTab === 'categories' ? 'bg-brand-500 text-white shadow-md' : 'text-amber-200/70 hover:bg-brand-900/60 hover:text-white'
                  }`}
                >
                  <Tag className="w-5 h-5" />
                  Categories
                </button>

                <button
                  onClick={() => setActiveTab('products')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                    activeTab === 'products' ? 'bg-brand-500 text-white shadow-md' : 'text-amber-200/70 hover:bg-brand-900/60 hover:text-white'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  Products & Stock
                </button>

                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                    activeTab === 'dashboard' ? 'bg-brand-500 text-white shadow-md' : 'text-amber-200/70 hover:bg-brand-900/60 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </button>

                <button
                  onClick={() => setActiveTab('reports')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                    activeTab === 'reports' ? 'bg-brand-500 text-white shadow-md' : 'text-amber-200/70 hover:bg-brand-900/60 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  Reports
                </button>

                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                    activeTab === 'users' ? 'bg-brand-500 text-white shadow-md' : 'text-amber-200/70 hover:bg-brand-900/60 hover:text-white'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  Staff Accounts
                </button>
              </>
            )}
          </nav>
        </div>

        <div className="border-t border-amber-900/40 pt-4">
          <div className="px-3 py-2 mb-2 text-xs text-amber-300/60">
            Logged in as: <strong className="text-amber-100">{profile?.name || user.email}</strong>
            <span className="block text-[10px] uppercase font-bold text-brand-500 mt-0.5">
              Role: {profile?.role || 'cashier'}
            </span>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-red-950/30 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* POS Grid View */}
        {activeTab === 'pos' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Products Selection */}
            <div className="flex-1 p-6 overflow-y-auto">
              <header className="mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Menu & Catalog</h2>
                  <p className="text-sm text-gray-500">Click items to add to current order</p>
                </div>
              </header>

              {loadingProducts ? (
                <div className="flex items-center justify-center p-12 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span>Loading menu...</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="p-4 bg-white rounded-xl border border-amber-900/10 shadow-sm hover:shadow-md hover:border-brand-500 transition text-left group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold px-2.5 py-1 bg-cream-100 text-brand-900 rounded-md">
                          {product.categories?.name || product.category || 'Menu'}
                        </span>
                        <span className="text-xs text-gray-400">Stock: {product.stock_qty ?? product.stock}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 group-hover:text-brand-600 transition mb-1">{product.name}</h3>
                      <p className="text-brand-600 font-extrabold">Rp {Number(product.price).toLocaleString('id-ID')}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Sidebar */}
            <div className="w-96 bg-white border-l border-amber-900/10 flex flex-col justify-between shadow-lg">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-lg text-gray-800">Current Order</h3>
              </div>

              <div className="flex-1 p-4 overflow-y-auto divide-y divide-gray-100">
                {cart.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    No items added yet
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="py-3 flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-800">{item.name}</h4>
                        <span className="text-xs text-gray-500">Rp {Number(item.price).toLocaleString('id-ID')} x {item.qty}</span>
                      </div>
                      <span className="font-bold text-sm text-gray-900">
                        Rp {(Number(item.price) * item.qty).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 bg-cream-50 border-t border-amber-900/10 space-y-4">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-brand-600">Rp {totalAmount.toLocaleString('id-ID')}</span>
                </div>

                <button
                  disabled={cart.length === 0}
                  className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && isAdmin && (
          <div className="flex-1 p-8 overflow-y-auto">
            <CategoryManager />
          </div>
        )}

        {activeTab === 'products' && isAdmin && (
          <div className="flex-1 p-8 overflow-y-auto">
            <ProductManager />
          </div>
        )}

        {!['pos', 'categories', 'products'].includes(activeTab) && isAdmin && (
          <div className="flex-1 p-8 overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 capitalize">{activeTab} View</h2>
            <p className="text-gray-500 mt-2">Module initial setup completed. Scheduled for upcoming roadmap weeks.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

