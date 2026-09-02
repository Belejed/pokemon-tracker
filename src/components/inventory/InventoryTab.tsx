import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Camera, 
  Filter, 
  Layers
} from 'lucide-react';
import { useTracker } from '../../context/TrackerContext';
import { useAuth } from '../../context/AuthContext';
import { InventoryCard } from './InventoryCard';
import { CategoryType, StatusType } from '../../types';

export const InventoryTab: React.FC = () => {
  const { inventory, openAddItemModal, openScannerModal } = useTracker();
  const { isAdmin } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusType | 'ALL'>('ALL');

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      // Search term filter
      const term = searchTerm.toLowerCase();
      const matchSearch = 
        (item.name && item.name.toLowerCase().includes(term)) ||
        (item.set && item.set.toLowerCase().includes(term)) ||
        (item.rarity && item.rarity.toLowerCase().includes(term)) ||
        (item.source && item.source.toLowerCase().includes(term));

      // Category filter
      const matchCategory = categoryFilter === 'ALL' || item.category === categoryFilter;

      // Status filter
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [inventory, searchTerm, categoryFilter, statusFilter]);

  const categories: { id: CategoryType | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'Semua Kategori' },
    { id: 'Card', label: 'Single Cards' },
    { id: 'Box', label: 'Sealed Boxes' },
    { id: 'Pack', label: 'Packs' },
    { id: 'Slab', label: 'Graded Slabs' },
  ];

  const statuses: { id: StatusType | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'Semua Status' },
    { id: 'Kept', label: 'Disimpan' },
    { id: 'Sold', label: 'Terjual' },
    { id: 'Opened', label: 'Dibuka (Box)' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
            Katalog & Inventaris Koleksi
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Database lengkap portofolio kartu, sealed box, dan slab Pokémon Indonesia.
          </p>
        </div>

        {/* Action Buttons for Admin */}
        {isAdmin && (
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <button
              onClick={openScannerModal}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 rounded-full text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Kamera</span>
            </button>

            <button
              onClick={openAddItemModal}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Item</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari nama kartu, set, rarity, atau marketplace..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm outline-none focus:border-red-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Quick Clear Button if active filters */}
          {(searchTerm || categoryFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition border border-red-200 self-start sm:self-auto"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Category & Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Kategori:
          </span>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                categoryFilter === cat.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}

          <span className="text-[11px] font-bold text-slate-400 ml-2 mr-1">Status:</span>
          {statuses.map(st => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                statusFilter === st.id
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Grid */}
      {filteredInventory.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {filteredInventory.map(item => (
            <InventoryCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
            <Layers className="w-8 h-8 stroke-1" />
          </div>
          <h3 className="text-base font-bold text-slate-700">Tidak ada item ditemukan</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            {searchTerm
              ? `Tidak ada koleksi yang cocok dengan pencarian "${searchTerm}".`
              : 'Katalog masih kosong. Tambahkan kartu Pokémon baru atau gunakan Scan Kamera!'}
          </p>
          {isAdmin && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={openScannerModal}
                className="bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" /> Scan Kamera
              </button>
              <button
                onClick={openAddItemModal}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Tambah Manual
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
