import React from 'react';
import { ShieldCheck, Lock, Clock, CheckCircle2, AlertTriangle, FileCheck, Download } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'Hash Generated':
      case 'Uploaded':
        return {
          bg: 'bg-cyan-950/60 text-cyan-400 border-cyan-500/30',
          icon: <ShieldCheck className="w-3.5 h-3.5 mr-1" />
        };
      case 'Under Review':
        return {
          bg: 'bg-amber-950/60 text-amber-400 border-amber-500/30',
          icon: <Clock className="w-3.5 h-3.5 mr-1" />
        };
      case 'Approved':
        return {
          bg: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30',
          icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
        };
      case 'Download Requested':
        return {
          bg: 'bg-purple-950/60 text-purple-400 border-purple-500/30',
          icon: <Clock className="w-3.5 h-3.5 mr-1" />
        };
      case 'Download Approved':
        return {
          bg: 'bg-emerald-900/80 text-emerald-300 border-emerald-400/50',
          icon: <FileCheck className="w-3.5 h-3.5 mr-1" />
        };
      case 'Downloaded':
        return {
          bg: 'bg-blue-950/60 text-blue-400 border-blue-500/30',
          icon: <Download className="w-3.5 h-3.5 mr-1" />
        };
      case 'Access Restricted':
        return {
          bg: 'bg-rose-950/60 text-rose-400 border-rose-500/30',
          icon: <Lock className="w-3.5 h-3.5 mr-1" />
        };
      default:
        return {
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: <AlertTriangle className="w-3.5 h-3.5 mr-1" />
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${style.bg}`}>
      {style.icon}
      {status}
    </span>
  );
};
