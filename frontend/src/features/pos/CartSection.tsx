import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { 
  ShoppingCart, Trash2, Plus, Minus, FileText, ArrowRight, RotateCcw
} from 'lucide-react';
import { CartItem } from '../../types';

interface CartSectionProps {
  onOpenPaymentModal: () => void;
}

export const CartSection: React.FC<CartSectionProps> = ({ onOpenPaymentModal }) => {
  const { 
    cart, updateQuantity, updateNotes, clearCart, 
    cartSubtotal, cartTotal, storeSettings 
  } = useApp();

  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');

  const handleOpenNotes = (item: CartItem) => {
    setEditingNotesId(item.product.id);
    setTempNotes(item.notes || '');
  };

  const handleSaveNotes = (productId: string) => {
    updateNotes(productId, tempNotes.trim());
    setEditingNotesId(null);
  };

  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden select-none">
      {/* Cart Header */}
      <div className="p-3.5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-orange-600" />
          <h3 className="text-xs sm:text-sm font-bold text-zinc-900 leading-tight">
            Current Order
          </h3>
          <span className="px-1.5 py-0.5 rounded-full bg-zinc-200 text-zinc-700 text-[10px] font-bold">
            {totalItemCount}
          </span>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-[11px] font-medium text-zinc-500 hover:text-rose-600 p-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
            title="Clear cart"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center mb-2 text-zinc-400">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-zinc-700">No items selected</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Select items from the menu to build order
            </p>
          </div>
        ) : (
          cart.map((item) => {
            const isEditingNote = editingNotesId === item.product.id;
            const itemSubtotal = item.product.price * item.quantity;

            return (
              <div
                key={item.product.id}
                className="p-2.5 rounded-lg border border-zinc-200/70 bg-zinc-50/30 hover:bg-zinc-50/80 transition-colors space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-semibold text-zinc-900 leading-tight truncate">
                      {item.product.name}
                    </h5>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      {formatRupiah(item.product.price)}
                    </p>
                  </div>
                  
                  <span className="text-xs font-bold text-zinc-900 font-mono shrink-0">
                    {formatRupiah(itemSubtotal)}
                  </span>
                </div>

                {/* Notes Input or Note Trigger */}
                {isEditingNote ? (
                  <div className="pt-1 space-y-1">
                    <input
                      type="text"
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      placeholder="Special instructions..."
                      className="w-full text-xs px-2 py-1 rounded border border-orange-400 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                      autoFocus
                    />
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingNotesId(null)}
                        className="text-[10px] text-zinc-500 hover:text-zinc-700 px-1.5 py-0.5 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveNotes(item.product.id)}
                        className="text-[10px] bg-orange-600 text-white font-medium px-2 py-0.5 rounded hover:bg-orange-700 cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    {item.notes ? (
                      <button
                        onClick={() => handleOpenNotes(item)}
                        className="text-orange-600 hover:underline flex items-center gap-1 italic text-[10px] truncate max-w-[150px] cursor-pointer"
                      >
                        <FileText className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">"{item.notes}"</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenNotes(item)}
                        className="text-zinc-400 hover:text-zinc-600 flex items-center gap-1 text-[10px] cursor-pointer"
                      >
                        <FileText className="w-2.5 h-2.5" />
                        <span>Add note</span>
                      </button>
                    )}

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-md p-0.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-5 h-5 rounded flex items-center justify-center text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                        aria-label="Decrease"
                      >
                        {item.quantity === 1 ? (
                          <Trash2 className="w-2.5 h-2.5 text-rose-500" />
                        ) : (
                          <Minus className="w-2.5 h-2.5" />
                        )}
                      </button>

                      <span className="w-5 text-center font-semibold text-xs text-zinc-900 font-mono">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-5 h-5 rounded flex items-center justify-center text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                        disabled={item.quantity >= item.product.stock}
                        aria-label="Increase"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Cart Summary & Action */}
      <div className="p-3.5 border-t border-zinc-200 bg-zinc-50/50 space-y-2.5 shrink-0">
        <div className="space-y-1 text-xs text-zinc-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-mono text-zinc-800">{formatRupiah(cartSubtotal)}</span>
          </div>
          {storeSettings.taxPercentage > 0 && (
            <div className="flex justify-between text-[11px] text-zinc-500">
              <span>Tax ({storeSettings.taxPercentage}%)</span>
              <span className="font-mono text-zinc-800">
                {formatRupiah((cartSubtotal * storeSettings.taxPercentage) / 100)}
              </span>
            </div>
          )}
          <div className="pt-1.5 border-t border-zinc-200 flex justify-between items-baseline">
            <span className="text-xs font-bold text-zinc-900">Total</span>
            <span className="text-base font-black text-zinc-900 font-mono">
              {formatRupiah(cartTotal)}
            </span>
          </div>
        </div>

        <Button
          variant="accent"
          size="md"
          fullWidth
          disabled={cart.length === 0}
          onClick={onOpenPaymentModal}
          icon={<ArrowRight className="w-4 h-4" />}
          iconPosition="right"
        >
          Checkout ({totalItemCount})
        </Button>
      </div>
    </div>
  );
};
