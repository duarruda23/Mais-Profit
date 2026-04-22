import React from 'react';
import { cn, formatCurrency } from '../lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'danger' | 'warning';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant = 'default' 
}) => {
  const textColor = variant === 'danger' ? 'text-rose-600' : variant === 'success' ? 'text-emerald-600' : 'text-slate-900';

  return (
    <div className="hd-card bg-white">
      <div className="flex flex-col">
        <span className="hd-label mb-1">{title}</span>
        <div className="flex items-center justify-between">
          <span className={cn("hd-value", textColor)}>{formatCurrency(value)}</span>
          <div className="p-1.5 bg-slate-50 border border-slate-100 rounded-md text-slate-400">
            <Icon size={16} />
          </div>
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 mt-1 text-[11px] font-bold",
            trend.isPositive ? "text-emerald-500" : "text-rose-500"
          )}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{trend.value}% vs mês ant.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
