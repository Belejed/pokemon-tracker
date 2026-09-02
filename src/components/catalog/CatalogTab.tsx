import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Sparkles, 
  Layers, 
  Camera, 
  Loader2, 
  ShoppingBag,
  Image as ImageIcon
} from 'lucide-react';
import { tcgdexService } from '../../services/tcgdexService';
import { TCGdexCardSummary, TCGdexSetSummary } from '../../types/tcgdex';
import { TCGdexCardModal } from './TCGdexCardModal';
import { useTracker } from '../../context/TrackerContext';

export const CatalogTab: React.FC = () => {
  const { openScannerModal } = useTracker();

  const [cards, setCards] = useState<TCGdexCardSummary[]>([]);
  const [sets, setSets] = useState<TCGdexSetSummary[]>([]);
  const [selectedSet, setSelectedSet] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const [selectedCard, setSelectedCard] = useState<TCGdexCardSummary | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load Indonesian Sets & Initial Cards on mount
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const [loadedSets, loadedCards] = await Promise.all([
          tcgdexService.getSets(),
          tcgdexService.getAllCards()
        ]);
        setSets(loadedSets);
        setCards(loadedCards);
      } catch (err) {
        console.error('Failed to load initial catalog:', err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // Handle Set Filter Change
  const handleSetChange = async (setId: string) => {
    setSelectedSet(setId);
    setSearchTerm('');
    setLoading(true);
    try {
      if (setId === 'ALL') {
        const all = await tcgdexService.getAllCards();
        setCards(all);
      } else {
        const setCardResults = await tcgdexService.getCardsBySet(setId);
        setCards(setCardResults);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle live search
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (val.trim().length >= 2) {
      setSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await tcgdexService.searchCards(val.trim());
          setCards(results);
          setSelectedSet('ALL');
        } catch (e) {
          console.error(e);
        } finally {
          setSearching(false);
        }
      }, 350);
    } else if (val.trim().length === 0) {
      handleSetChange(selectedSet);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner / Hero Header */}
      <div className="bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Database Resmi Pokémon TCG Indonesia</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
            Katalog & Direktori Kartu Pokémon Indonesia
          </h1>
          <p className="text-xs sm:text-sm text-red-50 mt-2 leading-relaxed">
            Jelajahi seluruh set kartu Pokémon berbahasa Indonesia, cek informasi serangan, rarity, dan bandingkan harga pasaran langsung di Tokopedia & Shopee!
          </p>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              onClick={openScannerModal}
              className="bg-white hover:bg-slate-100 text-red-600 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-2"
            >
              <Camera className="w-4 h-4 text-purple-600" />
              <span>Scan Kamera (OCR)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Set Filter Controls */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          {/* Live Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Cari nama Pokémon (contoh: Pikachu, Charizard, Mewtwo...)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm outline-none focus:border-red-500 focus:bg-white transition-colors"
            />
            {searching && (
              <Loader2 className="w-4 h-4 text-red-500 animate-spin absolute right-3.5 top-3" />
            )}
          </div>

          {/* Quick Clear */}
          {(searchTerm || selectedSet !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                handleSetChange('ALL');
              }}
              className="px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition self-start sm:self-auto"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Set Filter Pills */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" /> Pilih Set / Ekspansi Indonesia:
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            <button
              onClick={() => handleSetChange('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedSet === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Set
            </button>
            {sets.map(s => (
              <button
                key={s.id}
                onClick={() => handleSetChange(s.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedSet === s.id
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s.name} <span className="opacity-70 text-[10px]">({s.id})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-600">Memuat katalog kartu Pokémon Indonesia...</p>
        </div>
      ) : cards.length > 0 ? (
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1 text-xs text-slate-500 font-semibold">
            <span>Menampilkan {cards.length} kartu Pokémon</span>
            <span className="text-[11px] text-slate-400">Klik kartu untuk detail & cek harga</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {cards.map(card => {
              const imgUrl = card.image ? `${card.image}/low.webp` : null;
              return (
                <div
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:border-red-400 hover:shadow-md transition-all cursor-pointer group flex flex-col"
                >
                  <div className="h-44 sm:h-52 bg-slate-50 flex items-center justify-center p-2.5 relative overflow-hidden border-b border-slate-100">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={card.name}
                        loading="lazy"
                        className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-slate-300 stroke-1" />
                    )}
                    <span className="absolute top-2 right-2 bg-slate-900/70 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {card.localId || card.id}
                    </span>
                  </div>

                  <div className="p-3 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800 text-xs sm:text-sm truncate group-hover:text-red-600 transition-colors" title={card.name}>
                        {card.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">{card.id}</p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <ShoppingBag className="w-2.5 h-2.5 text-emerald-600" /> Cek Harga
                      </span>
                      <span className="text-[10px] font-bold text-red-500 group-hover:translate-x-0.5 transition-transform">
                        Detail &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
            <Layers className="w-7 h-7 stroke-1" />
          </div>
          <h3 className="text-base font-bold text-slate-700">Kartu tidak ditemukan</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Tidak ada kartu yang cocok dengan pencarian "{searchTerm}". Coba gunakan nama Pokémon lain atau ganti filter set.
          </p>
        </div>
      )}

      {/* Card Detail & Price Lookup Modal */}
      <TCGdexCardModal
        cardSummary={selectedCard}
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
      />
    </div>
  );
};
