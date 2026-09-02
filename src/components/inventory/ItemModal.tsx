import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Dice5, 
  Info, 
  Loader2 
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useTracker } from '../../context/TrackerContext';
import { tcgdexService } from '../../services/tcgdexService';
import { CategoryType, StatusType } from '../../types';
import { TCGdexCardSummary } from '../../types/tcgdex';

export const ItemModal: React.FC = () => {
  const { 
    isItemModalOpen, 
    closeItemModal, 
    editingItem, 
    wishlistToBuy, 
    inventory, 
    saveInventoryItem 
  } = useTracker();

  // Form states
  const [name, setName] = useState('');
  const [set, setSet] = useState('');
  const [localId, setLocalId] = useState('');
  const [source, setSource] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [category, setCategory] = useState<CategoryType>('Card');
  const [rarity, setRarity] = useState('');
  const [status, setStatus] = useState<StatusType>('Kept');
  const [buy, setBuy] = useState<number>(0);
  const [market, setMarket] = useState<number>(0);
  const [pulledFromId, setPulledFromId] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // TCGdex autocomplete states
  const [tcgdexResults, setTcgdexResults] = useState<TCGdexCardSummary[]>([]);
  const [isSearchingTcgdex, setIsSearchingTcgdex] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Prefill form on open or edit
  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name || '');
      setSet(editingItem.set || '');
      setLocalId(editingItem.localId || '');
      setSource(editingItem.source || '');
      setImgUrl(editingItem.imgUrl || '');
      setCategory(editingItem.category || 'Card');
      setRarity(editingItem.rarity || '');
      setStatus(editingItem.status || 'Kept');
      setBuy(editingItem.buy || 0);
      setMarket(editingItem.market || 0);
      setPulledFromId(editingItem.pulledFromId || '');
    } else if (wishlistToBuy) {
      setName(wishlistToBuy.name || '');
      setSet(wishlistToBuy.set || '');
      setLocalId('');
      setSource('');
      setImgUrl(wishlistToBuy.imgUrl || '');
      setCategory('Card');
      setRarity(wishlistToBuy.rarity || '');
      setStatus('Kept');
      setBuy(wishlistToBuy.target || 0);
      setMarket(wishlistToBuy.target || 0);
      setPulledFromId('');
    } else {
      setName('');
      setSet('');
      setLocalId('');
      setSource('');
      setImgUrl('');
      setCategory('Card');
      setRarity('');
      setStatus('Kept');
      setBuy(0);
      setMarket(0);
      setPulledFromId('');
    }
    setTcgdexResults([]);
    setShowDropdown(false);
  }, [editingItem, wishlistToBuy, isItemModalOpen]);

  // Handle TCGdex search as user types card name
  const handleNameChange = (val: string) => {
    setName(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (val.trim().length >= 2) {
      setIsSearchingTcgdex(true);
      setShowDropdown(true);
      searchTimeoutRef.current = setTimeout(async () => {
        const results = await tcgdexService.searchCards(val);
        setTcgdexResults(results.slice(0, 8));
        setIsSearchingTcgdex(false);
      }, 350);
    } else {
      setTcgdexResults([]);
      setShowDropdown(false);
      setIsSearchingTcgdex(false);
    }
  };

  // Select a TCGdex card suggestion
  const handleSelectTcgdexCard = async (cardSummary: TCGdexCardSummary) => {
    setShowDropdown(false);
    setIsSearchingTcgdex(true);
    setName(cardSummary.name);

    try {
      const detail = await tcgdexService.getCardDetail(cardSummary.id);
      if (detail) {
        setName(detail.name);
        if (detail.set?.name) setSet(detail.set.name);
        if (detail.localId) setLocalId(detail.localId);
        if (detail.rarity) setRarity(tcgdexService.mapRarity(detail.rarity));
        if (detail.image) {
          setImgUrl(tcgdexService.getHighResImageUrl(detail.image, 'high'));
        }
      } else if (cardSummary.image) {
        setImgUrl(tcgdexService.getHighResImageUrl(cardSummary.image, 'high'));
      }
    } catch (err) {
      console.error('Failed to load card details:', err);
    } finally {
      setIsSearchingTcgdex(false);
    }
  };

  // Handle Gacha Select (Locks buy price to 0)
  const handleGachaChange = (val: string) => {
    setPulledFromId(val);
    if (val) {
      setBuy(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      await saveInventoryItem(
        {
          name: name.trim(),
          set: set.trim(),
          localId: localId.trim(),
          source: source.trim(),
          imgUrl: imgUrl.trim(),
          category,
          rarity: rarity.trim().toUpperCase(),
          status,
          buy: pulledFromId ? 0 : Number(buy) || 0,
          market: Number(market) || 0,
          pulledFromId: pulledFromId || null,
        },
        editingItem?.id,
        editingItem?.linkedTrxId,
        wishlistToBuy?.id
      );
    } catch (err: any) {
      alert(`Gagal menyimpan koleksi: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const openedBoxes = inventory.filter(i => i.status === 'Opened');

  return (
    <Modal
      isOpen={isItemModalOpen}
      onClose={closeItemModal}
      maxWidth="max-w-lg"
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-red-500" />
          <span>{editingItem ? 'Edit Koleksi' : wishlistToBuy ? 'Beli Target Wishlist' : 'Tambah Koleksi Pokémon'}</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
        {/* Card Name with TCGdex Auto-complete */}
        <div className="relative">
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span>Nama Kartu / Box <span className="text-red-500">*</span></span>
            <span className="text-[10px] text-purple-600 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Auto TCGdex ID
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="Contoh: Pikachu, Charizard ex, Kotak Koleksi..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-red-500 focus:bg-white transition-colors"
            />
            {isSearchingTcgdex && (
              <Loader2 className="w-4 h-4 text-purple-500 animate-spin absolute right-3 top-2.5" />
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && tcgdexResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto p-1 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Saran Database Pokémon Indonesia:
              </div>
              {tcgdexResults.map(res => (
                <div
                  key={res.id}
                  onClick={() => handleSelectTcgdexCard(res)}
                  className="flex items-center gap-2.5 p-2 hover:bg-red-50/80 rounded-lg cursor-pointer transition-colors"
                >
                  {res.image ? (
                    <img
                      src={`${res.image}/low.webp`}
                      alt={res.name}
                      className="w-7 h-10 object-contain rounded bg-slate-100"
                    />
                  ) : (
                    <div className="w-7 h-10 bg-slate-100 rounded flex items-center justify-center text-slate-400 text-xs">
                      🎴
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{res.name}</p>
                    <p className="text-[10px] text-slate-400">ID: {res.id}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Set & Source Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Set / Ekspansi Indonesia</label>
            <input
              type="text"
              value={set}
              onChange={e => setSet(e.target.value)}
              placeholder="Contoh: Letusan Tanah, Kilau Hitam..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-red-500 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Sumber / Marketplace</label>
            <input
              type="text"
              value={source}
              onChange={e => setSource(e.target.value)}
              placeholder="Contoh: Tokopedia, Shopee, LGS..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-red-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Gacha Dropdown (Select Opened Box) */}
        <div className="p-3 bg-purple-50/90 border border-purple-200/80 rounded-xl">
          <label className="block text-purple-900 text-xs font-bold mb-1 flex items-center gap-1.5">
            <Dice5 className="w-4 h-4 text-purple-600" />
            <span>Hasil Gacha Dari Box Mana? (Opsional)</span>
          </label>
          <select
            value={pulledFromId}
            onChange={e => handleGachaChange(e.target.value)}
            className="w-full bg-white border border-purple-200 rounded-lg px-3 py-1.5 text-xs text-purple-900 outline-none focus:border-purple-500"
          >
            <option value="">-- Bukan hasil gacha / Beli Satuan --</option>
            {openedBoxes.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.set || 'No Set'})
              </option>
            ))}
          </select>
          {pulledFromId && (
            <p className="text-[10px] text-purple-700 mt-1 font-medium">
              💡 Harga modal otomatis diatur ke Rp 0 karena biaya pembelian sudah dicatat saat pembelian Box.
            </p>
          )}
        </div>

        {/* Image URL with Preview */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">URL Foto Kartu (Image Address)</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={imgUrl}
              onChange={e => setImgUrl(e.target.value)}
              placeholder="https://assets.tcgdex.net/..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-red-500 focus:bg-white transition-colors"
            />
            {imgUrl && (
              <div className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img src={imgUrl} alt="Preview" className="w-full h-full object-contain" />
              </div>
            )}
          </div>
        </div>

        {/* Category, Rarity, Status */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as CategoryType)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs outline-none focus:border-red-500 focus:bg-white"
            >
              <option value="Card">Single Card</option>
              <option value="Box">Sealed Box</option>
              <option value="Pack">Booster Pack</option>
              <option value="Slab">Graded Slab</option>
              <option value="Other">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Rarity</label>
            <select
              value={rarity}
              onChange={e => setRarity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs outline-none focus:border-red-500 focus:bg-white"
            >
              <option value="">-- Kosong --</option>
              <option value="C">C (Common)</option>
              <option value="U">U (Uncommon)</option>
              <option value="R">R (Rare)</option>
              <option value="RR">RR (Double Rare)</option>
              <option value="AR">AR (Art Rare)</option>
              <option value="SR">SR (Super Rare)</option>
              <option value="SAR">SAR (Special Art Rare)</option>
              <option value="UR">UR (Ultra Rare)</option>
              <option value="PROMO">Promo</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as StatusType)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs outline-none focus:border-red-500 focus:bg-white"
            >
              <option value="Kept">Disimpan</option>
              <option value="Sold">Terjual</option>
              <option value="Opened">Dibuka (Box)</option>
            </select>
          </div>
        </div>

        {/* Pricing: Modal & Market */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-blue-900 mb-1">Modal / Beli (Rp)</label>
            <input
              type="number"
              min="0"
              required
              disabled={!!pulledFromId}
              value={buy}
              onChange={e => setBuy(parseInt(e.target.value, 10) || 0)}
              className={`w-full border rounded-xl px-3 py-2 text-sm font-bold outline-none ${
                pulledFromId
                  ? 'bg-slate-100 text-slate-400 border-slate-200'
                  : 'bg-blue-50/80 border-blue-200 text-blue-800 focus:bg-white focus:border-blue-500'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Harga Pasar (Rp)</label>
            <input
              type="number"
              min="0"
              required
              value={market}
              onChange={e => setMarket(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-red-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-100 text-[11px] text-blue-700 flex items-start gap-1.5">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            Menyimpan barang dengan Harga Modal &gt; Rp 0 akan otomatis mencatat mutasi <strong>Pengeluaran (Belanja)</strong> ke Buku Kas.
          </span>
        </div>

        {/* Modal Buttons */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={closeItemModal}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan Koleksi'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
