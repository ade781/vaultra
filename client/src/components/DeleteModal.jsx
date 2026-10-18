import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteModal({ isOpen, onClose, onConfirm, itemName, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-slate-100 mb-2">
          Hapus Link Ini?
        </h3>

        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Apakah Anda yakin ingin menghapus <span className="font-semibold text-slate-200">"{itemName}"</span> dari vault? Tindakan ini tidak dapat dibatalkan.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{loading ? 'Menghapus...' : 'Ya, Hapus'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
