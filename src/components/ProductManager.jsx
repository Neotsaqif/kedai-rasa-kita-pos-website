import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Edit2,
  Power,
  Sliders,
  Search,
  AlertTriangle,
  X,
  Loader2,
  Check,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { formatRupiah } from "../lib/format";

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [adjustingProduct, setAdjustingProduct] = useState(null);

  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    category_id: "",
    price: "",
    stock_qty: "",
    image_url: "",
    is_active: true,
  });

  const [stockAdjustData, setStockAdjustData] = useState({
    type: "add",
    amount: "",
    reason: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        supabase
          .from("products")
          .select("*, categories(name)")
          .order("created_at", { ascending: false }),
        supabase
          .from("categories")
          .select("*")
          .order("name", { ascending: true }),
      ]);

      if (prodRes.error) throw prodRes.error;
      if (catRes.error) throw catRes.error;

      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      console.error("Error loading products/categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat =
      selectedCategory === "all" || p.category_id === Number(selectedCategory);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && p.is_active) ||
      (statusFilter === "inactive" && !p.is_active);
    return matchesSearch && matchesCat && matchesStatus;
  });

  const openAddModal = () => {
    setFormData({
      sku: `KRK-FB-${String(products.length + 1).padStart(3, "0")}`,
      name: "",
      category_id: categories[0]?.id || "",
      price: "",
      stock_qty: "10",
      image_url: "",
      is_active: true,
    });
    setErrorMsg("");
    setIsAddModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      sku: p.sku || "",
      name: p.name || "",
      category_id: p.category_id || "",
      price: p.price ? p.price.toString() : "",
      stock_qty: p.stock_qty ? p.stock_qty.toString() : "0",
      image_url: p.image_url || "",
      is_active: p.is_active ?? true,
    });
    setErrorMsg("");
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) return;

    setSubmitting(true);
    setErrorMsg("");

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim() || null,
      category_id: formData.category_id ? Number(formData.category_id) : null,
      price: parseFloat(formData.price),
      stock_qty: parseInt(formData.stock_qty || 0, 10),
      image_url: formData.image_url.trim() || null,
      is_active: formData.is_active,
    };

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingProduct.id);
        if (error) throw error;
        setEditingProduct(null);
      } else {
        const { error } = await supabase.from("products").insert([payload]);
        if (error) throw error;
        setIsAddModalOpen(false);
      }

      await fetchData();
    } catch (err) {
      setErrorMsg(err.message || "Gagal menyimpan produk");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (p) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_active: !p.is_active })
        .eq("id", p.id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      alert(err.message || "Gagal mengubah status produk");
    }
  };

  const handleStockAdjustmentSubmit = async (e) => {
    e.preventDefault();
    if (!adjustingProduct) return;

    const amt = parseInt(stockAdjustData.amount, 10) || 0;
    if (amt <= 0) return;

    const qtyChange = stockAdjustData.type === "add" ? amt : -amt;
    const newStock = Math.max(
      0,
      Number(adjustingProduct.stock_qty || 0) + qtyChange
    );

    setSubmitting(true);
    setErrorMsg("");

    try {
      // Update product stock
      const { error: updateErr } = await supabase
        .from("products")
        .update({ stock_qty: newStock })
        .eq("id", adjustingProduct.id);

      if (updateErr) throw updateErr;

      // Log stock adjustment
      await supabase.from("stock_logs").insert([
        {
          product_id: adjustingProduct.id,
          product_name: adjustingProduct.name,
          change_qty: qtyChange,
          quantity_change: qtyChange,
          reason: "adjustment",
          note: stockAdjustData.reason,
        },
      ]);

      setAdjustingProduct(null);
      setStockAdjustData({ type: "add", amount: "", reason: "" });
      await fetchData();
    } catch (err) {
      setErrorMsg(err.message || "Gagal mengupdate stok produk");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 font-sans text-brand-900 bg-cream-50">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-cream-200 p-5 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-brand-500" />
            <h1 className="text-xl font-bold text-brand-900 font-serif-heading">
              Manajemen Produk &amp; Stok
            </h1>
          </div>
          <p className="text-xs text-brand-500/70 mt-1">
            Kelola daftar menu, penyesuaian stok manual, dan status aktifasi produk shop.
          </p>
        </div>

        <button
          id="btn-add-product"
          onClick={openAddModal}
          className="bg-brand-500 hover:bg-brand-900 text-white font-bold px-5 py-2.5 text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah Produk Baru
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-cream-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center gap-3 justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-brand-500/60 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            id="product-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau SKU produk..."
            className="w-full bg-cream-100 text-brand-900 border border-cream-200 py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-brand-500/60"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <select
            id="product-cat-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-cream-100 text-brand-900 border border-cream-200 px-4 py-2 text-xs focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            id="product-status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-cream-100 text-brand-900 border border-cream-200 px-4 py-2 text-xs focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif Saja</option>
            <option value="inactive">Nonaktif Saja</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white border border-cream-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-brand-900">
            <thead className="bg-cream-100 text-brand-500 font-semibold border-b border-cream-200 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Produk</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Harga</th>
                <th className="py-3.5 px-4">Stok</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-brand-500/70 font-medium">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-brand-500" />
                    <span>Memuat data produk...</span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-brand-500/70 font-medium">
                    Tidak ada produk ditemukan.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const categoryName =
                    p.categories?.name ||
                    categories.find((c) => c.id === p.category_id)?.name ||
                    "Tanpa Kategori";
                  const stock = Number(p.stock_qty ?? p.stock ?? 0);

                  return (
                    <tr key={p.id} className="hover:bg-cream-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-brand-900 flex items-center gap-3">
                        <div className="w-9 h-9 bg-cream-100 border border-cream-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {p.image_url || p.imageUrl ? (
                            <img
                              src={p.image_url || p.imageUrl}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-4 h-4 text-brand-500/70" />
                          )}
                        </div>
                        <span className="font-serif-heading font-bold text-sm">
                          {p.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-brand-500/70">
                        {p.sku || `KRK-${p.id}`}
                      </td>
                      <td className="py-3 px-4 text-brand-500 font-medium">
                        {categoryName}
                      </td>
                      <td className="py-3 px-4 font-bold text-brand-500">
                        {formatRupiah(p.price)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold px-2.5 py-1 text-[11px] ${
                            stock <= 0
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : stock <= 10
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {stock} Unit
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {p.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-adjust-stock-${p.id}`}
                            onClick={() => {
                              setAdjustingProduct(p);
                              setStockAdjustData({ type: "add", amount: "", reason: "" });
                              setErrorMsg("");
                            }}
                            title="Penyesuaian Stok Manual"
                            className="p-1.5 bg-cream-100 hover:bg-cream-200 text-brand-500 border border-cream-200 transition-all cursor-pointer"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>

                          <button
                            id={`btn-edit-prod-${p.id}`}
                            onClick={() => openEditModal(p)}
                            title="Edit Produk"
                            className="p-1.5 bg-cream-100 hover:bg-cream-200 text-brand-500 border border-cream-200 transition-all cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            id={`btn-toggle-prod-${p.id}`}
                            onClick={() => handleToggleActive(p)}
                            title={p.is_active ? "Nonaktifkan Produk" : "Aktifkan Produk"}
                            className={`p-1.5 border transition-all cursor-pointer ${
                              p.is_active
                                ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-900/50 backdrop-blur-xs">
          <div className="bg-white border border-cream-200 w-full max-w-lg overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 bg-cream-100 border-b border-cream-200">
              <h3 className="text-base font-bold text-brand-900 font-serif-heading">
                {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="text-brand-500/70 hover:text-brand-900 p-1 hover:bg-cream-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="m-6 mb-0 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-brand-500 uppercase mb-1">
                    SKU Produk
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    placeholder="KRK-FB-001"
                    className="w-full bg-cream-100 border border-cream-200 px-4 py-2 text-brand-900 font-mono focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-brand-500 uppercase mb-1">
                    Kategori
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData({ ...formData, category_id: e.target.value })
                    }
                    className="w-full bg-cream-100 border border-cream-200 px-4 py-2 text-brand-900 focus:outline-none focus:border-brand-500 cursor-pointer"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-brand-500 uppercase mb-1">
                  Nama Produk
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Es Kopi Susu Aren"
                  className="w-full bg-cream-100 border border-cream-200 px-4 py-2 text-brand-900 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-brand-500 uppercase mb-1">
                    Harga (Rp)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="22000"
                    className="w-full bg-cream-100 border border-cream-200 px-4 py-2 text-brand-500 font-bold focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-brand-500 uppercase mb-1">
                    Jumlah Stok
                  </label>
                  <input
                    type="number"
                    value={formData.stock_qty}
                    onChange={(e) =>
                      setFormData({ ...formData, stock_qty: e.target.value })
                    }
                    placeholder="50"
                    className="w-full bg-cream-100 border border-cream-200 px-4 py-2 text-brand-900 font-bold focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-brand-500 uppercase mb-1">
                  URL Gambar (Opsional)
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-cream-100 border border-cream-200 px-4 py-2 text-brand-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="prod-active-check"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4 text-brand-500 border-cream-200 bg-cream-100 focus:ring-brand-500"
                />
                <label
                  htmlFor="prod-active-check"
                  className="font-semibold text-brand-900 cursor-pointer"
                >
                  Status Produk Aktif (Dapat dijual di POS)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 border border-cream-200 text-brand-500 hover:bg-cream-100 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-900 text-white font-bold shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Simpan Produk</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Stock Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-900/50 backdrop-blur-xs">
          <div className="bg-white border border-cream-200 w-full max-w-md overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 bg-cream-100 border-b border-cream-200">
              <h3 className="text-base font-bold text-brand-900 font-serif-heading">
                Penyesuaian Stok Manual
              </h3>
              <button
                onClick={() => setAdjustingProduct(null)}
                className="text-brand-500/70 hover:text-brand-900 p-1 hover:bg-cream-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="m-6 mb-0 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleStockAdjustmentSubmit} className="p-6 space-y-4 text-xs">
              <div className="bg-cream-100 p-3 border border-cream-200">
                <div className="text-brand-500/70">Produk:</div>
                <div className="font-bold text-brand-900 text-sm font-serif-heading">
                  {adjustingProduct.name}
                </div>
                <div className="text-brand-500 font-semibold mt-1">
                  Stok Saat Ini: {adjustingProduct.stock_qty || 0} Unit
                </div>
              </div>

              <div>
                <label className="block font-semibold text-brand-500 uppercase mb-1.5">
                  Tipe Penyesuaian
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setStockAdjustData({ ...stockAdjustData, type: "add" })
                    }
                    className={`py-2 px-3 border text-xs font-bold transition-all cursor-pointer ${
                      stockAdjustData.type === "add"
                        ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                        : "bg-cream-100 border-cream-200 text-brand-500/70"
                    }`}
                  >
                    + Tambah Stok (Restock)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setStockAdjustData({ ...stockAdjustData, type: "subtract" })
                    }
                    className={`py-2 px-3 border text-xs font-bold transition-all cursor-pointer ${
                      stockAdjustData.type === "subtract"
                        ? "bg-rose-100 border-rose-300 text-rose-800"
                        : "bg-cream-100 border-cream-200 text-brand-500/70"
                    }`}
                  >
                    - Kurangi Stok (Rusak/Audit)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-brand-500 uppercase mb-1">
                  Jumlah Perubahan Unit
                </label>
                <input
                  type="number"
                  min="1"
                  value={stockAdjustData.amount}
                  onChange={(e) =>
                    setStockAdjustData({
                      ...stockAdjustData,
                      amount: e.target.value,
                    })
                  }
                  placeholder="e.g. 25"
                  className="w-full bg-cream-100 border border-cream-200 px-4 py-2 text-brand-900 font-bold text-sm focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-brand-500 uppercase mb-1">
                  Alasan Penyesuaian Stok (Wajib Dilog)
                </label>
                <textarea
                  value={stockAdjustData.reason}
                  onChange={(e) =>
                    setStockAdjustData({
                      ...stockAdjustData,
                      reason: e.target.value,
                    })
                  }
                  placeholder="e.g. Restock mingguan dari supplier / Barang kadaluarsa / Inventaris ulang"
                  rows={3}
                  className="w-full bg-cream-100 border border-cream-200 p-3 text-brand-900 focus:outline-none focus:border-brand-500 placeholder:text-brand-500/60"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-4 py-2 border border-cream-200 text-brand-500 hover:bg-cream-100 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-900 text-white font-bold shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Simpan Log &amp; Update Stok</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
