import React from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Sparkles,
  BarChart3,
  PieChart
} from 'lucide-react';
import { useTracker } from '../../context/TrackerContext';
import { MetricCard } from './MetricCard';
import { CashFlowChart } from './CashFlowChart';
import { CategoryChart } from './CategoryChart';
import { formatRp } from '../../utils/formatters';

export const DashboardTab: React.FC = () => {
  const {
    cashBalance,
    totalIncome,
    totalExpense,
    totalAssetValue,
    categoryDistribution,
    dailyCashFlow,
    inventory
  } = useTracker();

  const totalPortfolioWorth = cashBalance + totalAssetValue;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span>Buku Kas & Valuasi Portofolio</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Ringkasan saldo kas tunai, mutasi penjualan/belanja, serta estimasi nilai aset koleksi Pokémon.
          </p>
        </div>

        <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 self-start sm:self-auto">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-xs text-slate-500">Net Worth:</span>
          <span className="text-xs md:text-sm font-black text-slate-800">{formatRp(totalPortfolioWorth)}</span>
        </div>
      </div>

      {/* Main Cash Balance Card */}
      <MetricCard
        isMain
        title="Saldo Kas (Uang Tunai)"
        subtitle="Suntikan Modal + Hasil Penjualan - Belanja Stok + Hutang/Pinjaman"
        value={formatRp(cashBalance)}
        icon={<Wallet className="w-5 h-5 text-blue-600" />}
        bgColor="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white"
      />

      {/* 3 Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
        <MetricCard
          title="Pemasukan (Sales)"
          value={formatRp(totalIncome)}
          subtitle="Total omset penjualan kartu/box"
          borderTopColor="border-emerald-500"
          icon={<TrendingUp className="w-4 h-4 text-emerald-600" />}
        />
        <MetricCard
          title="Pengeluaran (Belanja)"
          value={formatRp(totalExpense)}
          subtitle="Total belanja stok & box baru"
          borderTopColor="border-red-500"
          icon={<TrendingDown className="w-4 h-4 text-red-600" />}
        />
        <MetricCard
          title="Nilai Aset Tersimpan"
          value={formatRp(totalAssetValue)}
          subtitle={`${inventory.filter(i => i.status === 'Kept').length} item koleksi tersimpan`}
          borderTopColor="border-purple-500"
          icon={<Layers className="w-4 h-4 text-purple-600" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Cash Flow Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-red-500" />
              <h2 className="text-xs md:text-sm font-bold text-slate-800 uppercase tracking-wider">
                Riwayat Cash Flow Harian
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Income vs Expense</span>
          </div>
          <div className="flex-1">
            <CashFlowChart data={dailyCashFlow} />
          </div>
        </div>

        {/* Category Breakdown Doughnut Chart */}
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-500" />
              <h2 className="text-xs md:text-sm font-bold text-slate-800 uppercase tracking-wider">
                Distribusi Kategori Aset
              </h2>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <CategoryChart distribution={categoryDistribution} />
          </div>
        </div>
      </div>
    </div>
  );
};
