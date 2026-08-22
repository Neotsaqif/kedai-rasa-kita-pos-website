import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, ShoppingBag, UtensilsCrossed, Layers, 
  ReceiptText, Menu
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMoreMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMoreMenu }) => {
  const { currentUser, activeTab, setActiveTab, cart, products } = useApp();

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'ADMIN';
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockCount = products.filter(p => p.isActive && p.stock <= p.lowStockThreshold).length;

  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { 
      id: 'pos', 
      label: 'POS', 
      icon: <ShoppingBag className="w-5 h-5" />,
      badge: totalCartCount > 0 ? totalCartCount : undefined,
      badgeColor: 'bg-orange-600'
    },
    { id: 'products', label: 'Menu', icon: <UtensilsCrossed className="w-5 h-5" /> },
    { 
      id: 'stock', 
      label: 'Inventory', 
      icon: <Layers className="w-5 h-5" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-amber-500'
    },
  ];

  const cashierNavItems = [
    { 
      id: 'pos', 
      label: 'POS Terminal', 
      icon: <ShoppingBag className="w-5 h-5" />,
      badge: totalCartCount > 0 ? totalCartCount : undefined,
      badgeColor: 'bg-orange-600'
    },
    { id: 'sales', label: 'Transactions', icon: <ReceiptText className="w-5 h-5" /> },
  ];

  const navItems = isAdmin ? adminNavItems : cashierNavItems;

  return (
    <nav 
      aria-label="Mobile navigation" 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 shadow-lg px-2 py-1.5 safe-area-inset-bottom"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[48px]
                ${isActive 
                  ? 'text-orange-600 font-bold' 
                  : 'text-zinc-500 hover:text-zinc-900 font-medium'
                }
              `}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && (
                  <span className={`absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center ${item.badgeColor || 'bg-orange-600'}`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 leading-tight tracking-tight">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-0.5" />
              )}
            </button>
          );
        })}

        {/* More Menu Trigger */}
        <button
          onClick={onOpenMoreMenu}
          className="relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-zinc-500 hover:text-zinc-900 transition-all cursor-pointer min-h-[48px]"
        >
          <div className="relative">
            <Menu className="w-5 h-5" />
            {(isAdmin && lowStockCount > 0) && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-600" />
            )}
          </div>
          <span className="text-[10px] font-medium mt-0.5 leading-tight tracking-tight">
            More
          </span>
        </button>
      </div>
    </nav>
  );
};
