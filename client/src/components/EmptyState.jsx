import React from 'react';
import { Archive, Plus, ShieldCheck, LayoutGrid } from 'lucide-react';
import { getWoodPlank } from '../utils/woodTextures';

export default function EmptyState({
  filter = 'all',
  onResetFilter,
  onOpenAddModal,
  compartmentName = null,
}) {
  const woodTexture = getWoodPlank(9);
  const btnWood = getWoodPlank(4);

  const isUrgentFilter = filter === 'urgent';

  return (
    <div className="flex flex-col items-center justify-center p-10 sm:p-14 text-center rounded-3xl bg-[#FAF7F2] border border-[#E5DACB] shadow-sm relative overflow-hidden">
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
        className={`w-18 h-18 rounded-3xl border flex items-center justify-center mb-5 shadow-lg relative overflow-hidden ${
          isUrgentFilter
            ? 'border-[#34D399]/60 shadow-[#10B981]/20'
            : 'border-[#D4A373]/60 text-[#FFE8C2] shadow-[#8C6239]/20'
        }`}
        style={{
          backgroundImage: isUrgentFilter
            ? `linear-gradient(rgba(20, 45, 25, 0.8), rgba(12, 30, 18, 0.92)), url(${woodTexture})`
            : `linear-gradient(rgba(45, 26, 16, 0.75), rgba(30, 16, 9, 0.88)), url(${woodTexture})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {isUrgentFilter ? (
          <ShieldCheck className="w-8 h-8 stroke-[2.3] text-[#34D399]" />
        ) : (
          <Archive className="w-8 h-8 stroke-[2.2] text-[#FFDF80]" />
        )}
      </div>
      
      <h3 className="text-xl font-extrabold text-[#261C14] mb-2 tracking-tight">
        {isUrgentFilter
          ? 'Semua Masa Aktif Aman!'
          : compartmentName
          ? `Kompartemen ${compartmentName} Masih Kosong`
          : 'Brankas Kayu Masih Kosong'}
      </h3>
      
      <p className="text-xs sm:text-sm text-[#4A3525] max-w-md mb-6 leading-relaxed">
        {isUrgentFilter
          ? 'Tidak ada nomor kartu, dokumen, atau tagihan yang mendekati jatuh tempo atau kedaluwarsa saat ini.'
          : compartmentName
          ? `Belum ada item yang tersimpan pada kategori ${compartmentName}. Klik tombol di bawah untuk menambahkannya.`
          : 'Belum ada item atau tautan yang disimpan di dalam brankas. Mulai simpan kartu, dokumen, tagihan, atau kredensial rahasia Anda sekarang.'}
      </p>

      {isUrgentFilter ? (
        <button
          type="button"
          onClick={onResetFilter}
          className="min-h-[44px] inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-[#FAF8F5] overflow-hidden border border-[#D4A373]/80 shadow-md shadow-[#8C6239]/25 hover:shadow-xl hover:shadow-[#8C6239]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer touch-manipulation"
          style={{
            backgroundImage: `linear-gradient(rgba(55, 30, 16, 0.72), rgba(35, 18, 9, 0.85)), url(${btnWood})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <LayoutGrid className="w-4 h-4 stroke-[2.5] text-[#FFE8C2]" />
          <span>Tampilkan Semua Kompartemen</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onOpenAddModal}
          className="min-h-[44px] inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-[#FAF8F5] overflow-hidden border border-[#D4A373]/80 shadow-md shadow-[#8C6239]/25 hover:shadow-xl hover:shadow-[#8C6239]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer touch-manipulation"
          style={{
            backgroundImage: `linear-gradient(rgba(55, 30, 16, 0.72), rgba(35, 18, 9, 0.85)), url(${btnWood})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <Plus className="w-4 h-4 stroke-[2.5] text-[#FFE8C2]" />
          <span>Tambah ke Kompartemen</span>
        </button>
      )}
    </div>
  );
}
