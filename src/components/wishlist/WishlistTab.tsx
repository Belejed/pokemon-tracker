import React from 'react';
import { 
  Bookmark, 
  Plus, 
  ShoppingCart, 
  Trash2, 
  ExternalLink 
} from 'lucide-react';
import { useTracker } from '../../context/TrackerContext';
import { useAuth } from '../../context/AuthContext';
import { formatRp } from '../../utils/formatters';
import { getTokopediaSearchUrl, getShopeeSearchUrl } from '../../utils/ecommerce';

export const WishlistTab: React.FC = () => {
  const { wishlist, openWishlistModal, deleteWishlist, buyWishlist } = useTracker();
  const { isAdmin } = useAuth();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
            Target Incaran (Wishlist)
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Daftar kartu impian yang ingin dibeli selanjutnya beserta target batas harga maksimal.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openWishlistModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-xs sm:text-sm font-bold shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Incaran</span>
          </button>
        )}
      </div>

      {/* Wishlist Grid */}
      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map(item => {
            const topTokopedia = getTokopediaSearchUrl(item.name, item.set);
            const topShopee = getShopeeSearchUrl(item.name, item.set);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between group"
              >
                <div className="flex items-start gap-3.5 mb-3">
                  {item.imgUrl ? (
                    <img
                      src={item.imgUrl}
                      alt={item.name}
                      className="w-14 h-20 object-contain rounded-lg bg-slate-50 border border-slate-100 p-1 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Bookmark className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-tight truncate group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </h3>
                    {item.set && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{item.set}</p>
                    )}
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-400">Target Max:</span>
                      <span className="font-black text-blue-700 text-sm sm:text-base">
                        {formatRp(item.target)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* E-Commerce Search Shortlinks */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-slate-400">Hunt:</span>
                    <a
                      href={topTokopedia}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:underline font-semibold bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-0.5"
                    >
                      <span>Tokopedia</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    <a
                      href={topShopee}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:underline font-semibold bg-orange-50 px-2 py-0.5 rounded flex items-center gap-0.5"
                    >
                      <span>Shopee</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => buyWishlist(item)}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
                        title="Beli & Masukkan ke Katalog"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-[11px]">Beli</span>
                      </button>
                      <button
                        onClick={() => deleteWishlist(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Hapus Target"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-400 flex items-center justify-center mb-3">
            <Bookmark className="w-8 h-8 stroke-1" />
          </div>
          <h3 className="text-base font-bold text-slate-700">Belum ada target incaran</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Catat kartu incaran impian kamu agar selalu memantau harga pasaran terbaik.
          </p>
          {isAdmin && (
            <button
              onClick={openWishlistModal}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Tambah Incaran
            </button>
          )}
        </div>
      )}
    </div>
  );
};
