import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl text-slate-100 text-sm animate-in slide-in-from-bottom-5 duration-200">
      {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
      {isError && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
      {!isSuccess && !isError && <Info className="w-5 h-5 text-indigo-400 shrink-0" />}
      
      <span className="font-medium text-xs sm:text-sm">{message}</span>

      <button
        onClick={onClose}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 ml-2"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
