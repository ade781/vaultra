import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
        isSuccess 
          ? 'bg-[#FFFFFF] border-[#D4A373]/40 text-[#261C14] shadow-[#8C6239]/10' 
          : 'bg-rose-50 border-rose-200 text-rose-800 shadow-rose-900/10'
      }`}>
        {isSuccess ? (
          <CheckCircle2 className="w-4 h-4 text-[#8C6239] shrink-0" />
        ) : (
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
        )}
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-2 p-1 rounded-md text-[#9E8C7C] hover:text-[#261C14] transition-colors"
          aria-label="Tutup notifikasi"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
