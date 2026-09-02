import React, { useState } from 'react';
import { 
  ExternalLink, 
  ShoppingBag, 
  Sparkles, 
  Image as ImageIcon
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { useTracker } from '../../context/TrackerContext';
import { formatRp } from '../../utils/formatters';
import { getTokopediaSearchUrl, getShopeeSearchUrl } from '../../utils/ecommerce';

export const CardDetailModal: React.FC = () => {
  const { isDetailModalOpen, selectedDetailItem, closeDetailModal } = useTracker();
  const [imgError, setImgError] = useState(false);

  if (!selectedDetailItem) return null;

  const item = selectedDetailItem;
  const profit = (item.market || 0) - (item.buy || 0);

  const tokopediaUrl = getTokopediaSearchUrl(item.name, item.set, item.localId);
  const shopeeUrl = getShopeeSearchUrl(item.name, item.set, item.localId);

  return (
    <Modal
      isOpen={isDetailModalOpen}
      onClose={closeDetailModal}
      maxWidth="max-w-lg"
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-red-500" />
          <span className="truncate max-w-[280px] sm:max-w-md">{item.name}</span>
        </div>
      }
    >
      <div className="space-y-4 pt-1">
        {/* Card Artwork Showcase */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-center min-h-[220px] max-h-[320px] overflow-hidden relative">
          {item.imgUrl && !imgError ? (
            <img
              src={item.imgUrl}
              alt={item.name}
              onError={() => setImgError(true)}
              className="max-h-[280px] w-auto object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-300 py-10">
              <ImageIcon className="w-16 h-16 stroke-1" />
              <p className="text-xs text-slate-400 mt-2">Tidak ada foto pratinjau</p>
            </div>
          )}

          {item.rarity && (
            <div className="absolute top-3 left-3">
              <Badge variant="rarity" size="sm">
                <Sparkles className="w-3 h-3" />
                {item.rarity}
              </Badge>
            </div>
          )}

          <div className="absolute top-3 right-3">
            <Badge variant="default" size="sm">
              {item.category}
            </Badge>
          </div>
        </div>

        {/* E-Commerce Live Price Lookup Buttons */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 p-3.5 rounded-2xl border border-emerald-100/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>Cek Harga Pasaran E-Commerce (Indonesia)</span>
            </div>
            <span className="text-[10px] text-slate-400">Live Search</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-2.5">
            Bandingkan harga real-time kartu ini langsung di marketplace Indonesia:
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

        {/* Specs & Pricing Details */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Set / Ekspansi</span>
            <span className="font-bold text-slate-800">{item.set || '-'}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Sumber / Tempat Beli</span>
            <span className="font-bold text-slate-800">{item.source || '-'}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Harga Modal (Beli)</span>
            <span className="font-extrabold text-blue-700 text-sm">{formatRp(item.buy)}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Harga Pasar Saat Ini</span>
            <span className="font-extrabold text-red-600 text-sm">{formatRp(item.market)}</span>
          </div>

          <div className="col-span-2 pt-2 border-t border-slate-200 flex justify-between items-center">
            <span className="text-slate-500 font-medium">Potensi Keuntungan (P/L):</span>
            <span className={`font-black text-sm ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {profit >= 0 ? '+' : ''}{formatRp(profit)}
            </span>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2">
          <button
            onClick={closeDetailModal}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-sm transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
