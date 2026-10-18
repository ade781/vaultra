import React from 'react';
import { Archive, Plus } from 'lucide-react';
import { getWoodPlank } from '../utils/woodTextures';

export default function EmptyState({ onOpenAddModal }) {
  const woodTexture = getWoodPlank(9);
  const btnWood = getWoodPlank(4);

  return (
    <div className="flex flex-col items-center justify-center p-10 sm:p-14 text-center rounded-3xl bg-[#FFFFFF] border border-[#E5DACB] shadow-sm relative overflow-hidden">
      {/* Top Wood Plank Accent Header */}
      <div 
        className="absolute top-0 left-0 right-0 h-3 border-b border-[#3D271D]/40" 
        style={{
          backgroundImage: `url(${woodTexture})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Wooden Shield Insignia */}
      <div 
        className="w-18 h-18 rounded-3xl border border-[#D4A373]/60 flex items-center justify-center text-[#FFE8C2] mb-5 shadow-lg shadow-[#8C6239]/20 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(45, 26, 16, 0.75), rgba(30, 16, 9, 0.88)), url(${woodTexture})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Archive className="w-8 h-8 stroke-[2.2] text-[#FFDF80]" />
      </div>
      
      <h3 className="text-xl font-extrabold text-[#261C14] mb-2 tracking-tight">
        Brankas Kayu Masih Kosong
      </h3>
      
      <p className="text-xs sm:text-sm text-[#786858] max-w-md mb-6 leading-relaxed">
        Belum ada tautan yang disimpan di dalam brankas. Mulai simpan tautan penting dan kelola hak akses publik maupun privat sekarang.
      </p>

      <button
        type="button"
        onClick={onOpenAddModal}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-[#FAF8F5] overflow-hidden border border-[#D4A373]/80 shadow-md shadow-[#8C6239]/25 hover:shadow-xl hover:shadow-[#8C6239]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
        style={{
          backgroundImage: `linear-gradient(rgba(55, 30, 16, 0.72), rgba(35, 18, 9, 0.85)), url(${btnWood})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Plus className="w-4 h-4 stroke-[2.5] text-[#FFE8C2]" />
        <span>Tambah Tautan Sekarang</span>
      </button>
    </div>
  );
}
