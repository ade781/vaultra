import React from 'react';
import { Plus, Archive } from 'lucide-react';

export default function Navbar({ onOpenAddModal, totalItems = 0 }) {
  return (
    <header className="sticky top-0 z-30 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#EFEAE1] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand / Logo - Ultra Minimalis */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F7F2EA] border border-[#E5DACB] flex items-center justify-center text-[#8C6239] shadow-xs">
            <Archive className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#261C14]">
            Vaultra
          </span>
        </div>

        {/* Right Section: Counter & Action */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#EFE8DE] text-xs font-medium text-[#786858]">
            <span>{totalItems} Link</span>
          </div>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-[#8C6239] hover:bg-[#734F2C] active:bg-[#5E3F21] shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Tambah</span>
          </button>
        </div>

      </div>
    </header>
  );
}
