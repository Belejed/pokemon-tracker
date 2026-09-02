import React, { useState, useEffect } from 'react';
import { 
  Loader2, 
  ChevronRight 
} from 'lucide-react';
import { tcgdexService } from '../../services/tcgdexService';
import { TCGdexSetSummary } from '../../types/tcgdex';
import { useTracker } from '../../context/TrackerContext';

export const SetsTab: React.FC = () => {
  const { setActiveTab } = useTracker();
  const [sets, setSets] = useState<TCGdexSetSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tcgdexService
      .getSets()
      .then(data => {
        setSets(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <span>Set & Ekspansi Resmi Pokémon Indonesia</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-0.5">
          Daftar seluruh ekspansi booster pack & booster box resmi yang dirilis di Indonesia.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-600">Memuat data ekspansi Indonesia...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sets.map(set => (
            <div
              key={set.id}
              onClick={() => setActiveTab('catalog')}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm hover:border-red-400 hover:shadow-md transition cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-500 to-rose-400 text-white font-black text-xs flex items-center justify-center shadow-md flex-shrink-0">
                  {set.id}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-tight truncate group-hover:text-red-600 transition-colors">
                    {set.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>{set.cardCount?.total || set.cardCount?.official || '?'} Kartu</span>
                    <span>&bull;</span>
                    <span className="text-red-500 font-semibold text-[11px]">Lihat Kartu</span>
                  </div>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
