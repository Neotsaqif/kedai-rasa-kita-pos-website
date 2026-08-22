import React from 'react';
import { Product } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { Plus, Check, Ban } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  inCartQuantity?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  inCartQuantity = 0,
}) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= product.lowStockThreshold;

  return (
    <div
      onClick={() => {
        if (!isOutOfStock && product.isActive) {
          onAddToCart(product);
        }
      }}
      className={`
        group relative flex flex-col justify-between bg-white rounded-xl border transition-all select-none text-left overflow-hidden
        ${isOutOfStock 
          ? 'opacity-50 border-zinc-200 cursor-not-allowed bg-zinc-50' 
          : 'border-zinc-200/80 hover:border-orange-500/50 hover:shadow-sm cursor-pointer active:scale-[0.99]'
        }
      `}
    >
      {/* Image Container */}
      <div className="relative h-28 sm:h-32 w-full bg-zinc-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-200 ${
            !isOutOfStock ? 'group-hover:scale-105' : 'grayscale'
          }`}
          loading="lazy"
        />

        {/* Stock Badge */}
        <div className="absolute top-2 left-2">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 bg-zinc-900/80 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
              <Ban className="w-2.5 h-2.5" /> Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center bg-amber-500/90 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
              {product.stock} left
            </span>
          ) : null}
        </div>

        {/* In-cart counter */}
        {inCartQuantity > 0 && (
          <div className="absolute top-2 right-2 bg-orange-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
            {inCartQuantity}
          </div>
        )}
      </div>

      {/* Info Container */}
      <div className="p-3 flex flex-col justify-between flex-1 gap-2">
        <div>
          <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider block">
            {product.category}
          </span>
          <h4 className="text-xs font-semibold text-zinc-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
            {product.name}
          </h4>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-zinc-100">
          <span className="text-xs sm:text-sm font-bold text-zinc-900">
            {formatRupiah(product.price)}
          </span>

          <button
            type="button"
            disabled={isOutOfStock || !product.isActive}
            className={`
              w-6 h-6 rounded-md flex items-center justify-center transition-colors cursor-pointer
              ${isOutOfStock 
                ? 'bg-zinc-100 text-zinc-400' 
                : inCartQuantity > 0 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-zinc-100 text-zinc-700 hover:bg-orange-600 hover:text-white'
              }
            `}
            aria-label="Add item"
          >
            {inCartQuantity > 0 ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
