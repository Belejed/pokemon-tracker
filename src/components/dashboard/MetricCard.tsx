import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  borderTopColor?: string;
  bgColor?: string;
  isMain?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  borderTopColor = 'border-slate-300',
  bgColor = 'bg-white',
  isMain = false
}) => {
  if (isMain) {
    return (
      <div className={`p-5 md:p-6 rounded-2xl shadow-sm border border-blue-200 border-l-8 border-l-blue-600 ${bgColor} flex flex-col md:flex-row justify-between items-start md:items-center gap-3 transition-all`}>
        <div>
          <div className="flex items-center gap-2 text-blue-700 font-bold uppercase tracking-wider text-xs md:text-sm">
            {icon}
            <span>{title}</span>
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="text-2xl sm:text-3xl md:text-4xl font-black text-blue-700 tracking-tight">
          {value}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 md:p-5 rounded-2xl shadow-sm border border-slate-100 border-t-4 ${borderTopColor} ${bgColor} flex flex-col justify-between transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-slate-500 font-semibold text-xs md:text-sm tracking-wide">{title}</h3>
        <div className="p-2 rounded-xl bg-slate-50 text-slate-600">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">{value}</p>
        {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
};
