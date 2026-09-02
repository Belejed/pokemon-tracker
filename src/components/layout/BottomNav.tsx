import React from 'react';
import { 
  Sparkles, 
  Layers, 
  Box, 
  Wallet, 
  Camera 
} from 'lucide-react';
import { useTracker } from '../../context/TrackerContext';
import { useAuth } from '../../context/AuthContext';
import { TabType } from '../../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, openScannerModal } = useTracker();
  const { isAdmin } = useAuth();

  const tabs: { id: TabType; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
    { id: 'catalog', label: 'Katalog', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'inventory', label: 'Inventaris', icon: <Layers className="w-5 h-5" /> },
    { id: 'sets', label: 'Set & Seri', icon: <Box className="w-5 h-5" /> },
    { id: 'dashboard', label: 'Kas', icon: <Wallet className="w-5 h-5" />, adminOnly: true },
  ];

  const visibleTabs = tabs.filter(t => !t.adminOnly || isAdmin);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 flex justify-around items-center pb-2 pt-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      {visibleTabs.map((tab, idx) => {
        const isActive = activeTab === tab.id;
        
        // Show camera button in the center
        if (idx === 1) {
          return (
            <React.Fragment key="camera-frag">
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center p-1.5 flex-1 transition-colors ${
                  isActive ? 'text-red-500 font-bold' : 'text-slate-400 font-medium'
                }`}
              >
                <div className="mb-0.5">{tab.icon}</div>
                <span className="text-[10px]">{tab.label}</span>
              </button>

              <button
                key="camera-btn"
                onClick={openScannerModal}
                className="flex flex-col items-center justify-center p-1 -mt-5 bg-gradient-to-tr from-purple-600 to-indigo-500 text-white rounded-full w-12 h-12 shadow-lg shadow-purple-500/30 active:scale-95 transition-transform"
                title="Scan Kartu Kamera"
              >
                <Camera className="w-5 h-5" />
              </button>
            </React.Fragment>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center p-1.5 flex-1 transition-colors ${
              isActive ? 'text-red-500 font-bold' : 'text-slate-400 font-medium'
            }`}
          >
            <div className="mb-0.5">{tab.icon}</div>
            <span className="text-[10px]">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
