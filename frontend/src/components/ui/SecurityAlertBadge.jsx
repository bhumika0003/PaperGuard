import React from 'react';
import { AlertCircle, AlertOctagon, ShieldAlert, Info } from 'lucide-react';

export const SecurityAlertBadge = ({ severity }) => {
  const getStyle = () => {
    switch (severity) {
      case 'Critical':
        return { bg: 'bg-rose-950/80 text-rose-300 border-rose-600', icon: <AlertOctagon className="w-3.5 h-3.5 mr-1" /> };
      case 'High':
        return { bg: 'bg-orange-950/80 text-orange-300 border-orange-600', icon: <ShieldAlert className="w-3.5 h-3.5 mr-1" /> };
      case 'Medium':
        return { bg: 'bg-amber-950/80 text-amber-300 border-amber-500', icon: <AlertCircle className="w-3.5 h-3.5 mr-1" /> };
      default:
        return { bg: 'bg-blue-950/80 text-blue-300 border-blue-500', icon: <Info className="w-3.5 h-3.5 mr-1" /> };
    }
  };

  const style = getStyle();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border ${style.bg}`}>
      {style.icon}
      {severity}
    </span>
  );
};
