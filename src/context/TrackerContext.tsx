import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';
import { InventoryItem, Transaction, WishlistItem, TabType, CashFlowDayData } from '../types';
import { getTodayString } from '../utils/formatters';

interface TrackerContextType {
  // State
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  inventory: InventoryItem[];
  transactions: Transaction[];
  wishlist: WishlistItem[];
  loading: boolean;

  // Modals
  isItemModalOpen: boolean;
  editingItem: InventoryItem | null;
  wishlistToBuy: WishlistItem | null;
  openAddItemModal: () => void;
  openEditItemModal: (item: InventoryItem) => void;
  closeItemModal: () => void;

  isQuickSellModalOpen: boolean;
  quickSellItem: InventoryItem | null;
  openQuickSellModal: (item: InventoryItem) => void;
  closeQuickSellModal: () => void;

  isDetailModalOpen: boolean;
  selectedDetailItem: InventoryItem | null;
  openDetailModal: (item: InventoryItem) => void;
  closeDetailModal: () => void;

  isScannerModalOpen: boolean;
  openScannerModal: () => void;
  closeScannerModal: () => void;

  isTrxModalOpen: boolean;
  openTrxModal: () => void;
  closeTrxModal: () => void;

  isWishlistModalOpen: boolean;
  openWishlistModal: () => void;
  closeWishlistModal: () => void;

  // Actions
  saveInventoryItem: (itemData: Omit<InventoryItem, 'id'>, editId?: string, oldLinkedTrxId?: string | null, wishlistIdToDelete?: string) => Promise<void>;
  deleteInventoryItem: (id: string, linkedTrxId?: string | null) => Promise<void>;
  quickSell: (itemId: string, itemName: string, sellPrice: number) => Promise<void>;
  ripBox: (itemId: string, itemName: string) => Promise<void>;

  saveTransaction: (trxData: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  saveWishlist: (wishlistData: Omit<WishlistItem, 'id'>) => Promise<void>;
  deleteWishlist: (id: string) => Promise<void>;
  buyWishlist: (item: WishlistItem) => void;

  // Calculated Metrics
  cashBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalAssetValue: number;
  categoryDistribution: Record<string, number>;
  dailyCashFlow: CashFlowDayData[];
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export const TrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('catalog');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [wishlistToBuy, setWishlistToBuy] = useState<WishlistItem | null>(null);

  const [isQuickSellModalOpen, setIsQuickSellModalOpen] = useState(false);
  const [quickSellItem, setQuickSellItem] = useState<InventoryItem | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<InventoryItem | null>(null);

  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isTrxModalOpen, setIsTrxModalOpen] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);

  // Real-time Firestore Listeners
  useEffect(() => {
    let invLoaded = false;
    let trxLoaded = false;
    let wlLoaded = false;

    const checkLoading = () => {
      if (invLoaded && trxLoaded && wlLoaded) {
        setLoading(false);
      }
    };

    const unsubInv = onSnapshot(
      query(collection(db, 'inventory'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as InventoryItem));
        setInventory(items);
        invLoaded = true;
        checkLoading();
      },
      (err) => {
        console.error('Firestore inventory error:', err);
        invLoaded = true;
        checkLoading();
      }
    );

    const unsubTrx = onSnapshot(
      query(collection(db, 'transactions'), orderBy('date', 'desc')),
      (snapshot) => {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
        setTransactions(items);
        trxLoaded = true;
        checkLoading();
      },
      (err) => {
        console.error('Firestore transactions error:', err);
        trxLoaded = true;
        checkLoading();
      }
    );

    const unsubWl = onSnapshot(
      query(collection(db, 'wishlist'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as WishlistItem));
        setWishlist(items);
        wlLoaded = true;
        checkLoading();
      },
      (err) => {
        console.error('Firestore wishlist error:', err);
        wlLoaded = true;
        checkLoading();
      }
    );

    return () => {
      unsubInv();
      unsubTrx();
      unsubWl();
    };
  }, []);

  // Modal Open/Close handlers
  const openAddItemModal = () => {
    if (!isAdmin) return;
    setEditingItem(null);
    setWishlistToBuy(null);
    setIsItemModalOpen(true);
  };

  const openEditItemModal = (item: InventoryItem) => {
    if (!isAdmin) return;
    setEditingItem(item);
    setWishlistToBuy(null);
    setIsItemModalOpen(true);
  };

  const closeItemModal = () => {
    setIsItemModalOpen(false);
    setEditingItem(null);
    setWishlistToBuy(null);
  };

  const openQuickSellModal = (item: InventoryItem) => {
    if (!isAdmin) return;
    setQuickSellItem(item);
    setIsQuickSellModalOpen(true);
  };

  const closeQuickSellModal = () => {
    setIsQuickSellModalOpen(false);
    setQuickSellItem(null);
  };

  const openDetailModal = (item: InventoryItem) => {
    setSelectedDetailItem(item);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDetailItem(null);
  };

  const openScannerModal = () => {
    if (!isAdmin) return;
    setIsScannerModalOpen(true);
  };

  const closeScannerModal = () => {
    setIsScannerModalOpen(false);
  };

  const openTrxModal = () => {
    if (!isAdmin) return;
    setIsTrxModalOpen(true);
  };

  const closeTrxModal = () => {
    setIsTrxModalOpen(false);
  };

  const openWishlistModal = () => {
    if (!isAdmin) return;
    setIsWishlistModalOpen(true);
  };

  const closeWishlistModal = () => {
    setIsWishlistModalOpen(false);
  };

  // Inventory Save Action
  const saveInventoryItem = async (
    itemData: Omit<InventoryItem, 'id'>,
    editId?: string,
    oldLinkedTrxId?: string | null,
    wishlistIdToDelete?: string
  ) => {
    if (!isAdmin) throw new Error('Akses ditolak: Anda harus login sebagai Admin.');

    let buyPrice = itemData.buy || 0;
    const isGacha = !!itemData.pulledFromId;
    if (isGacha) buyPrice = 0;

    let linkedTrxId: string | null = null;

    if (editId) {
      linkedTrxId = (oldLinkedTrxId && oldLinkedTrxId !== 'undefined' && oldLinkedTrxId !== 'null') ? oldLinkedTrxId : null;
      
      if (isGacha) {
        if (linkedTrxId) {
          await deleteDoc(doc(db, 'transactions', linkedTrxId));
          linkedTrxId = null;
        }
      } else {
        if (linkedTrxId) {
          if (buyPrice > 0) {
            await updateDoc(doc(db, 'transactions', linkedTrxId), {
              amount: buyPrice,
              name: `Beli Stok: ${itemData.name}`
            });
          } else {
            await deleteDoc(doc(db, 'transactions', linkedTrxId));
            linkedTrxId = null;
          }
        } else if (buyPrice > 0) {
          const trxRef = await addDoc(collection(db, 'transactions'), {
            name: `Beli Stok: ${itemData.name}`,
            type: 'Expense',
            amount: buyPrice,
            date: getTodayString(),
            person: '',
            createdAt: Date.now()
          });
          linkedTrxId = trxRef.id;
        }
      }

      await updateDoc(doc(db, 'inventory', editId), {
        ...itemData,
        buy: buyPrice,
        linkedTrxId: linkedTrxId
      });
    } else {
      if (buyPrice > 0 && !isGacha) {
        const trxRef = await addDoc(collection(db, 'transactions'), {
          name: `Beli Stok: ${itemData.name}`,
          type: 'Expense',
          amount: buyPrice,
          date: getTodayString(),
          person: '',
          createdAt: Date.now()
        });
        linkedTrxId = trxRef.id;
      }

      await addDoc(collection(db, 'inventory'), {
        ...itemData,
        buy: buyPrice,
        linkedTrxId: linkedTrxId,
        createdAt: Date.now()
      });
    }

    if (wishlistIdToDelete) {
      await deleteDoc(doc(db, 'wishlist', wishlistIdToDelete));
    }

    closeItemModal();
  };

  const deleteInventoryItem = async (id: string, linkedTrxId?: string | null) => {
    if (!isAdmin) return;
    if (window.confirm('Yakin hapus koleksi ini? (Transaksi pembeliannya di Buku Kas juga akan ikut Dihapus agar Saldo Kas kembali akurat)')) {
      await deleteDoc(doc(db, 'inventory', id));
      if (linkedTrxId && linkedTrxId !== 'undefined' && linkedTrxId !== 'null') {
        await deleteDoc(doc(db, 'transactions', linkedTrxId));
      }
    }
  };

  const quickSell = async (itemId: string, itemName: string, sellPrice: number) => {
    if (!isAdmin) return;
    await updateDoc(doc(db, 'inventory', itemId), { status: 'Sold' });
    await addDoc(collection(db, 'transactions'), {
      name: `Jual ${itemName}`,
      type: 'Sales',
      amount: sellPrice,
      date: getTodayString(),
      person: '',
      createdAt: Date.now()
    });
    closeQuickSellModal();
  };

  const ripBox = async (itemId: string, itemName: string) => {
    if (!isAdmin) return;
    if (window.confirm(`Yakin ingin membuka Box "${itemName}"?\nBox ini akan berubah statusnya jadi "Opened (Dibuka)". Kartu isinya bisa kamu tambahkan nanti dengan memilih "Hasil Gacha Dari Box Ini" (Modal = Rp 0).`)) {
      await updateDoc(doc(db, 'inventory', itemId), { status: 'Opened' });
    }
  };

  // Transaction Actions
  const saveTransaction = async (trxData: Omit<Transaction, 'id'>) => {
    if (!isAdmin) return;
    await addDoc(collection(db, 'transactions'), {
      ...trxData,
      createdAt: Date.now()
    });
    setIsTrxModalOpen(false);
  };

  const deleteTransaction = async (id: string) => {
    if (!isAdmin) return;
    if (window.confirm('Yakin ingin menghapus transaksi ini?')) {
      await deleteDoc(doc(db, 'transactions', id));
    }
  };

  // Wishlist Actions
  const saveWishlist = async (wishlistData: Omit<WishlistItem, 'id'>) => {
    if (!isAdmin) return;
    await addDoc(collection(db, 'wishlist'), {
      ...wishlistData,
      createdAt: Date.now()
    });
    setIsWishlistModalOpen(false);
  };

  const deleteWishlist = async (id: string) => {
    if (!isAdmin) return;
    await deleteDoc(doc(db, 'wishlist', id));
  };

  const buyWishlist = (item: WishlistItem) => {
    if (!isAdmin) return;
    setWishlistToBuy(item);
    setEditingItem(null);
    setIsItemModalOpen(true);
  };

  // Calculations & Aggregates
  const { cashBalance, totalIncome, totalExpense, totalAssetValue, categoryDistribution, dailyCashFlow } = useMemo(() => {
    let income = 0;
    let expense = 0;
    let capital = 0;
    let loan = 0;

    const dailyMap: Record<string, { income: number; expense: number }> = {};

    transactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'Sales') income += amt;
      if (t.type === 'Expense') expense += amt;
      if (t.type === 'Capital') capital += amt;
      if (t.type === 'Loan') loan += amt;

      const dKey = t.date || getTodayString();
      if (!dailyMap[dKey]) {
        dailyMap[dKey] = { income: 0, expense: 0 };
      }
      if (t.type === 'Sales') dailyMap[dKey].income += amt;
      if (t.type === 'Expense') dailyMap[dKey].expense += amt;
    });

    const cash = capital + income - expense + loan;

    let assetVal = 0;
    const catMap: Record<string, number> = {
      Card: 0,
      Box: 0,
      Pack: 0,
      Slab: 0,
      Other: 0
    };

    inventory.forEach(i => {
      if (i.status === 'Kept') {
        assetVal += Number(i.market) || 0;
      }
      const cat = i.category || 'Card';
      catMap[cat] = (catMap[cat] || 0) + 1;
    });

    const sortedDates = Object.keys(dailyMap).sort();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    
    const cashFlowArray: CashFlowDayData[] = sortedDates.map(d => {
      const [, mm, dd] = d.split('-');
      const label = (dd && mm) ? `${parseInt(dd, 10)} ${months[parseInt(mm, 10) - 1]}` : d;
      return {
        date: d,
        label,
        income: dailyMap[d].income,
        expense: dailyMap[d].expense
      };
    });

    return {
      cashBalance: cash,
      totalIncome: income,
      totalExpense: expense,
      totalAssetValue: assetVal,
      categoryDistribution: catMap,
      dailyCashFlow: cashFlowArray
    };
  }, [inventory, transactions]);

  return (
    <TrackerContext.Provider
      value={{
        activeTab,
        setActiveTab,
        inventory,
        transactions,
        wishlist,
        loading,

        isItemModalOpen,
        editingItem,
        wishlistToBuy,
        openAddItemModal,
        openEditItemModal,
        closeItemModal,

        isQuickSellModalOpen,
        quickSellItem,
        openQuickSellModal,
        closeQuickSellModal,

        isDetailModalOpen,
        selectedDetailItem,
        openDetailModal,
        closeDetailModal,

        isScannerModalOpen,
        openScannerModal,
        closeScannerModal,

        isTrxModalOpen,
        openTrxModal,
        closeTrxModal,

        isWishlistModalOpen,
        openWishlistModal,
        closeWishlistModal,

        saveInventoryItem,
        deleteInventoryItem,
        quickSell,
        ripBox,

        saveTransaction,
        deleteTransaction,

        saveWishlist,
        deleteWishlist,
        buyWishlist,

        cashBalance,
        totalIncome,
        totalExpense,
        totalAssetValue,
        categoryDistribution,
        dailyCashFlow
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
};

export const useTracker = () => {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error('useTracker must be used within a TrackerProvider');
  }
  return context;
};
