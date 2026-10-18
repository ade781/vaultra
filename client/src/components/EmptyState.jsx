import React from 'react';
import { HardDrive, Search, FilterX, Plus } from 'lucide-react';

export default function EmptyState({ 
  searchQuery, 
  activeCategory, 
  activeTag, 
  activeDriveType,
  onResetFilters, 
  onAddNew 
}) {
  const isFiltered = Boolean(searchQuery || activeCategory || activeTag || (activeDriveType && activeDriveType !== 'ALL'));

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
          {isFiltered ? (
            <Search className="w-8 h-8 text-indigo-400 stroke-[1.75]" />
          ) : (
            <HardDrive className="w-8 h-8 text-indigo-400 stroke-[1.75]" />
          )}
        </div>
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-30"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500/80 border-2 border-slate-900"></span>
        </span>
      </div>

      <h3 className="text-xl font-bold text-slate-100 mb-2">
        {isFiltered ? 'Tidak ada link yang sesuai' : 'Vault Digital Masih Kosong'}
      </h3>

      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
        {isFiltered
          ? 'Tidak ada link Google Drive yang cocok dengan kriteria pencarian atau filter yang aktif saat ini.'
          : 'Belum ada berkas atau folder Google Drive yang tersimpan. Mulai rapikan aset digital Anda dengan menyimpan link pertama!'}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {isFiltered ? (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-sm border border-slate-700"
          >
            <FilterX className="w-4 h-4 text-slate-400" />
            Reset Semua Filter
          </button>
        ) : null}

        <button
          onClick={onAddNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          Simpan Link Baru
        </button>
      </div>
    </div>
  );
}
