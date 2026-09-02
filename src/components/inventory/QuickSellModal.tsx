import React, { useState, useEffect } from 'react';
import { HandCoins, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useTracker } from '../../context/TrackerContext';
import { formatRp } from '../../utils/formatters';

export const QuickSellModal: React.FC = () => {
  const { isQuickSellModalOpen, closeQuickSellModal, quickSellItem, quickSell } = useTracker();
  const [sellPrice, setSellPrice] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (quickSellItem) {
      setSellPrice(quickSellItem.market || 0);
    }
  }, [quickSellItem]);

  if (!quickSellItem) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sellPrice <= 0) {
      alert('Nominal harga jual harus lebih dari 0.');
      return;
    }
    setSubmitting(true);
    try {
      await quickSell(quickSellItem.id, quickSellItem.name, sellPrice);
    } catch (err: any) {
      alert(`Gagal mencatat penjualan: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const profit = sellPrice - (quickSellItem.buy || 0);

  return (
    <Modal
      isOpen={isQuickSellModalOpen}
      onClose={closeQuickSellModal}
      maxWidth="max-w-sm"
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <HandCoins className="w-4 h-4" />
          </div>
          <span>Jual Cepat: {quickSellItem.name}</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <p className="text-xs text-slate-500">
          Status item akan diubah menjadi <span className="font-bold text-slate-800">"Terjual"</span> dan omset penjualan akan otomatis dicatat ke Buku Kas Utama.
        </p>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Terjual di Harga Aktual (Rp)
          </label>
          <input
            type="number"
            required
            min="100"
            value={sellPrice}
            onChange={e => setSellPrice(parseInt(e.target.value, 10) || 0)}
            className="w-full bg-emerald-50/80 border border-emerald-300 rounded-xl px-4 py-3 text-lg font-black text-emerald-800 outline-none focus:bg-white focus:border-emerald-500"
          />
          <p className="text-[10px] text-slate-400 mt-1">
            *Harga pasar default telah diisi otomatis. Sesuaikan jika terjual dengan harga berbeda.
          </p>
        </div>

        {/* Profit Estimation summary */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
          <div className="flex justify-between text-slate-500">
            <span>Modal Pembelian Awal:</span>
            <span className="font-semibold text-slate-700">{formatRp(quickSellItem.buy)}</span>
          </div>
          <div className="flex justify-between font-bold pt-1 border-t border-slate-200">
            <span>Estimasi Profit Bersih:</span>
            <span className={profit >= 0 ? 'text-emerald-600' : 'text-red-600'}>
              {profit >= 0 ? '+' : ''}{formatRp(profit)}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={closeQuickSellModal}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm flex items-center gap-2 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Deal! Jual & Catat Kas'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
