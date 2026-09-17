import React from 'react';

export default function StatCard({ label, value, icon, trend, trendDir = 'up', iconBg = 'bg-primary-fixed', iconColor = 'text-primary' }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant p-5">
      <div className="flex items-center justify-between">
        <p className="text-label-md text-on-surface-variant tracking-wide">{label}</p>
        <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center ${iconColor}`}>
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
      </div>
      <p className="text-display-lg text-on-background mt-2">{value}</p>
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
