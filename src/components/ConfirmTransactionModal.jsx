import React from "react";
import { AlertTriangle, X, CheckCircle2 } from "lucide-react";

export default function ConfirmTransactionModal({
  open,
  title = "Konfirmasi Transaksi",
  message = "Apakah Anda yakin ingin melanjutkan transaksi ini?",
  confirmLabel = "Ya, Lanjutkan",
  cancelLabel = "Batal",
  onConfirm,
  onCancel,
  details,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-brand-900/50 backdrop-blur-xs">
      <div className="bg-white border border-cream-200 w-full max-w-sm overflow-hidden shadow-xl font-sans text-brand-900">
        {/* Header */}
        <div className="bg-amber-50 border-b border-amber-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <h3 className="font-bold text-amber-900 font-serif-heading text-sm">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-amber-800 hover:bg-amber-100 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 bg-cream-50">
          <p className="text-sm text-brand-900 leading-relaxed">{message}</p>

          {details && (
            <div className="mt-4 bg-white border border-cream-200 p-3 space-y-1.5 text-xs">
              {details.map((row, idx) => (
                <div
                  key={idx}
                  className="flex justify-between gap-2"
                >
                  <span className="text-brand-500/80">{row.label}</span>
                  <span className="font-bold text-brand-900">{row.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-cream-200 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-cream-100 border border-cream-200 hover:bg-cream-200 text-brand-500 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-brand-500 hover:bg-brand-900 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}