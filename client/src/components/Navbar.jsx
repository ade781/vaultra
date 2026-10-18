import React from 'react';
import { 
  Search, 
  X, 
  Plus, 
  ShieldCheck, 
  Menu,
  Layers
} from 'lucide-react';

export default function Navbar({ 
  searchQuery, 
  onSearchChange, 
  onAddNew, 
  onToggleSidebar,
  totalItems = 0
}) {
  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left: Brand Logo & Mobile Sidebar Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                    Vaultra
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    GDrive
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:block">
                  Personal Digital Vault
                </span>
              </div>
            </div>
          </div>

          {/* Middle: Reactive Search Bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari judul link, deskripsi, atau URL..."
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                  aria-label="Bersihkan pencarian"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Item Counter & Tambah Link Action */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>{totalItems} Link Tersimpan</span>
            </div>

            <button
              onClick={onAddNew}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Tambah Link</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
