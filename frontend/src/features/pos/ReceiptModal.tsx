import React from 'react';
import { Transaction } from '../../types';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { formatRupiah, formatDateTime } from '../../utils/formatters';
import { Printer, CheckCircle, Plus, Copy, Check } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  const { storeSettings, showToast } = useApp();
  const [copied, setCopied] = React.useState(false);

  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
    showToast('success', 'Print command sent to thermal receipt printer.', 'Printing Receipt');
  };

  const handleCopySummary = () => {
    const text = `
=== ${storeSettings.storeName.toUpperCase()} ===
Invoice #   : ${transaction.invoiceNumber}
Date & Time : ${formatDateTime(transaction.date)}
Cashier     : ${transaction.cashierName}
Method      : ${transaction.paymentMethod}
---------------------------------
${transaction.items.map(i => `${i.productName} (${i.quantity}x) = ${formatRupiah(i.subtotal)}`).join('\n')}
---------------------------------
TOTAL       : ${formatRupiah(transaction.total)}
${transaction.cashGiven ? `Cash        : ${formatRupiah(transaction.cashGiven)}\nChange      : ${formatRupiah(transaction.change || 0)}` : ''}
=================================
${storeSettings.receiptFooterMessage}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('info', 'Receipt summary copied to clipboard.');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Payment Successful"
      subtitle="Transaction completed and recorded"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Success Banner */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2.5 text-emerald-900">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <p className="font-semibold">Order #{transaction.invoiceNumber}</p>
            <p className="text-emerald-700 text-[11px]">{formatDateTime(transaction.date)}</p>
          </div>
        </div>

        {/* Thermal Receipt Box */}
        <div 
          id="printable-receipt"
          className="bg-white p-5 rounded-xl border border-zinc-200 font-mono text-xs text-zinc-800 space-y-3 print:border-none print:p-0"
        >
          {/* Header */}
          <div className="text-center space-y-0.5 border-b border-dashed border-zinc-300 pb-2.5">
            <h4 className="font-bold text-xs text-zinc-900 tracking-wider">
              {storeSettings.storeName.toUpperCase()}
            </h4>
            <p className="text-[10px] text-zinc-500 font-sans">{storeSettings.address}</p>
            <p className="text-[10px] text-zinc-500 font-sans">Tel: {storeSettings.phone}</p>
          </div>

          {/* Meta */}
          <div className="text-[11px] space-y-1 border-b border-dashed border-zinc-300 pb-2.5 font-sans">
            <div className="flex justify-between">
              <span className="text-zinc-500">Invoice:</span>
              <span className="font-bold font-mono">{transaction.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Cashier:</span>
              <span>{transaction.cashierName}</span>
            </div>
            {transaction.notes && (
              <div className="flex justify-between text-orange-700">
                <span className="font-medium">Note:</span>
                <span className="font-medium">{transaction.notes}</span>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="space-y-1.5 border-b border-dashed border-zinc-300 pb-2.5">
            {transaction.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5 font-sans">
                <div className="flex justify-between text-xs">
                  <span className="truncate pr-2">{item.productName}</span>
                  <span className="font-mono font-medium">{formatRupiah(item.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>{item.quantity} x {formatRupiah(item.price)}</span>
                  {item.notes && <span className="italic text-orange-600">({item.notes})</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1 border-b border-dashed border-zinc-300 pb-2.5 font-sans text-xs">
            <div className="flex justify-between text-zinc-500 text-[11px]">
              <span>Subtotal</span>
              <span className="font-mono">{formatRupiah(transaction.subtotal)}</span>
            </div>
            {transaction.tax > 0 && (
              <div className="flex justify-between text-zinc-500 text-[11px]">
                <span>Tax</span>
                <span className="font-mono">{formatRupiah(transaction.tax)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-zinc-900 pt-1 text-sm">
              <span>TOTAL</span>
              <span className="font-mono">{formatRupiah(transaction.total)}</span>
            </div>
            <div className="flex justify-between text-zinc-500 text-[11px]">
              <span>Payment ({transaction.paymentMethod})</span>
              {transaction.paymentMethod === 'CASH' && transaction.cashGiven && (
                <span className="font-mono">{formatRupiah(transaction.cashGiven)}</span>
              )}
            </div>
            {transaction.paymentMethod === 'CASH' && transaction.change !== undefined && (
              <div className="flex justify-between text-emerald-700 font-bold text-[11px]">
                <span>Change</span>
                <span className="font-mono">{formatRupiah(transaction.change)}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center pt-1 font-sans text-zinc-400 text-[10px]">
            <p>{storeSettings.receiptFooterMessage}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={handleCopySummary}
            icon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            className="flex-1"
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4" />}
            className="flex-1"
          >
            Print
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={onClose}
            icon={<Plus className="w-4 h-4" />}
            className="flex-1"
          >
            New Sale
          </Button>
        </div>
      </div>
    </Modal>
  );
};
