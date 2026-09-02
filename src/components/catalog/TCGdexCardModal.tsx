import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ExternalLink, 
  ShoppingBag, 
  Plus, 
  Bookmark, 
  Loader2, 
  Swords, 
  Image as ImageIcon
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { TCGdexCardSummary, TCGdexCardDetail } from '../../types/tcgdex';
import { tcgdexService } from '../../services/tcgdexService';
import { getTokopediaSearchUrl, getShopeeSearchUrl } from '../../utils/ecommerce';
import { useTracker } from '../../context/TrackerContext';
import { useAuth } from '../../context/AuthContext';

interface TCGdexCardModalProps {
  cardSummary: TCGdexCardSummary | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TCGdexCardModal: React.FC<TCGdexCardModalProps> = ({
  cardSummary,
  isOpen,
  onClose,
}) => {
  const { saveInventoryItem, saveWishlist } = useTracker();
  const { isAdmin } = useAuth();

  const [detail, setDetail] = useState<TCGdexCardDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [addingToInv, setAddingToInv] = useState(false);
  const [addingToWl, setAddingToWl] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (cardSummary && isOpen) {
      setLoading(true);
      setDetail(null);
      setImgError(false);
      tcgdexService
        .getCardDetail(cardSummary.id)
        .then(d => {
          setDetail(d);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [cardSummary, isOpen]);

  if (!cardSummary) return null;

  const cardName = detail?.name || cardSummary.name;
  const setName = detail?.set?.name || '';
  const localId = detail?.localId || cardSummary.localId || '';
  const rarity = detail?.rarity ? tcgdexService.mapRarity(detail.rarity) : '';
  const imageUrl = detail?.image 
    ? tcgdexService.getHighResImageUrl(detail.image, 'high')
    : cardSummary.image
    ? tcgdexService.getHighResImageUrl(cardSummary.image, 'high')
    : '';

  const tokopediaUrl = getTokopediaSearchUrl(cardName, setName, localId);
  const shopeeUrl = getShopeeSearchUrl(cardName, setName, localId);

  const handleAddToInventory = async () => {
    if (!isAdmin) return;
    setAddingToInv(true);
    try {
      await saveInventoryItem({
        name: cardName,
        set: setName,
        localId: localId,
        rarity: rarity,
        category: 'Card',
        status: 'Kept',
        buy: 0,
        market: 0,
        source: 'Katalog TCGdex',
        imgUrl: imageUrl,
        tcgdexId: cardSummary.id
      });
      alert(`✅ "${cardName}" berhasil ditambahkan ke Inventaris kamu!`);
      onClose();
    } catch (err: any) {
      alert(`Gagal menambahkan ke inventaris: ${err.message}`);
    } finally {
      setAddingToInv(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAdmin) return;
    setAddingToWl(true);
    try {
      await saveWishlist({
        name: cardName,
        target: 50000,
        set: setName,
        rarity: rarity,
        imgUrl: imageUrl,
        tcgdexId: cardSummary.id
      });
      alert(`⭐ "${cardName}" berhasil dimasukkan ke daftar Wishlist!`);
      onClose();
    } catch (err: any) {
      alert(`Gagal menambahkan ke wishlist: ${err.message}`);
    } finally {
      setAddingToWl(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-red-500" />
          <span className="truncate max-w-[280px] sm:max-w-md">{cardName}</span>
        </div>
      }
    >
      <div className="space-y-4 pt-1">
        {/* Card Artwork Showcase */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-center min-h-[240px] max-h-[320px] overflow-hidden relative">
          {imageUrl && !imgError ? (
            <img
              src={imageUrl}
              alt={cardName}
              onError={() => setImgError(true)}
              className="max-h-[280px] w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-300 py-10">
              <ImageIcon className="w-16 h-16 stroke-1" />
              <p className="text-xs text-slate-400 mt-2">Tidak ada foto pratinjau</p>
            </div>
          )}

          {rarity && (
            <div className="absolute top-3 left-3">
              <Badge variant="rarity" size="sm">
                <Sparkles className="w-3 h-3" />
                {rarity}
              </Badge>
            </div>
          )}

          {detail?.hp && (
            <div className="absolute top-3 right-3 bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <span>HP</span>
              <span>{detail.hp}</span>
            </div>
          )}
        </div>

        {/* E-Commerce Live Price Lookup Buttons */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 p-3.5 rounded-2xl border border-emerald-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>Cek Harga Pasaran E-Commerce (Indonesia)</span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">Live Marketplace</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-2.5">
            Cari listing harga jual real-time kartu ini di toko-toko Pokémon TCG Indonesia:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={tokopediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-emerald-500 hover:text-white text-emerald-700 border border-emerald-300 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm group"
            >
              <span>Tokopedia</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>

            <a
              href={shopeeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-orange-500 hover:text-white text-orange-600 border border-orange-300 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm group"
            >
              <span>Shopee</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* Card Metadata & Attacks (Indonesian) */}
        {loading ? (
          <div className="p-6 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-red-500" />
            <p className="text-xs">Memuat detail kartu Pokémon Indonesia...</p>
          </div>
        ) : (
          detail && (
            <div className="space-y-3">
              {/* Set & Type info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Set Resmi Indonesia</span>
                  <span className="font-bold text-slate-800">{detail.set?.name || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Nomor Kartu</span>
                  <span className="font-bold text-slate-800">{detail.localId} / {detail.set?.cardCount?.official || '?'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Ilustrator</span>
                  <span className="font-bold text-slate-800">{detail.illustrator || '-'}</span>
                </div>
              </div>

              {/* Description / Pokédex Flavor Text in Indonesian */}
              {detail.description && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900">
                  <p className="italic">"{detail.description}"</p>
                </div>
              )}

              {/* Attacks in Indonesian */}
              {detail.attacks && detail.attacks.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Swords className="w-3.5 h-3.5 text-red-500" /> Serangan:
                  </span>
                  {detail.attacks.map((att, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-800 mb-0.5">
                        <span className="flex items-center gap-1.5">
                          {att.cost && (
                            <span className="text-[10px] text-slate-400">[{att.cost.join(', ')}]</span>
                          )}
                          {att.name}
                        </span>
                        {att.damage && (
                          <span className="text-red-600 font-extrabold">{att.damage}</span>
                        )}
                      </div>
                      {att.effect && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{att.effect}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          {isAdmin && (
            <>
              <button
                onClick={handleAddToInventory}
                disabled={addingToInv}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {addingToInv ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Tambah ke Inventaris</span>
              </button>

              <button
                onClick={handleAddToWishlist}
                disabled={addingToWl}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {addingToWl ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bookmark className="w-4 h-4" />}
                <span className="hidden sm:inline">Wishlist</span>
              </button>
            </>
          )}

          <button
            onClick={onClose}
            className={`${isAdmin ? '' : 'w-full'} bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-5 rounded-xl font-bold text-xs sm:text-sm transition`}
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
