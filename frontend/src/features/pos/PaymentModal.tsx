import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, Transaction } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { formatRupiah } from '../../utils/formatters';
import { 
  Banknote, QrCode, CreditCard, ArrowLeftRight, Check,
  AlertCircle
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transaction: Transaction) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { cart, cartTotal, completeTransaction, currentUser } = useApp();
  
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('CASH');
  const [cashGiven, setCashGiven] = useState<number>(cartTotal);
  const [customCashInput, setCustomCashInput] = useState<string>('');
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  React.useEffect(() => {
    setCashGiven(cartTotal);
    setCustomCashInput(cartTotal.toString());
  }, [cartTotal, isOpen]);

  const changeAmount = useMemo(() => {
    if (selectedMethod !== 'CASH') return 0;
    return Math.max(0, cashGiven - cartTotal);
  }, [cashGiven, cartTotal, selectedMethod]);

  const isCashInsufficient = selectedMethod === 'CASH' && cashGiven < cartTotal;

  const cashPresets = useMemo(() => {
    const presets = [cartTotal];
    const standardValues = [20000, 50000, 100000, 200000];
    
    standardValues.forEach(val => {
      if (val > cartTotal && !presets.includes(val)) {
        presets.push(val);
      }
    });

    return presets.slice(0, 4);
  }, [cartTotal]);

  const handlePresetClick = (amount: number) => {
    setCashGiven(amount);
    setCustomCashInput(amount.toString());
  };

  const handleCustomCashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setCustomCashInput(val);
    const num = parseInt(val, 10) || 0;
    setCashGiven(num);
  };

  const handleProcessCheckout = () => {
    if (selectedMethod === 'CASH' && isCashInsufficient) {
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      try {
        const createdTrx = completeTransaction(
          selectedMethod,
          selectedMethod === 'CASH' ? cashGiven : undefined,
          customerNotes
        );
        setIsProcessing(false);
        onSuccess(createdTrx);
      } catch (err) {
        setIsProcessing(false);
      }
    }, 200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Checkout & Payment"
      subtitle={`Cashier: ${currentUser?.name || 'Cashier'} • ${cart.length} item(s)`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Total Summary Banner */}
        <div className="p-4 rounded-xl bg-zinc-900 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
              Total Due
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-mono text-white mt-0.5">
              {formatRupiah(cartTotal)}
            </h3>
          </div>
          <span className="text-xs bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-md font-mono">
            {cart.reduce((s, i) => s + i.quantity, 0)} items
          </span>
        </div>

        {/* Payment Methods */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider">
            Payment Method
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'CASH' as PaymentMethod, label: 'Cash', icon: <Banknote className="w-4 h-4" /> },
              { id: 'QRIS' as PaymentMethod, label: 'QRIS', icon: <QrCode className="w-4 h-4" /> },
              { id: 'DEBIT' as PaymentMethod, label: 'Debit Card', icon: <CreditCard className="w-4 h-4" /> },
              { id: 'TRANSFER' as PaymentMethod, label: 'Transfer', icon: <ArrowLeftRight className="w-4 h-4" /> },
            ].map((method) => {
              const isSelected = selectedMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method.id)}
                  className={`
                    flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all cursor-pointer
                    ${isSelected 
                      ? 'border-orange-500 bg-orange-50 text-orange-700 font-semibold' 
                      : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                    }
                  `}
                >
                  <span className={`p-1.5 rounded mb-1 ${isSelected ? 'bg-orange-600 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                    {method.icon}
                  </span>
                  <span className="text-xs">{method.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cash Tendered View */}
        {selectedMethod === 'CASH' && (
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-700">Cash Received</span>
              {isCashInsufficient && (
                <span className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Insufficient amount
                </span>
              )}
            </div>

            {/* Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {cashPresets.map((preset, idx) => {
                const isSelected = cashGiven === preset;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className={`
                      py-1.5 px-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer font-mono
                      ${isSelected 
                        ? 'bg-zinc-900 text-white border-zinc-900 font-bold' 
                        : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
                      }
                    `}
                  >
                    {preset === cartTotal ? 'Exact' : formatRupiah(preset)}
                  </button>
                );
              })}
            </div>

            {/* Custom Input */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                Rp
              </span>
              <input
                type="text"
                value={customCashInput}
                onChange={handleCustomCashChange}
                placeholder="0"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-300 bg-white font-mono text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            {/* Change Due */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
              <span className="text-xs font-medium">Change Due</span>
              <span className="text-base font-bold font-mono text-emerald-700">
                {formatRupiah(changeAmount)}
              </span>
            </div>
          </div>
        )}

        {/* QRIS / Electronic View */}
        {selectedMethod === 'QRIS' && (
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-center space-y-2">
            <div className="w-28 h-28 mx-auto bg-white p-2 rounded-xl border border-zinc-300 flex items-center justify-center">
              <QrCode className="w-20 h-20 text-zinc-900" />
            </div>
            <p className="text-xs font-semibold text-zinc-800">Scan QRIS with any e-Wallet or Mobile Banking</p>
          </div>
        )}

        {selectedMethod === 'DEBIT' && (
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600">
            Swipe or insert card into EDC machine, enter PIN, then finalize payment.
          </div>
        )}

        {selectedMethod === 'TRANSFER' && (
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 space-y-1">
            <p>BCA: <strong className="font-mono">882-019-3382</strong> (Kedai Rasa Kita)</p>
            <p className="text-zinc-500 text-[11px]">Confirm proof of transfer before submitting.</p>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-700">
            Table # or Order Notes (Optional)
          </label>
          <input
            type="text"
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
            placeholder="e.g. Table 4, Takeaway..."
            className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="accent"
            fullWidth
            disabled={isCashInsufficient || isProcessing}
            onClick={handleProcessCheckout}
            icon={<Check className="w-4 h-4" />}
          >
            {isProcessing ? 'Processing...' : 'Complete Payment'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
