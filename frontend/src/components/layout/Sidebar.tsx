import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, ShoppingBag, UtensilsCrossed, Layers, 
  ReceiptText, BarChart3, Users, Settings, LogOut,
  Store, X
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badgeCount?: number;
}

interface SidebarProps {
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenOnMobile, onCloseMobile }) => {
  const { currentUser, activeTab, setActiveTab, logout, products } = useApp();

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'ADMIN';

  // Count low stock products for admin
  const lowStockCount = products.filter(p => p.isActive && p.stock <= p.lowStockThreshold).length;

  const adminNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'pos', label: 'Point of Sale', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'products', label: 'Menu & Items', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { 
      id: 'stock', 
      label: 'Inventory', 
      icon: <Layers className="w-4 h-4" />,
      badgeCount: lowStockCount > 0 ? lowStockCount : undefined
    },
    { id: 'sales', label: 'Sales History', icon: <ReceiptText className="w-4 h-4" /> },
    { id: 'reports', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'users', label: 'Staff Accounts', icon: <Users className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const cashierNavItems: NavItem[] = [
    { id: 'pos', label: 'Point of Sale', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'sales', label: 'Transactions', icon: <ReceiptText className="w-4 h-4" /> },
  ];

  const navItems = isAdmin ? adminNavItems : cashierNavItems;

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const renderNavContent = () => (
    <div className="flex flex-col h-full bg-zinc-900 text-zinc-300">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-sm shrink-0">
            <Store className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-sm text-white truncate tracking-tight">
              Kedai Rasa Kita
            </h1>
            <p className="text-[11px] text-zinc-400 truncate">
              {isAdmin ? 'Store Manager' : 'Cashier Terminal'}
            </p>
          </div>
        </div>

        {/* Close button on mobile */}
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-3 px-2.5 space-y-1 overflow-y-auto">
        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          Menu
        </div>
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`
                w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium
                transition-all text-left cursor-pointer min-h-[38px]
                ${isActive 
                  ? 'bg-orange-600 text-white font-bold shadow-xs' 
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }
              `}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={isActive ? 'text-white' : 'text-zinc-400'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>

              {item.badgeCount !== undefined && item.badgeCount > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white text-orange-600' : 'bg-orange-600 text-white'
                }`}>
                  {item.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User profile & Logout */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/40 shrink-0">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-800/60">
          <img
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
            alt={currentUser.name}
            className="w-8 h-8 rounded-lg object-cover border border-zinc-700 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate leading-tight">
              {currentUser.name}
            </p>
            <p className="text-[10px] text-zinc-400 capitalize">
              {currentUser.role.toLowerCase()}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="mt-1.5 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex w-60 text-zinc-300 flex-col shrink-0 border-r border-zinc-800 select-none h-screen sticky top-0">
        {renderNavContent()}
      </aside>

      {/* 2. Mobile Drawer */}
      {isOpenOnMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {renderNavContent()}
          </div>
        </div>
      )}
    </>
  );
};
