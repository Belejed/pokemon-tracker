import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryChartProps {
  distribution: Record<string, number>;
}

export const CategoryChart: React.FC<CategoryChartProps> = ({ distribution }) => {
  const categories = Object.keys(distribution);
  const values = Object.values(distribution);
  const totalItems = values.reduce((sum, v) => sum + v, 0);

  const chartData = {
    labels: categories.map(c => {
      if (c === 'Card') return 'Single Card';
      if (c === 'Box') return 'Sealed Box';
      if (c === 'Pack') return 'Booster Pack';
      if (c === 'Slab') return 'Graded Slab';
      return 'Lainnya';
    }),
    datasets: [
      {
        data: totalItems === 0 ? [1] : values,
        backgroundColor: totalItems === 0 ? ['#e2e8f0'] : ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#94a3b8'],
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 10,
          padding: 10,
          font: {
            size: 11,
            family: "'Inter', sans-serif",
            weight: 500,
          },
          color: '#64748b',
        },
      },
      tooltip: {
        enabled: totalItems > 0,
      },
    },
  };

  return (
    <div className="relative h-56 md:h-72 w-full flex items-center justify-center">
      <Doughnut data={chartData} options={options} />
      {totalItems > 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pr-24 sm:pr-28">
          <span className="text-2xl font-black text-slate-800 leading-tight">{totalItems}</span>
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Aset</span>
        </div>
      )}
    </div>
  );
};
