import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDateTime, formatDateOnly } from '../../utils/formatters';
import { 
  UserPlus, Edit3, Power, Search, 
  AlertTriangle, Phone, Lock
} from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const { currentUser, users, createCashier, updateCashier, toggleCashierStatus, transactions } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formError, setFormError] = useState('');

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-zinc-200">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-zinc-900">Restricted Access</h3>
        <p className="text-xs text-zinc-500 mt-1">Cashier account management is only accessible by Admin.</p>
      </div>
    );
  }

  // Filter cashier users
  const cashierUsers = useMemo(() => {
    return users.filter(u => u.role === 'CASHIER').filter(u => {
      return u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
             (u.phone && u.phone.includes(searchQuery));
    });
  }, [users, searchQuery]);

  // Count transactions per cashier
  const cashierStats = useMemo(() => {
    const map: Record<string, { count: number; totalSales: number }> = {};
    transactions.forEach(t => {
      if (t.status === 'REFUNDED') return;
      if (!map[t.cashierId]) map[t.cashierId] = { count: 0, totalSales: 0 };
      map[t.cashierId].count += 1;
      map[t.cashierId].totalSales += t.total;
    });
    return map;
  }, [transactions]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormName('');
    setFormUsername('');
    setFormPhone('');
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormUsername(user.username);
    setFormPhone(user.phone || '');
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Cashier full name is required.');
      return;
    }
    if (!editingUser && !formUsername.trim()) {
      setFormError('Username is required.');
      return;
    }

    if (editingUser) {
      updateCashier(editingUser.id, {
        name: formName.trim(),
        phone: formPhone.trim() || undefined,
      });
      setIsFormModalOpen(false);
    } else {
      const res = createCashier({
        name: formName.trim(),
        username: formUsername.trim().toLowerCase(),
        phone: formPhone.trim() || undefined,
      });
      if (res.success) {
        setIsFormModalOpen(false);
      } else {
        setFormError(res.message || 'Failed to create cashier account.');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
            Staff & Cashier Users
          </h2>
          <p className="text-xs text-zinc-500">
            Manage cashier logins and track their completed order metrics
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={handleOpenCreate}
          icon={<UserPlus className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          Add Cashier
        </Button>
      </div>

      {/* Search Toolbar */}
      <Card padding="sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cashier by name, username, or phone..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
          />
        </div>
      </Card>

      {/* Cashiers List */}
      {cashierUsers.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            title="No Cashier Accounts Found"
            description="No cashier staff accounts match your current search query."
            actionLabel="Add New Cashier"
            onAction={handleOpenCreate}
          />
        </Card>
      ) : (
        <>
          {/* Mobile Card List (< sm) */}
          <div className="sm:hidden space-y-2.5">
            {cashierUsers.map((user) => {
              const stat = cashierStats[user.id] || { count: 0, totalSales: 0 };
              const isActive = user.status === 'ACTIVE';

              return (
                <div key={user.id} className="bg-white rounded-xl border border-zinc-200 p-3.5 shadow-xs space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                      alt={user.name}
                      className="w-11 h-11 rounded-lg object-cover border border-zinc-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <h4 className="text-xs font-bold text-zinc-900 truncate">{user.name}</h4>
                        <Badge variant={isActive ? 'success' : 'neutral'} size="sm" dot>
                          {isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-zinc-500 font-mono font-medium">@{user.username}</p>
                      {user.phone && (
                        <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {user.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-400 block">Performance</span>
                      <span className="font-mono font-bold text-zinc-900">{stat.count} Orders</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 block">Last Active</span>
                      <span className="font-mono text-[11px] text-zinc-600">{formatDateTime(user.lastActive)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-zinc-100">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleOpenEdit(user)}
                      icon={<Edit3 className="w-3.5 h-3.5" />}
                      className="flex-1 min-h-[36px]"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={isActive ? 'danger' : 'outline'}
                      onClick={() => toggleCashierStatus(user.id)}
                      icon={<Power className="w-3.5 h-3.5" />}
                      className="min-h-[36px]"
                    >
                      {isActive ? 'Deactivate' : 'Activate'}
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
                      <th className="py-2.5 px-4">Cashier Staff</th>
                      <th className="py-2.5 px-4">Username</th>
                      <th className="py-2.5 px-4">Account Status</th>
                      <th className="py-2.5 px-4">Created Date</th>
                      <th className="py-2.5 px-4">Last Active</th>
                      <th className="py-2.5 px-4">Total Sales</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-700">
                    {cashierUsers.map((user) => {
                      const stat = cashierStats[user.id] || { count: 0, totalSales: 0 };
                      const isActive = user.status === 'ACTIVE';

                      return (
                        <tr key={user.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                                alt={user.name}
                                className="w-8 h-8 rounded-lg object-cover border border-zinc-200"
                              />
                              <div>
                                <p className="font-bold text-zinc-900">{user.name}</p>
                                {user.phone && (
                                  <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> {user.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-2.5 px-4 font-mono font-medium text-zinc-900">
                            @{user.username}
                          </td>

                          <td className="py-2.5 px-4">
                            <Badge variant={isActive ? 'success' : 'neutral'} size="sm" dot>
                              {isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>

                          <td className="py-2.5 px-4 text-zinc-500 font-mono">
                            {formatDateOnly(user.createdAt)}
                          </td>

                          <td className="py-2.5 px-4 text-zinc-500 font-mono">
                            {formatDateTime(user.lastActive)}
                          </td>

                          <td className="py-2.5 px-4 font-mono">
                            <span className="font-bold text-zinc-900">{stat.count}</span> orders
                          </td>

                          <td className="py-2.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEdit(user)}
                                className="p-1 rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
                                title="Edit Cashier"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => toggleCashierStatus(user.id)}
                                className={`p-1 rounded-md transition-colors cursor-pointer ${
                                  isActive 
                                    ? 'text-rose-500 hover:bg-rose-50' 
                                    : 'text-emerald-600 hover:bg-emerald-50'
                                }`}
                                title={isActive ? 'Deactivate' : 'Activate'}
                              >
                                <Power className="w-3.5 h-3.5" />
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

      {/* Add / Edit Cashier Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingUser ? 'Edit Cashier Account' : 'Create New Cashier Account'}
        subtitle="Cashier staff will use these credentials to log in to the POS"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-3.5">
          {formError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Cashier Full Name *"
            placeholder="e.g. Siti Rahmawati"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />

          <Input
            label="Login Username *"
            placeholder="e.g. sitikasir (no spaces)"
            value={formUsername}
            onChange={(e) => setFormUsername(e.target.value.replace(/\s+/g, '').toLowerCase())}
            disabled={!!editingUser}
            helperText={editingUser ? 'Username cannot be modified once created.' : 'Used by cashier to sign in'}
            required
          />

          <Input
            label="Phone / WhatsApp Number (Optional)"
            placeholder="e.g. 0812-3456-7890"
            value={formPhone}
            onChange={(e) => setFormPhone(e.target.value)}
          />

          {!editingUser && (
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1 text-xs text-zinc-600">
              <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                <Lock className="w-3.5 h-3.5 text-orange-600" />
                <span>Default Password Pattern</span>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-500">
                Default password is generated using <strong className="font-mono text-zinc-800">[username]123</strong> (e.g. for username <span className="font-mono text-orange-600">{formUsername || 'cashier'}</span>, password is <span className="font-mono text-orange-600">{formUsername || 'cashier'}123</span>).
              </p>
            </div>
          )}

          <div className="flex gap-2.5 pt-2 border-t border-zinc-100">
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
              {editingUser ? 'Save Changes' : 'Create Cashier'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
