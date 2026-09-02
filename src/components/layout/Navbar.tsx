import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  ArrowLeftRight, 
  Bookmark, 
  FileSpreadsheet, 
  Lock, 
  Unlock, 
  LogOut, 
  LogIn, 
  Camera
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTracker } from '../../context/TrackerContext';
import { exportInventoryAndTransactionsCSV } from '../../utils/exportCsv';
import { TabType } from '../../types';

export const Navbar: React.FC = () => {
  const { isAdmin, openLoginModal, logout } = useAuth();
  const { activeTab, setActiveTab, inventory, transactions, openScannerModal } = useTracker();

  const handleExport = () => {
    exportInventoryAndTransactionsCSV(inventory, transactions);
  };

  const navTabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'inventory', label: 'Katalog', icon: <Layers className="w-4 h-4" /> },
    { id: 'transactions', label: 'Transaksi', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: 'wishlist', label: 'Wishlist', icon: <Bookmark className="w-4 h-4" /> },
  ];

  return (
    <header className="max-w-6xl mx-auto glass-nav p-2.5 px-4 md:px-6 rounded-full flex justify-between items-center mb-6 md:mb-8 sticky top-2 md:top-4 z-40 shadow-sm">
      {/* Brand Logo */}
      <div 
        className="flex items-center gap-2.5 font-extrabold text-lg md:text-xl text-slate-800 tracking-tight cursor-pointer select-none"
        onClick={() => setActiveTab('dashboard')}
      >
        <div className="relative w-8 h-8 flex items-center justify-center">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg" 
            className="w-7 h-7 md:w-8 md:h-8 drop-shadow-sm hover:rotate-180 transition-transform duration-500" 
            alt="Pokeball" 
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5 leading-none">
          <span className="font-bold">Pokémon</span>
          <span className="text-red-500 font-extrabold">Tracker <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ml-1">ID</span></span>
        </div>
      </div>

      {/* Desktop Navigation Tabs */}
      <nav className="hidden md:flex items-center gap-1.5 mx-2 bg-slate-100/80 p-1 rounded-full border border-slate-200/60">
        {navTabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-white text-red-600 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Action Buttons & Auth */}
      <div className="flex items-center gap-1.5 md:gap-2.5">
        {/* Quick Camera Scanner Button (Admin Only) */}
        {isAdmin && (
          <button
            onClick={openScannerModal}
            className="bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 p-2 md:px-3 md:py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Scan Kartu dari Kamera (OCR)"
          >
            <Camera className="w-4 h-4 text-purple-600" />
            <span className="hidden lg:inline">Scan Kamera</span>
          </button>
        )}

        {/* Role Badge */}
        <div className="bg-white px-2.5 py-1.5 rounded-full shadow-sm border border-slate-200 text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
          {isAdmin ? (
            <>
              <Unlock className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline text-emerald-700 font-bold">Admin Mode</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline text-slate-500">Read-Only</span>
            </>
          )}
        </div>

        {/* Export CSV Button (Admin Only) */}
        {isAdmin && (
          <button
            onClick={handleExport}
            className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 md:px-3.5 md:py-1.5 rounded-full shadow-sm text-xs md:text-sm font-semibold transition flex items-center justify-center gap-1.5"
            title="Export CSV / Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden md:inline">Export</span>
          </button>
        )}

        {/* Auth Button */}
        {isAdmin ? (
          <button
            onClick={logout}
            className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 p-2 md:px-3.5 md:py-1.5 rounded-full text-xs md:text-sm font-semibold transition flex items-center justify-center gap-1.5"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Keluar</span>
          </button>
        ) : (
          <button
            onClick={openLoginModal}
            className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-full shadow-sm text-xs md:text-sm font-semibold transition flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Login Admin</span>
          </button>
        )}
      </div>
    </header>
  );
};
