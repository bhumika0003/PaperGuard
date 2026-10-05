import React from 'react';

export const StatCard = ({ title, value, icon: Icon, trend, color = 'cyan' }) => {
  const getColorClasses = () => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-500/10 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400';
      case 'amber':
        return 'bg-amber-500/10 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-400';
      case 'rose':
        return 'bg-rose-500/10 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-400';
      case 'purple':
        return 'bg-purple-500/10 dark:bg-purple-500/10 border-purple-300 dark:border-purple-500/30 text-purple-700 dark:text-purple-400';
      default:
        return 'bg-cyan-500/10 dark:bg-cyan-500/10 border-cyan-300 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400';
    }
  };

  return (
    <div className={`p-5 rounded-3xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#33435C] shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl group`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#CBD5E1]">{title}</span>
        <div className={`p-2.5 rounded-2xl ${getColorClasses()} border group-hover:scale-110 transition duration-300`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</div>
        {trend && <span className="text-xs font-semibold text-slate-500 dark:text-[#CBD5E1]">{trend}</span>}
      </div>
    </div>
  );
};
