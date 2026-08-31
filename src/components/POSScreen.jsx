import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Loader2,
  ShoppingBag,
  Banknote,
  QrCode,
  CreditCard,
  ArrowLeftRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { formatRupiah } from "../lib/format";
import { processCheckout } from "../lib/checkout";
import ReceiptModal from "./ReceiptModal";

const PAYMENT_METHODS = [
  { key: "cash", label: "Tunai", icon: Banknote },
  { key: "qris", label: "QRIS", icon: QrCode },
  { key: "debit", label: "Debit", icon: CreditCard },
  { key: "transfer", label: "Transfer", icon: ArrowLeftRight },
];

const CATEGORY_TABS = [
  { key: "all", label: "Semua" },
  { key: "Makanan", label: "Makanan" },
  { key: "Minuman", label: "Minuman" },
  { key: "Snack", label: "Snack" },
];

export default function POSScreen({ cashierId, onSaleComplete }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [receipt, setReceipt] = useState(null);

  // Sample fallback data when Supabase is unavailable
  const sampleProducts = [
    {
      id: 1,
      name: "Kopi Susu Gula Aren",
      price: 18000,
      category: "Minuman",
      stock_qty: 25,
    },
    {
      id: 2,
      name: "Americano",
      price: 15000,
      category: "Minuman",
      stock_qty: 40,
    },
    {
      id: 3,
      name: "Es Teh Manis",
      price: 6000,
      category: "Minuman",
      stock_qty: 50,
    },
    {
      id: 4,
      name: "Roti Bakar Coklat Keju",
      price: 20000,
      category: "Makanan",
      stock_qty: 15,
    },
    {
      id: 5,
      name: "Nasi Goreng Special",
      price: 25000,
      category: "Makanan",
      stock_qty: 10,
    },
    {
      id: 6,
      name: "Pisang Goreng",
      price: 12000,
      category: "Snack",
      stock_qty: 3,
    },
    {
      id: 7,
      name: "Kentang Goreng",
      price: 15000,
      category: "Snack",
      stock_qty: 0,
    },
  ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        supabase
          .from("products")
          .select("*, categories(name)")
          .eq("is_active", true)
          .order("name", { ascending: true }),
        supabase
          .from("categories")
          .select("*")
          .order("name", { ascending: true }),
      ]);

      if (prodRes.error || !prodRes.data || prodRes.data.length === 0) {
        setProducts(sampleProducts);
      } else {
        setProducts(prodRes.data);
      }

      if (catRes.error || !catRes.data || catRes.data.length === 0) {
        setCategories([
          { id: 1, name: "Makanan" },
          { id: 2, name: "Minuman" },
          { id: 3, name: "Snack" },
        ]);
      } else {
        setCategories(catRes.data);
      }
    } catch {
      setProducts(sampleProducts);
      setCategories([
        { id: 1, name: "Makanan" },
        { id: 2, name: "Minuman" },
        { id: 3, name: "Snack" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const categoryName = p.categories?.name || p.category || "";
      const matchesCategory =
        activeCategory === "all" || categoryName === activeCategory;
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchTerm]);

  const addToCart = (product) => {
    if (Number(product.stock_qty ?? product.stock ?? 0) <= 0) return;
    setErrorMsg("");
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty + delta } : item,
        )
        .filter((item) => item.qty > 0),
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.qty,
    0,
  );

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setProcessing(true);
    setErrorMsg("");

    try {
      const result = await processCheckout(cart, paymentMethod, cashierId);
      setReceipt({
        ...result,
        items: cart,
        totalAmount,
        paymentMethod,
        cashierName: "Kasir",
        createdAt: new Date().toISOString(),
      });
      setCart([]);
      setPaymentMethod("cash");
      await fetchProducts();
      if (onSaleComplete) onSaleComplete();
    } catch (err) {
      setErrorMsg(
        err.message || "Gagal memproses pembayaran. Silakan coba lagi.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleNewSale = () => {
    setReceipt(null);
  };

  const getStockBadge = (stock) => {
    const qty = Number(stock ?? 0);
    if (qty <= 0) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">
          Habis
        </span>
      );
    }
    if (qty <= 5) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">
          Stok {qty}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
        Stok {qty}
      </span>
    );
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left: Product Grid */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-thin">
        <header className="mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            Menu & Katalog
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Ketuk produk untuk menambahkan ke pesanan
          </p>
        </header>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari produk..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-brand-900/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-thin">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition ${
                activeCategory === tab.key
                  ? "bg-brand-500 text-white shadow-md"
                  : "bg-white text-gray-600 border border-brand-900/10 hover:bg-cream-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex items-center justify-center p-12 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Memuat menu...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-brand-900/10 shadow-sm text-gray-500 text-sm">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>Tidak ada produk ditemukan.</p>
            <p className="text-xs text-gray-400 mt-1">
              Coba ubah kata kunci atau kategori.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {filteredProducts.map((product) => {
              const stock = Number(product.stock_qty ?? product.stock ?? 0);
              const outOfStock = stock <= 0;
              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={outOfStock}
                  className={`p-4 bg-white rounded-xl border border-brand-900/10 shadow-card hover:shadow-card-hover hover:border-brand-500 transition text-left group ${
                    outOfStock ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-cream-100 text-brand-900 rounded-md">
                      {product.categories?.name || product.category || "Menu"}
                    </span>
                    {getStockBadge(stock)}
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 group-hover:text-brand-600 transition mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-brand-600 font-extrabold text-sm">
                    {formatRupiah(product.price)}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Cart Panel */}
      <div className="w-80 lg:w-96 bg-white border-l border-brand-900/10 flex flex-col shadow-lg">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-800">Pesanan</h3>
          {totalItems > 0 && (
            <span className="px-2.5 py-1 bg-brand-50 text-brand-600 text-xs font-bold rounded-full">
              {totalItems} item
            </span>
          )}
        </div>

        <div className="flex-1 p-4 overflow-y-auto scrollbar-thin divide-y divide-gray-100">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
              <ShoppingBag className="w-10 h-10 mb-3 text-gray-300" />
              <p>Keranjang kosong</p>
              <p className="text-xs text-gray-400 mt-1">
                Ketuk produk untuk menambahkan
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="py-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-800 truncate">
                      {item.name}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {formatRupiah(item.price)} / pcs
                    </span>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 text-gray-300 hover:text-red-500 transition"
                    title="Hapus item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="p-1.5 bg-cream-100 hover:bg-cream-200 text-brand-900 rounded-lg transition"
                      title="Kurangi"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm text-gray-900">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="p-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition"
                      title="Tambah"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="font-bold text-sm text-gray-900">
                    {formatRupiah(Number(item.price) * item.qty)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-cream-50 border-t border-brand-900/10 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Payment Method Pills */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Metode Pembayaran
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const isActive = paymentMethod === method.key;
                return (
                  <button
                    key={method.key}
                    onClick={() => setPaymentMethod(method.key)}
                    className={`flex flex-col items-center gap-1 px-1 py-2 rounded-xl text-[10px] font-semibold transition border ${
                      isActive
                        ? "bg-brand-500 text-white border-brand-500 shadow-md"
                        : "bg-white text-gray-600 border-brand-900/10 hover:border-brand-500"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {method.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-600">Total</span>
            <span className="text-xl font-extrabold text-brand-600">
              {formatRupiah(totalAmount)}
            </span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || processing}
            className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Proses Pembayaran</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      {receipt && <ReceiptModal receipt={receipt} onNewSale={handleNewSale} />}
    </div>
  );
}
