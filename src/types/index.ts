export type CategoryType = 'Card' | 'Box' | 'Pack' | 'Slab' | 'Other';
export type StatusType = 'Kept' | 'Sold' | 'Opened';
export type TransactionType = 'Expense' | 'Sales' | 'Capital' | 'Loan';
export type TabType = 'dashboard' | 'inventory' | 'transactions' | 'wishlist';

export interface InventoryItem {
  id: string;
  name: string;
  set?: string;
  localId?: string;
  rarity?: string;
  category: CategoryType;
  status: StatusType;
  buy: number;
  market: number;
  source?: string;
  imgUrl?: string;
  notes?: string;
  linkedTrxId?: string | null;
  pulledFromId?: string | null; // ID of the parent box if obtained via gacha
  tcgdexId?: string;
  createdAt?: number;
}

export interface Transaction {
  id: string;
  name: string;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  person?: string; // If Loan
  createdAt?: number;
}

export interface WishlistItem {
  id: string;
  name: string;
  target: number;
  set?: string;
  rarity?: string;
  imgUrl?: string;
  notes?: string;
  tcgdexId?: string;
  createdAt?: number;
}

export interface CashFlowDayData {
  date: string;
  label: string;
  income: number;
  expense: number;
}
