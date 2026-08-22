import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { 
  Store, Receipt, RotateCcw, Save, 
  CheckCircle2, AlertTriangle
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentUser, storeSettings, updateSettings } = useApp();

  const [storeName, setStoreName] = useState(storeSettings.storeName);
  const [address, setAddress] = useState(storeSettings.address);
  const [phone, setPhone] = useState(storeSettings.phone);
  const [taxPercentage, setTaxPercentage] = useState(storeSettings.taxPercentage);
  const [receiptFooterMessage, setReceiptFooterMessage] = useState(storeSettings.receiptFooterMessage);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-zinc-200">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-zinc-900">Restricted Access</h3>
        <p className="text-xs text-zinc-500 mt-1">Store settings are only accessible by Admin.</p>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName: storeName.trim(),
      address: address.trim(),
      phone: phone.trim(),
      taxPercentage: Number(taxPercentage),
      receiptFooterMessage: receiptFooterMessage.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleConfirmReset = () => {
    localStorage.clear();
    setIsResetConfirmOpen(false);
    window.location.reload();
  };

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-zinc-900 tracking-tight">
          Store Settings
        </h2>
        <p className="text-xs text-zinc-500">
          Configure business details, receipt formatting, and tax rate
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Store Profile */}
        <Card className="space-y-3.5">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-2.5">
            <Store className="w-4 h-4 text-orange-600" />
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Store Profile
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Store Name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                label="Store Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div>
              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div>
              <Input
                label="Tax Rate (%)"
                type="number"
                min="0"
                max="50"
                value={taxPercentage}
                onChange={(e) => setTaxPercentage(Number(e.target.value))}
                helperText="0 = tax inclusive (nett)"
              />
            </div>
          </div>
        </Card>

        {/* Receipt Settings */}
        <Card className="space-y-3.5">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-2.5">
            <Receipt className="w-4 h-4 text-orange-600" />
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Receipt Customization
            </h3>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-700">
              Receipt Footer Message
            </label>
            <textarea
              rows={2}
              value={receiptFooterMessage}
              onChange={(e) => setReceiptFooterMessage(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
        </Card>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-1">
          {savedSuccess ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings saved!</span>
            </div>
          ) : <div />}

          <Button
            type="submit"
            variant="accent"
            icon={<Save className="w-4 h-4" />}
          >
            Save Settings
          </Button>
        </div>
      </form>

      {/* Reset Demo Data */}
      <Card className="space-y-2.5 border-rose-200 bg-rose-50/20">
        <div className="flex items-center gap-2 text-rose-900 border-b border-rose-100 pb-2">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Reset Demo Data
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-zinc-600">
          <p>
            Restore default items, inventory stock, and transactions.
          </p>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => setIsResetConfirmOpen(true)}
            icon={<RotateCcw className="w-3 h-3" />}
          >
            Reset Data
          </Button>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <ConfirmationDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset All Demo Data?"
        message="This action will clear all newly added transactions and reset products and staff back to default values."
        confirmLabel="Reset All Data"
      />
    </div>
  );
};
