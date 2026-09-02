import React, { useState } from 'react';
import { 
  DollarSign, 
  Scissors, 
  Edit3, 
  Trash2, 
  Store, 
  Dice5, 
  Sparkles, 
  Layers, 
  Box, 
  Image as ImageIcon 
} from 'lucide-react';
import { InventoryItem } from '../../types';
import { Badge } from '../common/Badge';
import { formatRp, calculateGachaROI } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useTracker } from '../../context/TrackerContext';

interface InventoryCardProps {
  item: InventoryItem;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({ item }) => {
  const { isAdmin } = useAuth();
  const { 
    inventory, 
    openEditItemModal, 
    openQuickSellModal, 
    deleteInventoryItem, 
    ripBox,
    openDetailModal 
  } = useTracker();

  const [imgError, setImgError] = useState(false);

  const profit = (item.market || 0) - (item.buy || 0);
  const isGachaItem = !!item.pulledFromId;
  const parentBox = isGachaItem ? inventory.find(i => i.id === item.pulledFromId) : null;

  // If this item is an opened box, calculate ROI from cards pulled from it
  const isOpenedBox = item.status === 'Opened' && (item.category === 'Box' || item.category === 'Pack');
  const gachaROI = isOpenedBox ? calculateGachaROI(item, inventory) : null;

  return (
    <div className="item-card bg-white rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col shadow-sm hover:border-red-400/80 group transition-all">
      {/* Card Image Container */}
      <div 
        className="h-48 sm:h-52 bg-slate-50 flex items-center justify-center p-3 relative overflow-hidden cursor-pointer border-b border-slate-100"
        onClick={() => openDetailModal(item)}
      >
        {item.imgUrl && !imgError ? (
          <img
            src={item.imgUrl}
            alt={item.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300 gap-1.5">
            {item.category === 'Box' ? (
              <Box className="w-12 h-12" />
            ) : item.category === 'Pack' ? (
              <Layers className="w-12 h-12" />
            ) : (
              <ImageIcon className="w-12 h-12" />
            )}
            <span className="text-[10px] text-slate-400 uppercase font-semibold">{item.category}</span>
          </div>
        )}

        {/* Status Overlays */}
        {item.status === 'Sold' && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-slate-950 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-lg rotate-12 shadow-xl border border-slate-700 tracking-wider">
              TERJUAL
            </span>
          </div>
        )}

        {item.status === 'Opened' && (
          <div className="absolute inset-0 bg-purple-900/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-purple-700 text-white font-extrabold text-[11px] px-3 py-1 rounded-lg rotate-12 shadow-xl border border-purple-500 tracking-wider">
              DIBUKA (RIPPED)
            </span>
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start pointer-events-none">
          {item.rarity && (
            <Badge variant="rarity">
              <Sparkles className="w-2.5 h-2.5" />
              {item.rarity}
            </Badge>
          )}
        </div>

        <div className="absolute top-2 right-2 pointer-events-none">
          <Badge variant="default" size="xs">
            {item.category}
          </Badge>
        </div>
      </div>

      {/* Card Info Body */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1">
        {/* Pulled From Badge */}
        {parentBox && (
          <div className="mb-2 self-start">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-100/90 border border-purple-200 px-2 py-0.5 rounded-full">
              <Dice5 className="w-3 h-3 text-purple-600" />
              <span className="truncate max-w-[140px]" title={parentBox.name}>
                Dari: {parentBox.name}
              </span>
            </span>
          </div>
        )}

        {/* Card Name */}
        <h3 
          className="font-bold text-slate-800 text-sm sm:text-base leading-snug mb-1 line-clamp-1 group-hover:text-red-600 transition-colors cursor-pointer"
          title={item.name}
          onClick={() => openDetailModal(item)}
        >
          {item.name}
        </h3>

        {/* Set & Source Info */}
        <div className="text-[11px] text-slate-500 mb-3 flex items-center flex-wrap gap-1.5">
          {item.set && (
            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium truncate max-w-[120px]" title={item.set}>
              {item.set}
            </span>
          )}
          {item.source && (
            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded flex items-center gap-1 font-medium text-[10px]">
              <Store className="w-2.5 h-2.5" />
              <span className="truncate max-w-[80px]" title={item.source}>{item.source}</span>
            </span>
          )}
        </div>

        {/* Valuation & ROI Info */}
        <div className="mt-auto pt-2 border-t border-slate-100">
          {gachaROI ? (
            <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-100 text-xs">
              <div className="font-bold text-purple-900 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1"><Dice5 className="w-3 h-3 text-purple-600" /> Gacha ROI</span>
                <span className="bg-purple-200 text-purple-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">{gachaROI.pullsCount} Kartu</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                <span>Modal Box:</span>
                <span className="font-semibold">{formatRp(gachaROI.boxBuyCost)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                <span>Total Pulls:</span>
                <span className="font-semibold text-purple-700">{formatRp(gachaROI.totalPullsMarketValue)}</span>
              </div>
              <div className="flex justify-between font-bold text-xs pt-1 border-t border-purple-200">
                <span>ROI Profit:</span>
                <span className={gachaROI.roiProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                  {gachaROI.roiProfit >= 0 ? '+' : ''}{formatRp(gachaROI.roiProfit)}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] font-semibold text-slate-400">Harga Pasar</span>
                <span className="font-extrabold text-red-600 text-sm sm:text-base">
                  {formatRp(item.market)}
                </span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 text-[11px]">
                <span className="text-slate-500">
                  Modal: <span className="font-semibold text-slate-700">{formatRp(item.buy)}</span>
                </span>
                <span className={`font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {profit >= 0 ? '+' : ''}{formatRp(profit)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Action Footer */}
      {isAdmin && (
        <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
          {item.status === 'Kept' && (
            <button
              onClick={() => openQuickSellModal(item)}
              className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold py-1 px-2 rounded-lg transition flex items-center justify-center gap-1 shadow-sm"
              title="Jual Cepat"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Jual</span>
            </button>
          )}

          {item.status === 'Kept' && (item.category === 'Box' || item.category === 'Pack') && (
            <button
              onClick={() => ripBox(item.id, item.name)}
              className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold py-1 px-2 rounded-lg transition flex items-center justify-center gap-1 shadow-sm"
              title="Buka Box / Pack"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Buka</span>
            </button>
          )}

          <button
            onClick={() => openEditItemModal(item)}
            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold py-1 px-2 rounded-lg transition flex items-center justify-center gap-1 shadow-sm"
            title="Edit Data"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </button>

          <button
            onClick={() => deleteInventoryItem(item.id, item.linkedTrxId)}
            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition flex items-center justify-center shadow-sm"
            title="Hapus"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
