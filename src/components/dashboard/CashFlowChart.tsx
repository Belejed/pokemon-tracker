import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { CashFlowDayData } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CashFlowChartProps {
  data: CashFlowDayData[];
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({ data }) => {
  const hasData = data && data.length > 0;

  const labels = hasData ? data.map(d => d.label) : ['Belum Ada Data'];
  const incomeData = hasData ? data.map(d => d.income) : [0];
  const expenseData = hasData ? data.map(d => d.expense) : [0];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Pemasukan (Sales)',
        data: incomeData,
        backgroundColor: '#10b981',
        borderRadius: 6,
        barPercentage: 0.7,
      },
      {
        label: 'Pengeluaran (Belanja)',
        data: expenseData,
        backgroundColor: '#ef4444',
        borderRadius: 6,
        barPercentage: 0.7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          padding: 14,
          font: {
            size: 11,
            family: "'Inter', sans-serif",
            weight: 600,
          },
          color: '#64748b'
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            return `${label}: Rp ${value.toLocaleString('id-ID')}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f9',
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 10,
            family: "'Inter', sans-serif",
          },
          callback: (value: any) => `Rp ${(value / 1000).toLocaleString('id-ID')}k`,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 10,
            family: "'Inter', sans-serif",
          },
        },
      },
    },
  };

  return (
    <div className="relative h-56 md:h-72 w-full">
      <Bar data={chartData} options={options} />
    </div>
  );
};
