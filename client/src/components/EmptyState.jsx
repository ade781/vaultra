import React from 'react';
import { Archive, Plus } from 'lucide-react';

export default function EmptyState({ onOpenAddModal }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center rounded-3xl bg-[#FFFFFF] border border-[#EFE8DE] shadow-xs">
      <div className="w-16 h-16 rounded-2xl bg-[#F7F2EA] border border-[#E5DACB] flex items-center justify-center text-[#8C6239] mb-4 shadow-xs">
        <Archive className="w-8 h-8 stroke-[1.8]" />
      </div>
      
      <h3 className="text-lg font-bold text-[#261C14] mb-1">
        Belum Ada Link Tersimpan
      </h3>
      
      <p className="text-xs text-[#786858] max-w-sm mb-6 leading-relaxed">
        Penyimpanan tautan kamu masih kosong. Tambahkan link Google Drive atau link web penting pertamamu sekarang.
      </p>

      <button
        type="button"
        onClick={onOpenAddModal}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#8C6239] hover:bg-[#734F2C] active:bg-[#5E3F21] shadow-sm shadow-[#8C6239]/20 transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>Tambah Link Sekarang</span>
      </button>
    </div>
  );
}
