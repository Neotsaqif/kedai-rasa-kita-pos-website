import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  Loader2,
  Check,
  X,
  Search,
  Filter,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { formatRupiah } from "../lib/format";

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category_id: "",
    price: "",
    stock_qty: "",
    is_active: true,
  });
  const [stockAdjustment, setStockAdjustment] = useState({
    enabled: false,
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

  const handleOpenModal = (product = null) => {
    setErrorMsg("");
    setStockAdjustment({ enabled: false, reason: "" });
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        category_id: product.category_id || "",
        price: product.price || "",
        stock_qty: product.stock_qty || "",
        is_active: product.is_active ?? true,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        sku: "",
        category_id: categories[0]?.id || "",
        price: "",
        stock_qty: "0",
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setErrorMsg("");
    setStockAdjustment({ enabled: false, reason: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) return;

    // Stock adjustment requires a reason
    if (
      editingProduct &&
      stockAdjustment.enabled &&
      !stockAdjustment.reason.trim()
    ) {
      setErrorMsg("Alasan penyesuaian stok wajib diisi.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim() || null,
      category_id: formData.category_id ? Number(formData.category_id) : null,
      price: parseFloat(formData.price),
      stock_qty: parseInt(formData.stock_qty || 0, 10),
      is_active: formData.is_active,
    };

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingProduct.id);
        if (error) throw error;

        // Log stock adjustment if enabled
        if (stockAdjustment.enabled) {
          const changeQty =
            parseInt(formData.stock_qty || 0, 10) -
            parseInt(editingProduct.stock_qty || 0, 10);
          if (changeQty !== 0) {
            const { error: logError } = await supabase
              .from("stock_logs")
              .insert([
                {
                  product_id: editingProduct.id,
                  change_qty: changeQty,
                  reason: "adjustment",
                },
              ]);
            if (logError) throw logError;
          }
        }
      } else {
        const { error } = await supabase.from("products").insert([payload]);
        if (error) throw error;
      }

      await fetchData();
      handleCloseModal();
    } catch (err) {
      setErrorMsg(err.message || "Gagal menyimpan produk");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus produk ini?")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      alert(err.message || "Gagal menghapus produk");
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      selectedCategory === "all" || p.category_id === Number(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const getStockBadge = (stock) => {
    const qty = Number(stock ?? 0);
    if (qty <= 0) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
          Habis
        </span>
      );
    }
    if (qty <= 5) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
          Stok {qty}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        Stok {qty}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-brand-900/10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-600" />
            Manajemen Produk & Stok
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Kelola katalog, harga, dan stok produk
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah Produk
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama produk atau SKU..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-brand-900/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
          />
        </div>
        <div className="relative w-48">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-brand-900/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm appearance-none"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Memuat produk...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-brand-900/10 shadow-sm text-gray-500 text-sm">
          <Package className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p>Tidak ada produk ditemukan.</p>
          <p className="text-xs text-gray-400 mt-1">
            Coba ubah kata kunci atau filter kategori.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-brand-900/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-cream-50 text-xs font-semibold text-gray-700 uppercase border-b border-brand-900/10">
                <tr>
                  <th className="px-6 py-4">SKU / Nama</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Harga</th>
                  <th className="px-6 py-4">Stok</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-cream-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{prod.name}</div>
                      <div className="text-xs text-gray-400">
                        {prod.sku || "Tanpa SKU"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-cream-100 text-brand-900 text-xs font-medium rounded-lg">
                        {prod.categories?.name || "Tanpa Kategori"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-brand-600">
                      {formatRupiah(prod.price)}
                    </td>
                    <td className="px-6 py-4">
                      {getStockBadge(prod.stock_qty)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          prod.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {prod.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal(prod)}
                        className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition"
                        title="Edit Produk"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Hapus Produk"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-900/10 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900">
                {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nama Produk
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Kopi Susu Gula Aren"
                    className="w-full px-4 py-2.5 bg-cream-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Kode SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    placeholder="KRK-BEV-001"
                    className="w-full px-4 py-2.5 bg-cream-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData({ ...formData, category_id: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-cream-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Harga (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="500"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="18000"
                    className="w-full px-4 py-2.5 bg-cream-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Jumlah Stok
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock_qty}
                    onChange={(e) =>
                      setFormData({ ...formData, stock_qty: e.target.value })
                    }
                    placeholder="50"
                    className="w-full px-4 py-2.5 bg-cream-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Stock Adjustment Reason (only when editing) */}
              {editingProduct && (
                <div className="p-3 bg-cream-50 rounded-xl border border-brand-900/10 space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stockAdjustment.enabled}
                      onChange={(e) =>
                        setStockAdjustment({
                          ...stockAdjustment,
                          enabled: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-brand-500 rounded border-gray-300 focus:ring-brand-500"
                    />
                    Penyesuaian stok (ubah jumlah stok)
                  </label>
                  {stockAdjustment.enabled && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Alasan Penyesuaian{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={stockAdjustment.reason}
                        onChange={(e) =>
                          setStockAdjustment({
                            ...stockAdjustment,
                            reason: e.target.value,
                          })
                        }
                        placeholder="e.g. Stok masuk dari supplier, barang rusak, dll."
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4 text-brand-500 rounded border-gray-300 focus:ring-brand-500"
                />
                <label
                  htmlFor="is_active"
                  className="text-xs font-semibold text-gray-700 select-none"
                >
                  Tersedia / Aktif untuk Penjualan POS
                </label>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {editingProduct ? "Simpan Perubahan" : "Buat Produk"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
