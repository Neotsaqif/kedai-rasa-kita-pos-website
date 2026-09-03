import React, { useState, useEffect } from "react";
import { FolderTree, Plus, Edit2, Trash2, X, Loader2, Check } from "lucide-react";
import {
  fetchCategories as apiFetchCategories,
  fetchProductCategoryRefs as apiFetchProductCategoryRefs,
  createCategory as apiCreateCategory,
  updateCategory as apiUpdateCategory,
  deleteCategory as apiDeleteCategory,
} from "../lib/data";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catNameInput, setCatNameInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catData, prodRefs] = await Promise.all([
        apiFetchCategories(),
        apiFetchProductCategoryRefs(),
      ]);

      setCategories(catData || []);
      setProducts(prodRefs || []);
    } catch (err) {
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setCatNameInput("");
    setErrorMsg("");
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCategory(c);
    setCatNameInput(c.name || "");
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!catNameInput.trim()) return;

    setSubmitting(true);
    setErrorMsg("");

    try {
      if (editingCategory) {
        await apiUpdateCategory(editingCategory.id, catNameInput.trim());
        setEditingCategory(null);
      } else {
        await apiCreateCategory(catNameInput.trim());
        setIsAddModalOpen(false);
      }

      await fetchData();
    } catch (err) {
      setErrorMsg(err.message || "Gagal menyimpan kategori");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Yakin ingin menghapus kategori "${c.name}"?`)) return;

    try {
      await apiDeleteCategory(c.id);
      await fetchData();
    } catch (err) {
      alert(err.message || "Gagal menghapus kategori");
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 font-sans text-brand-900 bg-cream-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-cream-200 p-5 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-brand-500" />
            <h1 className="text-xl font-bold text-brand-900 font-serif-heading">
              Manajemen Kategori Menu
            </h1>
          </div>
          <p className="text-xs text-brand-500/70 mt-1">
            Kelola pengelompokan menu (Makanan, Minuman, Dessert, dll) untuk mempermudah transaksi POS.
          </p>
        </div>

        <button
          id="btn-add-category"
          onClick={handleOpenAdd}
          className="bg-brand-500 hover:bg-brand-900 text-white font-bold px-5 py-2.5 text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah Kategori Baru
        </button>
      </div>

      {/* Category List Cards */}
      {loading ? (
        <div className="bg-white border border-cream-200 p-12 text-center text-brand-500/60 flex items-center justify-center gap-2 font-medium">
          <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
          <span>Memuat kategori menu...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const productCount = products.filter(
              (p) => p.category_id === cat.id
            ).length;

            return (
              <div
                key={cat.id}
                className="bg-white border border-cream-200 p-5 shadow-xs flex items-center justify-between gap-4"
              >
                <div>
                  <h3 className="text-base font-bold text-brand-900 font-serif-heading">
                    {cat.name}
                  </h3>
                  <span className="text-xs text-brand-500/70 font-medium mt-1 block">
                    {productCount} produk terdaftar
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id={`btn-edit-cat-${cat.id}`}
                    onClick={() => handleOpenEdit(cat)}
                    className="p-2 bg-cream-100 hover:bg-cream-200 text-brand-500 border border-cream-200 transition-all cursor-pointer"
                    title="Edit Kategori"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    id={`btn-delete-cat-${cat.id}`}
                    onClick={() => handleDelete(cat)}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all cursor-pointer"
                    title="Hapus Kategori"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {(isAddModalOpen || editingCategory) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-900/50 backdrop-blur-xs">
          <div className="bg-white border border-cream-200 w-full max-w-md overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 bg-cream-100 border-b border-cream-200">
              <h3 className="text-base font-bold text-brand-900 font-serif-heading">
                {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCategory(null);
                }}
                className="text-brand-500/70 hover:text-brand-900 p-1 hover:bg-cream-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="m-6 mb-0 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-brand-500 uppercase mb-1.5">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  value={catNameInput}
                  onChange={(e) => setCatNameInput(e.target.value)}
                  placeholder="e.g. Minuman Dingin / Camilan"
                  className="w-full bg-cream-100 border border-cream-200 px-4 py-2.5 text-brand-900 focus:outline-none focus:border-brand-500 text-sm font-medium"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCategory(null);
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
                  <span>Simpan Kategori</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
