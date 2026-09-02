import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'rarity' | 'status-sold' | 'status-opened' | 'success' | 'danger' | 'warning' | 'info' | 'purple';
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  size = 'xs'
}) => {
  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1'
  }[size];

  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    rarity: 'bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-950 font-extrabold border border-yellow-500 shadow-sm uppercase tracking-wider',
    'status-sold': 'bg-slate-800 text-white font-bold',
    'status-opened': 'bg-purple-600 text-white font-bold',
    success: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    danger: 'bg-red-100 text-red-800 border border-red-200',
    warning: 'bg-amber-100 text-amber-800 border border-amber-200',
    info: 'bg-blue-100 text-blue-800 border border-blue-200',
    purple: 'bg-purple-100 text-purple-800 border border-purple-200'
  }[variant];

  return (
    <span className={`inline-flex items-center gap-1 rounded-md font-medium ${sizeClasses} ${variantClasses} ${className}`}>
      {children}
    </span>
  );
};
