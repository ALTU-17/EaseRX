import React from 'react';

export default function StatCard({ label, value, icon, trend, trendDir = 'up', iconBg = 'bg-primary-fixed', iconColor = 'text-primary' }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] sm:text-label-md text-on-surface-variant tracking-wide min-w-0 leading-tight break-words">{label}</p>
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0 ${iconColor}`}>
          <span className="material-symbols-outlined text-[18px] sm:text-[20px]">{icon}</span>
        </div>
      </div>
      <p className="text-lg sm:text-display-lg text-on-background mt-2 break-words">{value}</p>
      {trend && (
        <p className={`text-xs mt-1 flex items-center gap-1 ${trendDir === 'up' ? 'text-green-600' : 'text-error'}`}>
          <span className="material-symbols-outlined text-[14px]">
            {trendDir === 'up' ? 'trending_up' : 'trending_down'}
          </span>
          {trend}
        </p>
      )}
    </div>
  );
}
