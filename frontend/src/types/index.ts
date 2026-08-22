export type UserRole = 'ADMIN' | 'CASHIER';

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  avatar?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  lastActive: string;
  phone?: string;
}

export type ProductCategory = 
  | 'Main Dishes'
  | 'Noodles & Meatballs'
  | 'Snacks & Appetizers'
  | 'Cold Drinks'
  | 'Indonesian Coffee'
  | 'Hot Drinks';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  costPrice: number;
  stock: number;
  lowStockThreshold: number;
  image: string;
  isActive: boolean;
  sku: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export type PaymentMethod = 'CASH' | 'QRIS' | 'DEBIT' | 'TRANSFER';

export type TransactionStatus = 'COMPLETED' | 'CANCELLED';

export interface TransactionItem {
  productId: string;
  productName: string;
  category: ProductCategory;
  price: number;
  costPrice: number;
  quantity: number;
  subtotal: number;
  notes?: string;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  date: string; // ISO string
  cashierId: string;
  cashierName: string;
  items: TransactionItem[];
  subtotal: number;
  tax: number; // e.g. 0% or configured
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashGiven?: number;
  change?: number;
  status: TransactionStatus;
  notes?: string;
}

export type StockMovementType = 'RESTOCK' | 'SALE' | 'ADJUSTMENT' | 'DAMAGE';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantityChange: number; // positive or negative
  previousStock: number;
  newStock: number;
  date: string;
  userName: string;
  userId: string;
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  receiptFooterMessage: string;
  taxPercentage: number;
  currencySymbol: string;
  autoPrintReceipt: boolean;
}

export type DateFilterRange = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'CUSTOM';
