import React from 'react';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { validateEmail } from '../../utils/emailValidator';

export const EmailInput = ({
  value,
  onChange,
  label = 'Institutional Email Address',
  placeholder = 'e.g. aturing@university.edu',
  required = true,
  showValidationMessage = true,
  disabled = false,
  className = ''
}) => {
  const isTouched = value && value.trim().length > 0;
  const validation = isTouched ? validateEmail(value) : { isValid: null, error: null };

  const getBorderClasses = () => {
    if (!isTouched) {
      return 'border-slate-200 dark:border-slate-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20';
    }
    if (validation.isValid) {
      return 'border-emerald-500 dark:border-emerald-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20';
    }
    return 'border-rose-500 dark:border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20';
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          {isTouched && validation.isValid && (
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Valid format
            </span>
          )}
        </div>
      )}

      <div className="relative">
        <Mail className={`w-4 h-4 absolute left-3.5 top-3.5 transition-colors ${
          !isTouched 
            ? 'text-slate-400' 
            : validation.isValid 
              ? 'text-emerald-500' 
              : 'text-rose-500'
        }`} />
        
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="email"
          className={`w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border text-slate-800 dark:text-white text-xs sm:text-sm placeholder-slate-400 outline-none transition shadow-sm ${getBorderClasses()}`}
        />

        {isTouched && (
          <div className="absolute right-3.5 top-3.5 flex items-center pointer-events-none">
            {validation.isValid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500" />
            )}
          </div>
        )}
      </div>

      {showValidationMessage && isTouched && !validation.isValid && (
        <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 pt-0.5 animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{validation.error}</span>
        </p>
      )}
    </div>
  );
};
