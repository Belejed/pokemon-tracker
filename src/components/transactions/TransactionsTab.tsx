import React, { useState, useMemo } from 'react';
import { 
  ArrowLeftRight, 
  Plus, 
  Search, 
  Trash2, 
  User 
} from 'lucide-react';
import { useTracker } from '../../context/TrackerContext';
import { useAuth } from '../../context/AuthContext';
import { formatRp, formatDateDisplay } from '../../utils/formatters';
import { TransactionType } from '../../types';

export const TransactionsTab: React.FC = () => {
  const { transactions, openTrxModal, deleteTransaction } = useTracker();
  const { isAdmin } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'ALL'>('ALL');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const term = searchTerm.toLowerCase();
      const matchSearch = 
        (t.name && t.name.toLowerCase().includes(term)) ||
        (t.person && t.person.toLowerCase().includes(term)) ||
        (t.date && t.date.includes(term));

      const matchType = typeFilter === 'ALL' || t.type === typeFilter;

      return matchSearch && matchType;
    });
  }, [transactions, searchTerm, typeFilter]);

  const typeConfig: Record<TransactionType, { label: string; badgeClass: string; amountClass: string }> = {
    Sales: {
      label: 'Sales (Jual)',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      amountClass: 'text-emerald-600 font-bold',
    },
    Expense: {
      label: 'Expense (Beli)',
      badgeClass: 'bg-red-100 text-red-800 border-red-200',
      amountClass: 'text-red-600 font-bold',
    },
    Capital: {
      label: 'Capital (Modal)',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      amountClass: 'text-blue-600 font-bold',
    },
    Loan: {
      label: 'Loan (Pinjaman)',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      amountClass: 'text-amber-700 font-bold',
    },
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
            Buku Kas & Riwayat Transaksi
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Catatan lengkap mutasi perputaran uang tunai, modal, belanja stok, dan penjualan.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openTrxModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-xs sm:text-sm font-bold shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Transaksi</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari transaksi, tanggal, atau nama..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['ALL', 'Sales', 'Expense', 'Capital', 'Loan'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                typeFilter === t
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === 'ALL' ? 'Semua Tipe' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[560px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="p-3.5 pl-5">Tanggal</th>
                <th className="p-3.5">Tipe</th>
                <th className="p-3.5">Keterangan</th>
                <th className="p-3.5 text-right pr-5">Nominal (Rp)</th>
                {isAdmin && <th className="p-3.5 text-center w-16">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map(t => {
                  const cfg = typeConfig[t.type] || typeConfig.Expense;
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 pl-5 text-slate-500 whitespace-nowrap text-xs">
                        {formatDateDisplay(t.date)}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${cfg.badgeClass}`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800 min-w-[200px]">
                        <div>{t.name}</div>
                        {t.type === 'Loan' && t.person && (
                          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded mt-1">
                            <User className="w-3 h-3 text-amber-600" />
                            <span>Pemberi Pinjaman: {t.person}</span>
                          </div>
                        )}
                      </td>
                      <td className={`p-3.5 pr-5 text-right whitespace-nowrap ${cfg.amountClass}`}>
                        {t.type === 'Expense' ? '-' : '+'}
                        {formatRp(t.amount)}
                      </td>
                      {isAdmin && (
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => deleteTransaction(t.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="text-center p-12 text-slate-400">
                    <ArrowLeftRight className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
                    <p className="font-semibold text-slate-600">Belum ada catatan transaksi</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Catatan transaksi otomatis bertambah saat belanja kartu, jual cepat, atau tambah transaksi manual.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
