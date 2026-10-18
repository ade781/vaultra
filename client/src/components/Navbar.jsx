import React from 'react';
import { Plus, Menu } from 'lucide-react';
import VaultraLogo from './VaultraLogo';
import { getWoodPlank } from '../utils/woodTextures';

export default function Navbar({ onOpenAddModal, onToggleSidebar, totalItems = 0 }) {
  const barWood = getWoodPlank(0);
    const btnWood = getWoodPlank(3);

  return (
    <header className="sticky top-0 z-30 bg-[#FBF5EB]/95 backdrop-blur-md border-b border-[#E5DACB] transition-all relative shadow-xs">
      {/* Bottom Wood Plank Accent Strip */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1 opacity-80" 
        style={{ 
          backgroundImage: `url(${barWood})`, 
          backgroundSize: "cover", 
          backgroundPosition: "center" 
        }} 
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Left: Mobile Toggle & Brand Logo with Wood Accent */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 -ml-2 rounded-xl text-[#786858] hover:text-[#261C14] hover:bg-[#F5EFEB] md:hidden cursor-pointer"
            aria-label="Buka menu navigasi"
          >
            <Menu className="w-5 h-5 stroke-[2.2]" />
          </button>

          <div className="flex items-center gap-2.5">
            <VaultraLogo variant="icon" size={38} className="drop-shadow-xs" />
            <div className="hidden sm:block">
              <span className="text-base font-extrabold tracking-tight text-[#261C14] block leading-tight">
                Vaultra
              </span>
              <span className="text-[10px] font-bold text-[#8C6239] tracking-wider uppercase block">
                Woodcraft Vault
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Counter & Add Button with Prominent Wood Plank Styling */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex items-center px-3 py-1 rounded-xl bg-[#F4E8D7] border border-[#DEC8B0] text-xs font-semibold text-[#664C35]">
            <span className="text-[#8C6239] font-bold mr-1">{totalItems}</span> Tautan
          </div>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#FAF8F5] overflow-hidden border border-[#D4A373]/80 shadow-sm shadow-[#8C6239]/25 hover:shadow-md hover:shadow-[#8C6239]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            style={{ 
              backgroundImage: `linear-gradient(rgba(55, 30, 16, 0.72), rgba(35, 18, 9, 0.85)), url(${btnWood})`, 
              backgroundSize: "cover", 
              backgroundPosition: "center" 
            }}
          >
            <Plus className="w-4 h-4 stroke-[2.5] text-[#FFE8C2]" />
            <span className="drop-shadow-xs">Tambah Tautan</span>
          </button>
        </div>

      </div>
    </header>
  );
}
