import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Loader2,
  ShoppingCart,
  Banknote,
  QrCode,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  PackageX,
} from "lucide-react";
import { fetchProducts as apiFetchProducts, fetchCategories as apiFetchCategories } from "../lib/data";
import { formatRupiah } from "../lib/format";
import { processCheckout } from "../lib/checkout";
import ReceiptModal from "./ReceiptModal";
import ConfirmTransactionModal from "./ConfirmTransactionModal";

const PAYMENT_METHODS = [
  { id: "cash", label: "Tunai (Cash)", icon: Banknote },
  { id: "qris", label: "QRIS", icon: QrCode },
  { id: "debit", label: "Debit", icon: CreditCard },
  { id: "transfer", label: "Transfer", icon: Building2 },
];

export default function POSScreen({ cashierId, onSaleComplete }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashPaidInput, setCashPaidInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [prodData, catData] = await Promise.all([
        apiFetchProducts(true),
        apiFetchCategories(),
      ]);

      setProducts(prodData && prodData.length > 0 ? prodData : []);

      if (!catData || catData.length === 0) {
        setCategories([
          { id: 1, name: "Makanan" },
          { id: 2, name: "Minuman" },
          { id: 3, name: "Snack" },
        ]);
      } else {
        setCategories(catData);
      }
    } catch {
      setProducts([]);
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
      const catName = p.categories?.name || p.category || "";
      const matchesCategory =
        activeCategory === "all" || catName === activeCategory || p.category_id === activeCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchTerm]);

  const addToCart = (product) => {
    const stock = Number(product.stock_qty ?? product.stock ?? 0);
    if (stock <= 0) return;
    setErrorMsg("");

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.qty >= stock) return prev;
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, newQty) => {
    if (newQty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const maxStock = Number(item.stock_qty ?? item.stock ?? 999);
          return { ...item, qty: Math.min(newQty, maxStock) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setCashPaidInput("");
    setErrorMsg("");
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.qty,
    0
  );

  const numericCashPaid = parseFloat(cashPaidInput.replace(/\D/g, "")) || 0;
  const changeAmount = numericCashPaid - totalAmount;

  const handleQuickCash = (amount) => {
    setCashPaidInput(amount.toString());
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    if (paymentMethod === "cash" && numericCashPaid < totalAmount) {
      setErrorMsg("Uang tunai kurang dari total pembayaran.");
      return;
    }

    setErrorMsg("");
    setShowConfirm(true);
  };

  const confirmCheckout = async () => {
    setShowConfirm(false);
    setProcessing(true);

    try {
      const result = await processCheckout(cart, paymentMethod, cashierId);
      setReceipt({
        ...result,
        items: cart,
        totalAmount,
        paymentMethod,
        cashPaid: paymentMethod === "cash" ? numericCashPaid : totalAmount,
        change: paymentMethod === "cash" ? changeAmount : 0,
        cashierName: "Kasir POS",
        createdAt: new Date().toISOString(),
      });
      setCart([]);
      setCashPaidInput("");
      setPaymentMethod("cash");
      await fetchProducts();
      if (onSaleComplete) onSaleComplete();
    } catch (err) {
      setErrorMsg(err.message || "Gagal memproses pembayaran. Silakan coba lagi.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full p-4 sm:p-6 overflow-y-auto font-sans text-brand-900 bg-cream-50">
      {/* Product Catalog Section */}
      <div className="flex-1 space-y-5">
        {/* Search & Categories Bar */}
        <div className="bg-white border border-cream-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-brand-500/60 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              id="pos-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari menu items atau SKU (e.g. Nasi Goreng, KRK-FB-001)..."
              className="w-full bg-cream-100 text-brand-900 border border-cream-200 py-2.5 pl-10 pr-4 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-brand-500/60 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              id="cat-filter-all"
              onClick={() => setActiveCategory("all")}
              className={`px-5 py-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === "all"
                  ? "bg-brand-500 text-white shadow-xs"
                  : "bg-white text-brand-500 border border-cream-200 hover:bg-cream-100"
              }`}
            >
              Semua Menu ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                id={`cat-filter-${cat.id}`}
                onClick={() => setActiveCategory(cat.name || cat.id)}
                className={`px-5 py-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === (cat.name || cat.id)
                    ? "bg-brand-500 text-white shadow-xs"
                    : "bg-white text-brand-500 border border-cream-200 hover:bg-cream-100"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="bg-white border border-cream-200 p-12 text-center text-brand-500/60 flex items-center justify-center gap-2 font-medium">
            <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
            <span>Memuat katalog produk...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white border border-cream-200 p-12 text-center text-brand-500/60">
            <PackageX className="w-12 h-12 mx-auto text-brand-500/60 mb-3" />
            <p className="text-sm font-bold text-brand-900">Tidak ada produk.</p>
            <p className="text-xs text-brand-500/60 mt-1">Belum ada produk tersedia atau coba kata kunci pencarian/kategori lain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-4">
            {filteredProducts.map((prod) => {
              const cartItem = cart.find((ci) => ci.id === prod.id);
              const inCartQty = cartItem ? cartItem.qty : 0;
              const stock = Number(prod.stock_qty ?? prod.stock ?? 0);
              const isOutOfStock = stock <= 0;
              const isLowStock = stock > 0 && stock <= 10;
              const isSelected = inCartQty > 0;

              return (
                <div
                  key={prod.id}
                  id={`product-card-${prod.id}`}
                  onClick={() => !isOutOfStock && addToCart(prod)}
                  className={`bg-white p-3 border transition-all cursor-pointer group shadow-xs flex flex-col justify-between ${
                    isOutOfStock
                      ? "opacity-60 border-cream-200 cursor-not-allowed"
                      : isSelected
                      ? "border-brand-500 bg-brand-500/5 ring-1 ring-brand-500"
                      : "border-cream-200 hover:border-brand-500"
                  }`}
                >
                  <div className="relative aspect-video bg-cream-100 mb-3 overflow-hidden flex items-center justify-center text-brand-500/40 font-serif-heading italic border border-cream-200">
                    {prod.image_url || prod.imageUrl ? (
                      <img
                        src={prod.image_url || prod.imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-xs">{prod.name}</span>
                    )}

                    {inCartQty > 0 && (
                      <div className="absolute top-2 right-2 bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 shadow-xs">
                        {inCartQty} di keranjang
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2">
                      {isOutOfStock ? (
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 border border-rose-200">
                          Habis
                        </span>
                      ) : isLowStock ? (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 border border-amber-200">
                          Sisa {stock}
                        </span>
                      ) : (
                        <span className="bg-white/95 backdrop-blur-xs text-brand-500 text-[10px] font-semibold px-2 py-0.5 border border-cream-200">
                          Stok: {stock}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <div className="text-[10px] font-mono text-brand-500/60">
                        {prod.sku || `KRK-${prod.id}`}
                      </div>
                      <h3 className="font-bold text-sm text-brand-900 leading-tight font-serif-heading mt-0.5">
                        {prod.name}
                      </h3>
                    </div>
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-dashed border-cream-200">
                      <span className="text-xs font-semibold text-brand-500">
                        {formatRupiah(prod.price)}
                      </span>
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        className={`p-1.5 transition-all ${
                          isOutOfStock
                            ? "bg-cream-200 text-brand-500/60"
                            : "bg-cream-100 text-brand-500 border border-cream-200 group-hover:bg-brand-500 group-hover:text-white group-hover:border-brand-500"
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart & Checkout Panel */}
      <aside className="w-full lg:w-[360px] bg-white border border-cream-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between shrink-0">
        <div>
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-cream-200">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-brand-500" />
              <h2 className="text-lg font-bold font-serif-heading text-brand-900">Current Order</h2>
            </div>
            {cart.length > 0 ? (
              <button
                id="btn-clear-cart"
                onClick={clearCart}
                className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Kosongkan
              </button>
            ) : (
              <span className="text-[10px] font-mono bg-cream-100 px-2 py-1 border border-cream-200 text-brand-500/70">
                KRK-POS
              </span>
            )}
          </div>

          {/* Cart Item List */}
          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-brand-500/60">
                <ShoppingCart className="w-10 h-10 mx-auto text-brand-500/40 mb-2" />
                <p className="text-xs font-bold text-brand-900">Keranjang Masih Kosong</p>
                <p className="text-[11px] text-brand-500/60 mt-0.5">
                  Pilih menu di sebelah kiri untuk menambah ke pesanan.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 border-b border-dashed border-cream-200 pb-3"
                >
                  <div className="w-10 h-10 bg-cream-100 border border-cream-200 flex items-center justify-center text-xs font-bold text-brand-500 shrink-0">
                    {item.qty}x
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-brand-900 truncate font-serif-heading">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-brand-500/60">
                      {formatRupiah(item.price * item.qty)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 bg-cream-100 p-1 border border-cream-200">
                    <button
                      id={`cart-minus-${item.id}`}
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="w-5 h-5 flex items-center justify-center text-brand-500 hover:bg-white transition-all cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      id={`cart-plus-${item.id}`}
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="w-5 h-5 flex items-center justify-center text-brand-500 hover:bg-white transition-all cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-rose-400 p-1 hover:bg-rose-50 transition-all cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment & Checkout Section */}
        <div className="pt-6 border-t border-cream-200 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-brand-500/60">Subtotal</span>
              <span className="font-bold text-brand-900">{formatRupiah(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-base pt-2 border-t border-cream-100">
              <span className="font-bold text-brand-900">Total</span>
              <span className="font-bold text-brand-500 font-serif-heading text-lg">
                {formatRupiah(totalAmount)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-brand-500/70 uppercase tracking-wider mb-2">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((pm) => {
                const isSelected = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    id={`payment-method-${pm.id}`}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`py-2 px-1 text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      isSelected
                        ? "bg-brand-500 text-white border border-brand-500"
                        : "border border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white"
                    }`}
                  >
                    {pm.label}
                  </button>
                );
              })}
            </div>
          </div>

          {paymentMethod === "cash" && cart.length > 0 && (
            <div className="space-y-2 bg-cream-100 p-3 border border-cream-200">
              <label className="block text-[10px] font-semibold text-brand-500">
                Uang Tunai Diterima (Rp)
              </label>
              <input
                id="cash-paid-input"
                type="text"
                value={cashPaidInput}
                onChange={(e) => setCashPaidInput(e.target.value)}
                placeholder="Masukkan nominal..."
                className="w-full bg-white border border-cream-200 px-3 py-1.5 text-xs font-bold text-brand-500 focus:outline-none focus:border-brand-500"
              />

              <div className="flex flex-wrap gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => handleQuickCash(totalAmount)}
                  className="px-2 py-0.5 bg-white text-brand-500 border border-cream-200 text-[9px] font-bold hover:bg-cream-200 cursor-pointer"
                >
                  Uang Pas
                </button>
                {[20000, 50000, 100000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickCash(amt)}
                    className="px-2 py-0.5 bg-white text-brand-500 border border-cream-200 text-[9px] font-bold hover:bg-cream-200 cursor-pointer"
                  >
                    {formatRupiah(amt)}
                  </button>
                ))}
              </div>

              {numericCashPaid > 0 && (
                <div className="pt-2 flex justify-between items-center text-xs border-t border-cream-200">
                  <span className="text-brand-500/60">Kembalian:</span>
                  <span
                    className={`font-bold ${
                      changeAmount >= 0 ? "text-emerald-700" : "text-rose-600"
                    }`}
                  >
                    {changeAmount >= 0
                      ? formatRupiah(changeAmount)
                      : `Kurang ${formatRupiah(Math.abs(changeAmount))}`}
                  </span>
                </div>
              )}
            </div>
          )}

          <button
            id="btn-process-checkout"
            onClick={handleCheckout}
            disabled={
              cart.length === 0 ||
              processing ||
              (paymentMethod === "cash" && numericCashPaid < totalAmount)
            }
            className={`w-full py-3.5 px-4 font-bold text-base shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              cart.length === 0 ||
              processing ||
              (paymentMethod === "cash" && numericCashPaid < totalAmount)
                ? "bg-cream-200 text-brand-500/50 cursor-not-allowed shadow-none"
                : "bg-brand-500 text-white hover:bg-brand-900"
            }`}
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memproses Checkout...</span>
              </>
            ) : (
              <span>Checkout ({cart.length} items)</span>
            )}
          </button>
        </div>
      </aside>

      {/* Confirmation Modal */}
      <ConfirmTransactionModal
        open={showConfirm}
        title="Konfirmasi Transaksi"
        message="Apakah Anda yakin ingin melanjutkan transaksi ini?"
        confirmLabel="Ya, Lanjutkan"
        cancelLabel="Batal"
        onConfirm={confirmCheckout}
        onCancel={() => setShowConfirm(false)}
        details={[
          { label: "Jumlah Item", value: `${cart.length} items` },
          { label: "Metode Pembayaran", value: paymentMethod.toUpperCase() },
          { label: "Total", value: formatRupiah(totalAmount) },
        ]}
      />

      {/* Printable Receipt Modal */}
      {receipt && (
        <ReceiptModal
          receipt={receipt}
          sale={receipt}
          onClose={() => setReceipt(null)}
          onNewSale={() => setReceipt(null)}
        />
      )}
    </div>
  );
}
