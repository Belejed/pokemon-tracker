import React, { useState, useEffect, useRef } from 'react';
import { Bookmark, Sparkles, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useTracker } from '../../context/TrackerContext';
import { tcgdexService } from '../../services/tcgdexService';
import { TCGdexCardSummary } from '../../types/tcgdex';

export const WishlistModal: React.FC = () => {
  const { isWishlistModalOpen, closeWishlistModal, saveWishlist } = useTracker();

  const [name, setName] = useState('');
  const [target, setTarget] = useState<number>(0);
  const [set, setSet] = useState('');
  const [rarity, setRarity] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const [tcgdexResults, setTcgdexResults] = useState<TCGdexCardSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isWishlistModalOpen) {
      setName('');
      setTarget(0);
      setSet('');
      setRarity('');
      setImgUrl('');
      setTcgdexResults([]);
      setShowDropdown(false);
    }
  }, [isWishlistModalOpen]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (val.trim().length >= 2) {
      setIsSearching(true);
      setShowDropdown(true);
      searchTimeoutRef.current = setTimeout(async () => {
        const results = await tcgdexService.searchCards(val);
        setTcgdexResults(results.slice(0, 6));
        setIsSearching(false);
      }, 350);
    } else {
      setTcgdexResults([]);
      setShowDropdown(false);
      setIsSearching(false);
    }
  };

  const handleSelectTcgdexCard = async (cardSummary: TCGdexCardSummary) => {
    setShowDropdown(false);
    setName(cardSummary.name);
    try {
      const detail = await tcgdexService.getCardDetail(cardSummary.id);
      if (detail) {
        setName(detail.name);
        if (detail.set?.name) setSet(detail.set.name);
        if (detail.rarity) setRarity(tcgdexService.mapRarity(detail.rarity));
        if (detail.image) setImgUrl(tcgdexService.getHighResImageUrl(detail.image, 'high'));
      } else if (cardSummary.image) {
        setImgUrl(tcgdexService.getHighResImageUrl(cardSummary.image, 'high'));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || target <= 0) {
      alert('Mohon isi nama kartu dan target harga > 0');
      return;
    }

    setSaving(true);
    try {
      await saveWishlist({
        name: name.trim(),
        target: Number(target) || 0,
        set: set.trim(),
        rarity: rarity.trim(),
        imgUrl: imgUrl.trim(),
      });
    } catch (err: any) {
      alert(`Gagal menyimpan wishlist: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isWishlistModalOpen}
      onClose={closeWishlistModal}
      maxWidth="max-w-md"
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <Bookmark className="w-4 h-4" />
          </div>
          <span>Tambah Target Incaran (Wishlist)</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
        {/* Card Name with TCGdex */}
        <div className="relative">
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span>Nama Kartu Target <span className="text-red-500">*</span></span>
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
              placeholder="Contoh: Pikachu AR, Charizard ex SAR..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 text-purple-500 animate-spin absolute right-3 top-2.5" />
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && tcgdexResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-52 overflow-y-auto p-1 divide-y divide-slate-100">
              {tcgdexResults.map(res => (
                <div
                  key={res.id}
                  onClick={() => handleSelectTcgdexCard(res)}
                  className="flex items-center gap-2.5 p-2 hover:bg-blue-50/80 rounded-lg cursor-pointer transition-colors"
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

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Target Harga Maksimal Beli (Rp) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            required
            min="1000"
            value={target || ''}
            onChange={e => setTarget(parseInt(e.target.value, 10) || 0)}
            placeholder="Rp 0"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-base font-black text-blue-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Set / Ekspansi (Opsional)</label>
          <input
            type="text"
            value={set}
            onChange={e => setSet(e.target.value)}
            placeholder="Contoh: Kilau Hitam, Hantaman Triplet..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={closeWishlistModal}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Tambah Incaran'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
