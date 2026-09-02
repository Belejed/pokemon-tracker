import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { TrackerProvider, useTracker } from './context/TrackerContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { DashboardTab } from './components/dashboard/DashboardTab';
import { InventoryTab } from './components/inventory/InventoryTab';
import { TransactionsTab } from './components/transactions/TransactionsTab';
import { WishlistTab } from './components/wishlist/WishlistTab';

// Modals
import { ItemModal } from './components/inventory/ItemModal';
import { QuickSellModal } from './components/inventory/QuickSellModal';
import { CardDetailModal } from './components/inventory/CardDetailModal';
import { CameraScannerModal } from './components/inventory/CameraScannerModal';
import { TransactionModal } from './components/transactions/TransactionModal';
import { WishlistModal } from './components/wishlist/WishlistModal';
import { LoginModal } from './components/auth/LoginModal';

const TrackerContent: React.FC = () => {
  const { activeTab } = useTracker();

  return (
    <div className="min-h-screen flex flex-col p-2 sm:p-4 md:p-8 pb-24 md:pb-12">
      {/* Top Floating Glass Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto w-full flex-1">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'inventory' && <InventoryTab />}
        {activeTab === 'transactions' && <TransactionsTab />}
        {activeTab === 'wishlist' && <WishlistTab />}
      </main>

      {/* All Application Modals */}
      <ItemModal />
      <QuickSellModal />
      <CardDetailModal />
      <CameraScannerModal />
      <TransactionModal />
      <WishlistModal />
      <LoginModal />

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Open Source Footer */}
      <footer className="max-w-6xl mx-auto w-full text-center mt-12 pt-6 border-t border-slate-200/60 text-xs text-slate-400">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            ⚡ <strong>Pokémon Tracker Indonesia</strong> &copy; {new Date().getFullYear()} &bull; Open Source under MIT License.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://tcgdex.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-purple-600 transition font-medium"
            >
              Powered by TCGdex API
            </a>
            <span>&bull;</span>
            <a
              href="https://github.com/Belejed/pokemon-tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-800 transition font-medium"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <TrackerProvider>
        <TrackerContent />
      </TrackerProvider>
    </AuthProvider>
  );
}

export default App;
