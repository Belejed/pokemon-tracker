import { InventoryItem } from '../types';

export const formatRp = (num?: number | null): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(num || 0);
};

export const getTodayString = (): string => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

export const formatDateDisplay = (dateStr?: string): string => {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${parseInt(parts[2], 10)} ${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

export interface GachaROIResult {
  pullsCount: number;
  totalPullsMarketValue: number;
  boxBuyCost: number;
  roiProfit: number;
  roiPercentage: number;
}

export const calculateGachaROI = (
  box: InventoryItem,
  allInventory: InventoryItem[]
): GachaROIResult => {
  const childPulls = allInventory.filter(item => item.pulledFromId === box.id);
  const totalPullsMarketValue = childPulls.reduce((sum, item) => sum + (item.market || 0), 0);
  const boxBuyCost = box.buy || 0;
  const roiProfit = totalPullsMarketValue - boxBuyCost;
  const roiPercentage = boxBuyCost > 0 ? (roiProfit / boxBuyCost) * 100 : 0;

  return {
    pullsCount: childPulls.length,
    totalPullsMarketValue,
    boxBuyCost,
    roiProfit,
    roiPercentage
  };
};
