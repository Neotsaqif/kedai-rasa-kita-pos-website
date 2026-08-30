import React, { useState } from 'react';
import { ShoppingBag, LayoutDashboard, Package, BarChart3, Users, LogOut, Coffee } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('pos');
  const [cart, setCart] = useState([]);

  // Mock Products for initial UI shell demo
  const sampleProducts = [
    { id: 1, name: 'Kopi Susu Gula Aren', price: 18000, category: 'Beverage', stock: 25 },
    { id: 2, name: 'Americano', price: 15000, category: 'Beverage', stock: 40 },
    { id: 3, name: 'Roti Bakar Coklat Keju', price: 20000, category: 'Food', stock: 15 },
    { id: 4, name: 'Nasi Goreng Special', price: 25000, category: 'Food', stock: 10 },
    { id: 5, name: 'Es Teh Manis', price: 6000, category: 'Beverage', stock: 50 },
  ];

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
      <aside className="w-64 bg-brand-900 text-amber-50 flex flex-col justify-between p-4 shadow-xl">
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
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                activeTab === 'products' ? 'bg-brand-500 text-white shadow-md' : 'text-amber-200/70 hover:bg-brand-900/60 hover:text-white'
              }`}
            >
              <Package className="w-5 h-5" />
              Products & Stock
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
          </nav>
        </div>

        <div className="border-t border-amber-900/40 pt-4">
          <div className="px-3 py-2 mb-2 text-xs text-amber-300/60">Logged in as: <strong className="text-amber-100">Admin Owner</strong></div>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-red-950/30 transition">
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
                  <p className="text-sm text-gray-500">Click items to add to order</p>
                </div>
              </header>

              <div className="grid grid-cols-3 gap-4">
                {sampleProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="p-4 bg-white rounded-xl border border-amber-900/10 shadow-sm hover:shadow-md hover:border-brand-500 transition text-left group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold px-2.5 py-1 bg-cream-100 text-brand-900 rounded-md">
                        {product.category}
                      </span>
                      <span className="text-xs text-gray-400">Stock: {product.stock}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-brand-600 transition mb-1">{product.name}</h3>
                    <p className="text-brand-600 font-extrabold">Rp {product.price.toLocaleString('id-ID')}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Cart / Order Checkout Sidebar */}
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
                        <span className="text-xs text-gray-500">Rp {item.price.toLocaleString('id-ID')} x {item.qty}</span>
                      </div>
                      <span className="font-bold text-sm text-gray-900">
                        Rp {(item.price * item.qty).toLocaleString('id-ID')}
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

        {activeTab !== 'pos' && (
          <div className="flex-1 p-8 overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 capitalize">{activeTab} View</h2>
            <p className="text-gray-500 mt-2">Module initial setup completed. Ready for Week 1 detailed implementation.</p>
          </div>
        )}
      </main>
    </div>
  );
}
