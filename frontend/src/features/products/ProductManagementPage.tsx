import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductCategory } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatRupiah } from '../../utils/formatters';
import { 
  Plus, Search, Edit3, Trash2, AlertTriangle, 
  CheckCircle2, XCircle
} from 'lucide-react';

const CATEGORIES: ProductCategory[] = [
  'Main Dishes',
  'Noodles & Meatballs',
  'Snacks & Appetizers',
  'Cold Drinks',
  'Indonesian Coffee',
  'Hot Drinks',
];

const PRESET_IMAGES = [
  { label: 'Fried Rice', url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&auto=format&fit=crop&q=80' },
  { label: 'Fried Chicken', url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&auto=format&fit=crop&q=80' },
  { label: 'Fried Noodles', url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&auto=format&fit=crop&q=80' },
  { label: 'Meatball Soup', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&auto=format&fit=crop&q=80' },
  { label: 'Banana Snack', url: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400&auto=format&fit=crop&q=80' },
  { label: 'Iced Sweet Tea', url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&auto=format&fit=crop&q=80' },
  { label: 'Iced Milk Coffee', url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=400&auto=format&fit=crop&q=80' },
  { label: 'Hot Ginger Drink', url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80' },
];

export const ProductManagementPage: React.FC = () => {
  const { 
    currentUser, products, addProduct, updateProduct, 
    toggleProductStatus, deleteProduct 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'LOW_STOCK' | 'INACTIVE'>('ALL');

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('Main Dishes');
  const [formPrice, setFormPrice] = useState<number>(20000);
  const [formCostPrice, setFormCostPrice] = useState<number>(10000);
  const [formStock, setFormStock] = useState<number>(30);
  const [formLowThreshold, setFormLowThreshold] = useState<number>(10);
  const [formImage, setFormImage] = useState<string>(PRESET_IMAGES[0].url);
  const [formDescription, setFormDescription] = useState('');
  const [formError, setFormError] = useState('');

  // Guard admin role
  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-zinc-200">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-zinc-900">Restricted Access</h3>
        <p className="text-xs text-zinc-500 mt-1">The product catalog is only accessible by Admin.</p>
      </div>
    );
  }

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesStatus = true;
      if (selectedStatus === 'ACTIVE') matchesStatus = p.isActive;
      if (selectedStatus === 'INACTIVE') matchesStatus = !p.isActive;
      if (selectedStatus === 'LOW_STOCK') matchesStatus = p.isActive && p.stock <= p.lowStockThreshold;

      return matchesCategory && matchesSearch && matchesStatus;
    });
  }, [products, searchQuery, selectedCategory, selectedStatus]);

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('Main Dishes');
    setFormPrice(20000);
    setFormCostPrice(10000);
    setFormStock(30);
    setFormLowThreshold(10);
    setFormImage(PRESET_IMAGES[0].url);
    setFormDescription('');
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormCategory(prod.category);
    setFormPrice(prod.price);
    setFormCostPrice(prod.costPrice || Math.round(prod.price * 0.5));
    setFormStock(prod.stock);
    setFormLowThreshold(prod.lowStockThreshold);
    setFormImage(prod.image);
    setFormDescription(prod.description || '');
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Product name is required.');
      return;
    }
    if (formPrice <= 0) {
      setFormError('Price must be greater than Rp 0.');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formName.trim(),
        category: formCategory,
        price: Number(formPrice),
        costPrice: Number(formCostPrice),
        stock: Number(formStock),
        lowStockThreshold: Number(formLowThreshold),
        image: formImage || PRESET_IMAGES[0].url,
        description: formDescription.trim(),
      });
    } else {
      addProduct({
        name: formName.trim(),
        category: formCategory,
        price: Number(formPrice),
        costPrice: Number(formCostPrice),
        stock: Number(formStock),
        lowStockThreshold: Number(formLowThreshold),
        image: formImage || PRESET_IMAGES[0].url,
        description: formDescription.trim(),
        isActive: true,
      });
    }

    setIsFormModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deletingProductId) {
      deleteProduct(deletingProductId);
      setDeletingProductId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
            Menu & Products
          </h2>
          <p className="text-xs text-zinc-500">
            {products.length} items total ({products.filter(p => p.isActive).length} active)
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={handleOpenCreateModal}
          icon={<Plus className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          Add Product
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card padding="sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name or SKU..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-2.5 py-2 text-xs rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="w-full px-2.5 py-2 text-xs rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="LOW_STOCK">Low Stock / Out of Stock</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </Card>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            title="No Products Found"
            description="No products match your selected criteria."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setSelectedStatus('ALL');
            }}
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
                  <div className="flex items-start gap-3">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-14 h-14 rounded-lg object-cover border border-zinc-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[10px] text-zinc-400 font-mono">{prod.sku}</span>
                        <button
                          onClick={() => toggleProductStatus(prod.id)}
                          className="cursor-pointer"
                          title="Toggle Status"
                        >
                          <Badge variant={prod.isActive ? 'success' : 'neutral'} size="sm" dot>
                            {prod.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </button>
                      </div>
                      <h4 className="text-xs font-bold text-zinc-900 truncate mt-0.5">{prod.name}</h4>
                      <p className="text-[11px] text-zinc-500">{prod.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-400 block">Selling Price</span>
                      <span className="font-mono font-bold text-zinc-900 text-sm">{formatRupiah(prod.price)}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 block">Current Stock</span>
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="font-mono font-bold text-zinc-800">{prod.stock}</span>
                        {isOutOfStock ? (
                          <Badge variant="danger" size="sm">Out</Badge>
                        ) : isLowStock ? (
                          <Badge variant="warning" size="sm">Low</Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-zinc-100">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleOpenEditModal(prod)}
                      icon={<Edit3 className="w-3.5 h-3.5" />}
                      className="flex-1 min-h-[36px]"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeletingProductId(prod.id)}
                      icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                      className="min-h-[36px] px-3"
                    >
                      Delete
                    </Button>
                  </div>
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
                      <th className="py-2.5 px-3.5">Product</th>
                      <th className="py-2.5 px-3.5">Category & SKU</th>
                      <th className="py-2.5 px-3.5">Price</th>
                      <th className="py-2.5 px-3.5">Stock</th>
                      <th className="py-2.5 px-3.5">Status</th>
                      <th className="py-2.5 px-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-700">
                    {filteredProducts.map((prod) => {
                      const isOutOfStock = prod.stock <= 0;
                      const isLowStock = !isOutOfStock && prod.stock <= prod.lowStockThreshold;

                      return (
                        <tr key={prod.id} className="hover:bg-zinc-50 transition-colors">
                          {/* Product Name & Photo */}
                          <td className="py-2.5 px-3.5">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-9 h-9 rounded-lg object-cover border border-zinc-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="font-semibold text-zinc-900 truncate">{prod.name}</p>
                                {prod.description && (
                                  <p className="text-[10px] text-zinc-400 line-clamp-1 max-w-xs">{prod.description}</p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Category & SKU */}
                          <td className="py-2.5 px-3.5">
                            <span className="font-medium text-zinc-800">{prod.category}</span>
                            <p className="text-[10px] font-mono text-zinc-400">{prod.sku}</p>
                          </td>

                          {/* Selling Price */}
                          <td className="py-2.5 px-3.5 font-mono font-bold text-zinc-900">
                            {formatRupiah(prod.price)}
                          </td>

                          {/* Stock with Alert */}
                          <td className="py-2.5 px-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-semibold">{prod.stock}</span>
                              {isOutOfStock ? (
                                <Badge variant="danger" size="sm">Out of stock</Badge>
                              ) : isLowStock ? (
                                <Badge variant="warning" size="sm">Low ({prod.stock})</Badge>
                              ) : (
                                <Badge variant="success" size="sm">In Stock</Badge>
                              )}
                            </div>
                          </td>

                          {/* Active Status */}
                          <td className="py-2.5 px-3.5">
                            <button
                              onClick={() => toggleProductStatus(prod.id)}
                              className="cursor-pointer"
                              title={prod.isActive ? 'Click to deactivate' : 'Click to activate'}
                            >
                              <Badge variant={prod.isActive ? 'success' : 'neutral'} size="sm" dot>
                                {prod.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-2.5 px-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEditModal(prod)}
                                className="p-1 rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeletingProductId(prod.id)}
                                className="p-1 rounded-md text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
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

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        subtitle="Specify item pricing, category, and initial stock"
        maxWidth="md"
      >
        <form onSubmit={handleSaveProduct} className="space-y-3.5">
          {formError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-3">
            <Input
              label="Product Name"
              placeholder="e.g. Special Fried Rice"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Price (Rp)"
                type="number"
                min="0"
                step="500"
                value={formPrice}
                onChange={(e) => setFormPrice(Number(e.target.value))}
                required
              />

              <Input
                label="Stock Quantity"
                type="number"
                min="0"
                value={formStock}
                onChange={(e) => setFormStock(Number(e.target.value))}
                required
              />
            </div>

            <Input
              label="Low Stock Warning Limit"
              type="number"
              min="1"
              value={formLowThreshold}
              onChange={(e) => setFormLowThreshold(Number(e.target.value))}
              helperText="Alerts when stock drops below this number"
              required
            />
          </div>

          {/* Preset Photo Picker */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-700">
              Select Photo
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {PRESET_IMAGES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormImage(preset.url)}
                  className={`
                    relative rounded-lg overflow-hidden border text-left h-12 group transition-all cursor-pointer
                    ${formImage === preset.url ? 'border-orange-600 ring-2 ring-orange-500/20' : 'border-zinc-200 hover:border-zinc-400'}
                  `}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[8px] font-medium px-1 py-0.5 truncate">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-700">
              Short Description (Optional)
            </label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="e.g. Served with crackers and pickles..."
              className="w-full text-xs p-2 rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-zinc-100">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setIsFormModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              fullWidth
            >
              {editingProduct ? 'Save Changes' : 'Add Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingProductId}
        onClose={() => setDeletingProductId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product?"
        message="This product will be permanently removed from the catalog."
        confirmLabel="Delete Product"
      />
    </div>
  );
};
