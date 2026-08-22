import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Clock, Shield, UserCircle, ShoppingCart, RefreshCw, Menu
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileNav?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileNav }) => {
  const { 
    currentUser, activeTab, setActiveTab, cart, login
  } = useApp();
  
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(now));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'ADMIN';

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Store Dashboard';
      case 'pos':
        return 'Point of Sale';
      case 'products':
        return 'Menu & Catalog';
      case 'stock':
        return 'Inventory & Stock';
      case 'sales':
        return isAdmin ? 'Sales History' : 'Shift Transactions';
      case 'reports':
        return 'Sales Analytics';
      case 'users':
        return 'Staff Accounts';
      case 'settings':
        return 'Store Settings';
      default:
        return 'Kedai Rasa Kita';
    }
  };

  const handleQuickSwitch = () => {
    if (isAdmin) {
      login('cashier', 'cashier123');
    } else {
      login('admin', 'admin123');
    }
  };

  const totalCartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <header className="h-14 bg-white border-b border-zinc-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Left: Mobile Drawer Trigger + Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="lg:hidden p-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-zinc-900 leading-tight truncate">
            {getPageTitle(activeTab)}
          </h2>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Open
          </span>
        </div>
      </div>

      {/* Right: Live time, Cart Shortcut, Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Live Clock */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          <span>{timeStr}</span>
        </div>

        {/* Quick Cart button if not on POS */}
        {activeTab !== 'pos' && (
          <button
            onClick={() => setActiveTab('pos')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 text-xs font-semibold transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">POS</span>
            {totalCartCount > 0 && (
              <span className="px-1.5 py-0.2 bg-orange-600 text-white text-[10px] font-bold rounded-full">
                {totalCartCount}
              </span>
            )}
          </button>
        )}

        {/* Role badge & quick switcher */}
        <div className="flex items-center gap-1 bg-zinc-50 px-2 py-1 rounded-lg border border-zinc-200">
          <div className="flex items-center gap-1 text-xs text-zinc-700 font-medium">
            {isAdmin ? (
              <Shield className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            ) : (
              <UserCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            )}
            <span className="hidden sm:inline truncate max-w-[70px]">{currentUser.name.split(' ')[0]}</span>
          </div>

          <button
            onClick={handleQuickSwitch}
            title={isAdmin ? 'Switch to Cashier demo' : 'Switch to Admin demo'}
            className="text-[11px] font-medium text-zinc-500 hover:text-zinc-900 p-0.5 hover:bg-zinc-200/60 rounded transition-colors cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden lg:inline">{isAdmin ? 'Cashier' : 'Admin'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
