import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Transaction } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { ReceiptModal } from '../pos/ReceiptModal';
import { formatRupiah, formatDateTime } from '../../utils/formatters';
import { 
  Search, Eye, Printer, ArrowRight, User
} from 'lucide-react';

export const SalesHistoryPage: React.FC = () => {
  const { currentUser, transactions } = useApp();

  const isAdmin = currentUser?.role === 'ADMIN';

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDateFilter, setSelectedDateFilter] = useState<'ALL' | 'TODAY' | 'YESTERDAY' | 'WEEK'>('ALL');

  // Detail Modal & Receipt Modal
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().slice(0, 10);

  // Filter transactions based on role & search
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Role filter: cashier sees only own transactions
      if (!isAdmin && t.cashierId !== currentUser?.id) {
        return false;
      }

      // Search filter
      const matchesSearch = 
        t.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.cashierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.items.some(i => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));

      // Payment method filter
      const matchesMethod = selectedMethod === 'ALL' || t.paymentMethod === selectedMethod;

      // Status filter
      const matchesStatus = selectedStatus === 'ALL' || t.status === selectedStatus;

      // Date filter
      let matchesDate = true;
      if (selectedDateFilter === 'TODAY') {
        matchesDate = t.date.startsWith(todayStr);
      } else if (selectedDateFilter === 'YESTERDAY') {
        matchesDate = t.date.startsWith(yesterdayStr);
      } else if (selectedDateFilter === 'WEEK') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesDate = new Date(t.date) >= weekAgo;
      }

      return matchesSearch && matchesMethod && matchesStatus && matchesDate;
    });
  }, [transactions, isAdmin, currentUser, searchQuery, selectedMethod, selectedStatus, selectedDateFilter, todayStr, yesterdayStr]);

  const handleOpenDetail = (trx: Transaction) => {
    setSelectedTransaction(trx);
    setIsDetailModalOpen(true);
  };

  const handleReprintReceipt = () => {
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
            {isAdmin ? 'All Sales & Transactions' : 'My Shift Transactions'}
          </h2>
          <p className="text-xs text-zinc-500">
            {isAdmin 
              ? 'Complete list of transactions with itemized receipts and statuses' 
              : 'List of transactions processed during your working shift'}
          </p>
        </div>

        <div className="text-xs text-zinc-600 bg-white px-3 py-1.5 rounded-lg border border-zinc-200 shadow-2xs font-mono">
          Total: <strong className="text-zinc-900">{filteredTransactions.length} Orders</strong>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card padding="sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoice, item, cashier..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
            />
          </div>

          {/* Date Range Filter */}
          <select
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value as any)}
            className="w-full px-2.5 py-2 text-xs rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today Only</option>
            <option value="YESTERDAY">Yesterday</option>
            <option value="WEEK">Last 7 Days</option>
          </select>

          {/* Payment Method */}
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="w-full px-2.5 py-2 text-xs rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="CASH">CASH</option>
            <option value="QRIS">QRIS</option>
            <option value="DEBIT">Debit Card</option>
            <option value="TRANSFER">Bank Transfer</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-2.5 py-2 text-xs rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </Card>

      {/* Transactions Container */}
      {filteredTransactions.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            title="No Transactions Found"
            description="No transactions matched your search criteria or active filters."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedMethod('ALL');
              setSelectedStatus('ALL');
              setSelectedDateFilter('ALL');
            }}
          />
        </Card>
      ) : (
        <>
          {/* Mobile Card List (< sm) */}
          <div className="sm:hidden space-y-2.5">
            {filteredTransactions.map((trx) => (
              <div 
                key={trx.id}
                onClick={() => handleOpenDetail(trx)}
                className="bg-white rounded-xl border border-zinc-200 p-3.5 shadow-xs space-y-2.5 active:bg-zinc-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-zinc-900">
                        {trx.invoiceNumber}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 font-mono text-[9px] font-bold">
                        {trx.paymentMethod}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                      {formatDateTime(trx.date)}
                    </p>
                  </div>

                  <div>
                    {trx.status === 'COMPLETED' ? (
                      <Badge variant="success" size="sm" dot>Completed</Badge>
                    ) : (
                      <Badge variant="danger" size="sm" dot>Cancelled</Badge>
                    )}
                  </div>
                </div>

                {/* Items Summary */}
                <div className="text-xs text-zinc-600 bg-zinc-50 p-2 rounded-lg">
                  <p className="font-medium text-zinc-800 line-clamp-1">
                    {trx.items.map(i => `${i.productName} (${i.quantity}x)`).join(', ')}
                  </p>
                  {isAdmin && (
                    <p className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1">
                      <User className="w-3 h-3" /> Cashier: {trx.cashierName}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-zinc-100">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase font-medium block">Total</span>
                    <span className="font-mono font-bold text-sm text-zinc-900">
                      {formatRupiah(trx.total)}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetail(trx);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1.5 rounded-lg border border-orange-200/50 hover:bg-orange-100 transition-colors"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (>= sm) */}
          <div className="hidden sm:block">
            <Card padding="none" className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Date & Time</th>
                      {isAdmin && <th className="py-3 px-4">Cashier</th>}
                      <th className="py-3 px-4">Ordered Items</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-700">
                    {filteredTransactions.map((trx) => (
                      <tr key={trx.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-zinc-900">
                          {trx.invoiceNumber}
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-500 whitespace-nowrap">
                          {formatDateTime(trx.date)}
                        </td>
                        {isAdmin && (
                          <td className="py-3 px-4 font-medium text-zinc-900">
                            {trx.cashierName}
                          </td>
                        )}
                        <td className="py-3 px-4">
                          <p className="font-medium text-zinc-800 line-clamp-1 max-w-xs">
                            {trx.items.map(i => `${i.productName} (${i.quantity})`).join(', ')}
                          </p>
                          <span className="text-[10px] text-zinc-400">
                            Total {trx.items.reduce((s, i) => s + i.quantity, 0)} items
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-mono text-[10px] font-bold">
                            {trx.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-zinc-900 text-sm">
                          {formatRupiah(trx.total)}
                        </td>
                        <td className="py-3 px-4">
                          {trx.status === 'COMPLETED' ? (
                            <Badge variant="success" size="sm" dot>Completed</Badge>
                          ) : (
                            <Badge variant="danger" size="sm" dot>Cancelled</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleOpenDetail(trx)}
                            icon={<Eye className="w-3.5 h-3.5 text-orange-600" />}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Transaction Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Transaction Details"
        subtitle={selectedTransaction?.invoiceNumber}
        maxWidth="lg"
      >
        {selectedTransaction && (
          <div className="space-y-4">
            {/* Meta summary card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Time</span>
                <span className="font-medium text-zinc-800">{formatDateTime(selectedTransaction.date)}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Cashier</span>
                <span className="font-medium text-zinc-800">{selectedTransaction.cashierName}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Payment Method</span>
                <span className="font-bold text-zinc-800 font-mono">{selectedTransaction.paymentMethod}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Status</span>
                <Badge variant={selectedTransaction.status === 'COMPLETED' ? 'success' : 'danger'} size="sm">
                  {selectedTransaction.status}
                </Badge>
              </div>
            </div>

            {/* Itemized table */}
            <div className="border border-zinc-200 rounded-xl overflow-hidden">
              <div className="p-2.5 bg-zinc-50 border-b border-zinc-200 font-semibold text-xs text-zinc-700">
                Purchased Items ({selectedTransaction.items.length})
              </div>
              <div className="divide-y divide-zinc-100 text-xs">
                {selectedTransaction.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-zinc-900">{item.productName}</p>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        {item.quantity}x @ {formatRupiah(item.price)}
                      </p>
                      {item.notes && <p className="text-[10px] text-orange-600 italic mt-0.5">"{item.notes}"</p>}
                    </div>
                    <div className="font-mono font-bold text-zinc-900 text-right shrink-0">
                      {formatRupiah(item.subtotal)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Summary */}
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs space-y-1.5">
              <div className="flex justify-between text-zinc-600">
                <span>Items Subtotal</span>
                <span className="font-mono">{formatRupiah(selectedTransaction.subtotal)}</span>
              </div>
              {selectedTransaction.tax > 0 && (
                <div className="flex justify-between text-zinc-600">
                  <span>Tax (PPN)</span>
                  <span className="font-mono">{formatRupiah(selectedTransaction.tax)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-zinc-900 pt-1.5 border-t border-zinc-200">
                <span>Total Payment</span>
                <span className="font-mono text-base">{formatRupiah(selectedTransaction.total)}</span>
              </div>
              {selectedTransaction.cashGiven && (
                <div className="flex justify-between text-zinc-600 text-[11px] pt-1">
                  <span>Cash Given / Change</span>
                  <span className="font-mono">
                    {formatRupiah(selectedTransaction.cashGiven)} / {formatRupiah(selectedTransaction.change || 0)}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons in Modal */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleReprintReceipt}
                icon={<Printer className="w-4 h-4" />}
                className="flex-1"
              >
                Print Receipt
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reprint Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        transaction={selectedTransaction}
      />
    </div>
  );
};
