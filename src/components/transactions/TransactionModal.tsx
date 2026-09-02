import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Loader2, Calendar, User } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useTracker } from '../../context/TrackerContext';
import { TransactionType } from '../../types';
import { getTodayString } from '../../utils/formatters';

export const TransactionModal: React.FC = () => {
  const { isTrxModalOpen, closeTrxModal, saveTransaction } = useTracker();

  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('Expense');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState(getTodayString());
  const [person, setPerson] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isTrxModalOpen) {
      setName('');
      setType('Expense');
      setAmount(0);
      setDate(getTodayString());
      setPerson('');
    }
  }, [isTrxModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || amount <= 0) {
      alert('Mohon isi keterangan transaksi dan nominal > 0');
      return;
    }

    setSaving(true);
    try {
      await saveTransaction({
        name: name.trim(),
        type,
        amount: Number(amount) || 0,
        date: date || getTodayString(),
        person: type === 'Loan' ? person.trim() : '',
      });
    } catch (err: any) {
      alert(`Gagal menyimpan transaksi: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isTrxModalOpen}
      onClose={closeTrxModal}
      maxWidth="max-w-md"
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
          <span>Catat Transaksi Kas</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Keterangan Transaksi <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Contoh: Belanja Booster Box, Suntikan Kas Awal..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Transaksi</label>
          <select
            value={type}
            onChange={e => setType(e.target.value as TransactionType)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="Expense">🔴 Pengeluaran Belanja (Expense)</option>
            <option value="Sales">🟢 Pemasukan Jualan (Sales)</option>
            <option value="Capital">💉 Suntik Modal (Capital In)</option>
            <option value="Loan">🔄 Hutang/Pinjaman (Loan)</option>
          </select>
        </div>

        {type === 'Loan' && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl animate-in fade-in duration-150">
            <label className="block text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Hutang / Pinjaman Dari Siapa?</span>
            </label>
            <input
              type="text"
              required
              value={person}
              onChange={e => setPerson(e.target.value)}
              placeholder="Nama pemberi pinjaman..."
              className="w-full bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs text-amber-900 outline-none focus:border-amber-500"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Nominal (Rp) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            required
            min="100"
            value={amount || ''}
            onChange={e => setAmount(parseInt(e.target.value, 10) || 0)}
            placeholder="Rp 0"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-base font-black text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Tanggal Transaksi</span>
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={closeTrxModal}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan Transaksi'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
