import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  User, Product, CartItem, Transaction, StockMovement, 
  StoreSettings, PaymentMethod, TransactionItem 
} from '../types';
import { 
  INITIAL_USERS, INITIAL_PRODUCTS, INITIAL_TRANSACTIONS, 
  INITIAL_STOCK_MOVEMENTS, INITIAL_STORE_SETTINGS 
} from '../data/mockData';
import { generateId, generateInvoiceNumber } from '../utils/formatters';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  products: Product[];
  transactions: Transaction[];
  stockMovements: StockMovement[];
  storeSettings: StoreSettings;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Auth
  login: (username: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  
  // Cart & POS
  cart: CartItem[];
  addToCart: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateNotes: (productId: string, notes: string) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTotal: number;
  completeTransaction: (
    paymentMethod: PaymentMethod, 
    cashGiven?: number, 
    customerNotes?: string
  ) => Transaction;
  
  // Product Management (Admin)
  addProduct: (productData: Omit<Product, 'id' | 'sku'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  toggleProductStatus: (id: string) => void;
  deleteProduct: (id: string) => void;
  
  // Stock Management (Admin)
  addStock: (productId: string, quantity: number, notes: string) => void;
  
  // User Management (Admin)
  createCashier: (data: { name: string; username: string; phone?: string }) => { success: boolean; message?: string };
  updateCashier: (id: string, updates: Partial<User>) => void;
  toggleCashierStatus: (id: string) => void;
  
  // Settings
  updateSettings: (settings: Partial<StoreSettings>) => void;
  
  // Notifications
  toasts: ToastNotification[];
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER: 'krk_current_user_en',
  USERS: 'krk_users_en',
  PRODUCTS: 'krk_products_en',
  TRANSACTIONS: 'krk_transactions_en',
  STOCK_MOVEMENTS: 'krk_stock_movements_en',
  SETTINGS: 'krk_settings_en',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state or fallback to defaults
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_USERS[0]; // Admin by default
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STOCK_MOVEMENTS);
    return saved ? JSON.parse(saved) : INITIAL_STOCK_MOVEMENTS;
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_STORE_SETTINGS;
  });

  const [activeTab, setActiveTab] = useState<string>('pos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, JSON.stringify(stockMovements));
  }, [stockMovements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(storeSettings));
  }, [storeSettings]);

  // Toast Helper
  const showToast = (type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string) => {
    const id = generateId('toast');
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Auth
  const login = (username: string, password: string) => {
    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    // Check admin
    if (trimmedUser === 'admin' && trimmedPass === 'admin123') {
      const adminUser = users.find(u => u.username === 'admin') || INITIAL_USERS[0];
      setCurrentUser(adminUser);
      setActiveTab('dashboard');
      showToast('success', `Welcome back, ${adminUser.name}!`, 'Login Successful');
      return { success: true };
    }

    // Check cashier
    if (trimmedUser === 'cashier' && trimmedPass === 'cashier123') {
      const cashierUser = users.find(u => u.username === 'cashier') || INITIAL_USERS[1];
      if (cashierUser.status === 'INACTIVE') {
        showToast('error', 'This cashier account is currently inactive.', 'Access Denied');
        return { success: false, message: 'Account is inactive' };
      }
      setCurrentUser(cashierUser);
      setActiveTab('pos');
      showToast('success', `Welcome to your shift, ${cashierUser.name}!`, 'Cashier Login');
      return { success: true };
    }

    // Check custom cashiers
    const matchedUser = users.find(u => u.username.toLowerCase() === trimmedUser);
    if (matchedUser) {
      if (matchedUser.status === 'INACTIVE') {
        showToast('error', 'This account has been deactivated by Admin.', 'Access Denied');
        return { success: false, message: 'Account deactivated' };
      }
      if (trimmedPass === `${trimmedUser}123` || trimmedPass === 'cashier123') {
        setCurrentUser(matchedUser);
        setActiveTab(matchedUser.role === 'ADMIN' ? 'dashboard' : 'pos');
        showToast('success', `Welcome, ${matchedUser.name}!`, 'Login Successful');
        return { success: true };
      }
    }

    showToast('error', 'Invalid username or password.', 'Sign In Failed');
    return { success: false, message: 'Invalid credentials' };
  };

  const logout = () => {
    setCurrentUser(null);
    setCart([]);
    showToast('info', 'You have been logged out from POS session.', 'Logged Out');
  };

  // Cart operations
  const addToCart = (product: Product) => {
    if (!product.isActive) {
      showToast('warning', 'This item is currently unavailable.', 'Unavailable');
      return;
    }
    if (product.stock <= 0) {
      showToast('error', `Stock for ${product.name} is sold out.`, 'Out of Stock');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          showToast('warning', `Order quantity cannot exceed available stock (${product.stock}).`, 'Stock Limit');
          return prev;
        }
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product && quantity > product.stock) {
      showToast('warning', `Only ${product.stock} units of ${product.name} remaining in stock.`, 'Insufficient Stock');
      return;
    }

    setCart(prev => 
      prev.map(item => 
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const updateNotes = (productId: string, notes: string) => {
    setCart(prev => 
      prev.map(item => 
        item.product.id === productId ? { ...item, notes } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    const tax = (cartSubtotal * storeSettings.taxPercentage) / 100;
    return cartSubtotal + tax;
  }, [cartSubtotal, storeSettings.taxPercentage]);

  // Complete Transaction (POS checkout)
  const completeTransaction = (
    paymentMethod: PaymentMethod, 
    cashGiven?: number, 
    customerNotes?: string
  ): Transaction => {
    if (cart.length === 0) {
      throw new Error('Cart is empty');
    }

    const newInvoice = generateInvoiceNumber();
    const newTrxId = generateId('trx');
    const nowIso = new Date().toISOString();

    const items: TransactionItem[] = cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      category: item.product.category,
      price: item.product.price,
      costPrice: item.product.costPrice,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
      notes: item.notes,
    }));

    const taxAmount = (cartSubtotal * storeSettings.taxPercentage) / 100;
    const finalTotal = cartSubtotal + taxAmount;
    const calculatedChange = paymentMethod === 'CASH' && cashGiven && cashGiven >= finalTotal 
      ? cashGiven - finalTotal 
      : 0;

    const newTransaction: Transaction = {
      id: newTrxId,
      invoiceNumber: newInvoice,
      date: nowIso,
      cashierId: currentUser?.id || 'usr_cashier_1',
      cashierName: currentUser?.name || 'Cashier',
      items,
      subtotal: cartSubtotal,
      tax: taxAmount,
      discount: 0,
      total: finalTotal,
      paymentMethod,
      cashGiven: paymentMethod === 'CASH' ? cashGiven : undefined,
      change: paymentMethod === 'CASH' ? calculatedChange : undefined,
      status: 'COMPLETED',
      notes: customerNotes,
    };

    // 1. Update product stocks
    const newMovements: StockMovement[] = [];
    setProducts(prevProducts => {
      return prevProducts.map(prod => {
        const orderedItem = cart.find(c => c.product.id === prod.id);
        if (orderedItem) {
          const prevQty = prod.stock;
          const newQty = Math.max(0, prevQty - orderedItem.quantity);
          
          newMovements.push({
            id: generateId('sm'),
            productId: prod.id,
            productName: prod.name,
            type: 'SALE',
            quantityChange: -orderedItem.quantity,
            previousStock: prevQty,
            newStock: newQty,
            date: nowIso,
            userName: currentUser?.name || 'Cashier',
            userId: currentUser?.id || 'usr_cashier_1',
            notes: `Sale ${newInvoice}`,
          });

          return { ...prod, stock: newQty };
        }
        return prod;
      });
    });

    // 2. Append stock movements
    if (newMovements.length > 0) {
      setStockMovements(prev => [...newMovements, ...prev]);
    }

    // 3. Append transaction
    setTransactions(prev => [newTransaction, ...prev]);

    // 4. Clear cart
    clearCart();

    showToast('success', `Transaction ${newInvoice} completed successfully!`, 'Payment Successful');

    return newTransaction;
  };

  // Product Management
  const addProduct = (productData: Omit<Product, 'id' | 'sku'>) => {
    const newId = generateId('prod');
    const categoryCode = productData.category.substring(0, 3).toUpperCase();
    const randomSkuNum = Math.floor(100 + Math.random() * 900);
    const sku = `KRK-${categoryCode}-${randomSkuNum}`;

    const newProduct: Product = {
      id: newId,
      sku,
      ...productData,
    };

    setProducts(prev => [newProduct, ...prev]);

    // Record initial stock movement if stock > 0
    if (productData.stock > 0) {
      setStockMovements(prev => [
        {
          id: generateId('sm'),
          productId: newId,
          productName: productData.name,
          type: 'RESTOCK',
          quantityChange: productData.stock,
          previousStock: 0,
          newStock: productData.stock,
          date: new Date().toISOString(),
          userName: currentUser?.name || 'Admin',
          userId: currentUser?.id || 'usr_admin',
          notes: 'Initial stock on product creation',
        },
        ...prev
      ]);
    }

    showToast('success', `Product "${productData.name}" added successfully.`, 'Product Created');
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => 
      prev.map(p => p.id === id ? { ...p, ...updates } : p)
    );
    showToast('success', 'Product changes saved successfully.', 'Product Updated');
  };

  const toggleProductStatus = (id: string) => {
    setProducts(prev => 
      prev.map(p => {
        if (p.id === id) {
          const nextState = !p.isActive;
          showToast('info', `Product status set to ${nextState ? 'Active' : 'Inactive'}.`);
          return { ...p, isActive: nextState };
        }
        return p;
      })
    );
  };

  const deleteProduct = (id: string) => {
    const target = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('info', `Product "${target?.name || ''}" was removed from the catalog.`);
  };

  // Stock Management
  const addStock = (productId: string, quantity: number, notes: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const prevStock = product.stock;
    const newStock = prevStock + quantity;
    const nowIso = new Date().toISOString();

    setProducts(prev => 
      prev.map(p => p.id === productId ? { ...p, stock: newStock } : p)
    );

    const movement: StockMovement = {
      id: generateId('sm'),
      productId: product.id,
      productName: product.name,
      type: 'RESTOCK',
      quantityChange: quantity,
      previousStock: prevStock,
      newStock,
      date: nowIso,
      userName: currentUser?.name || 'Admin',
      userId: currentUser?.id || 'usr_admin',
      notes: notes || 'Manual restock entry',
    };

    setStockMovements(prev => [movement, ...prev]);
    showToast('success', `Restocked ${product.name} (+${quantity} units, Total: ${newStock}).`, 'Restock Completed');
  };

  // User Management
  const createCashier = (data: { name: string; username: string; phone?: string }) => {
    const existing = users.find(u => u.username.toLowerCase() === data.username.toLowerCase());
    if (existing) {
      showToast('error', 'Username is already taken.', 'Failed');
      return { success: false, message: 'Username is already taken' };
    }

    const newUser: User = {
      id: generateId('usr'),
      name: data.name,
      username: data.username.toLowerCase(),
      role: 'CASHIER',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      phone: data.phone,
    };

    setUsers(prev => [...prev, newUser]);
    showToast('success', `Cashier account "${data.name}" created. Default password: ${data.username}123`, 'Cashier Created');
    return { success: true };
  };

  const updateCashier = (id: string, updates: Partial<User>) => {
    setUsers(prev => 
      prev.map(u => u.id === id ? { ...u, ...updates } : u)
    );
    showToast('success', 'Cashier account details updated.', 'Saved');
  };

  const toggleCashierStatus = (id: string) => {
    setUsers(prev => 
      prev.map(u => {
        if (u.id === id) {
          const nextStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
          showToast('info', `Status for cashier ${u.name} is now ${nextStatus}.`);
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const updateSettings = (updates: Partial<StoreSettings>) => {
    setStoreSettings(prev => ({ ...prev, ...updates }));
    showToast('success', 'Store settings updated successfully.', 'Saved');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        products,
        transactions,
        stockMovements,
        storeSettings,
        activeTab,
        setActiveTab,
        login,
        logout,
        cart,
        addToCart,
        updateQuantity,
        updateNotes,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartTotal,
        completeTransaction,
        addProduct,
        updateProduct,
        toggleProductStatus,
        deleteProduct,
        addStock,
        createCashier,
        updateCashier,
        toggleCashierStatus,
        updateSettings,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
