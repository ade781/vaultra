import React, { useState, useEffect } from 'react';
import { Plus, Menu, Shield, ShieldCheck, Download, Volume2, VolumeX } from 'lucide-react';
import VaultraLogo from './VaultraLogo';
import { getWoodPlank } from '../utils/woodTextures';
import { isSoundMuted, toggleSoundMute } from '../utils/soundHelper';

export default function Navbar({
  onOpenAddModal,
  onToggleSidebar,
  onBackup,
  totalItems = 0,
  isPrivacyMode = false,
  onTogglePrivacyMode,
}) {
  const barWood = getWoodPlank(0);
  const btnWood = getWoodPlank(3);

  const [isMuted, setIsMuted] = useState(() => isSoundMuted());

  useEffect(() => {
    const handleMuteChange = (e) => {
      if (e.detail && typeof e.detail.muted === 'boolean') {
        setIsMuted(e.detail.muted);
      } else {
        setIsMuted(isSoundMuted());
      }
    };
    window.addEventListener('vaultra:sound-mute-changed', handleMuteChange);
    return () => window.removeEventListener('vaultra:sound-mute-changed', handleMuteChange);
  }, []);

  const handleToggleSound = () => {
    const nextMuted = toggleSoundMute();
    setIsMuted(nextMuted);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FBF5EB]/95 backdrop-blur-md border-b border-[#E5DACB] relative shadow-xs">
      {/* Bottom Wood Plank Accent Strip */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 opacity-80"
        style={{
          backgroundImage: `url(${barWood})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Left: Mobile Toggle & Brand Logo with Wood Accent */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="min-w-[44px] min-h-[44px] p-2.5 -ml-2 rounded-xl text-[#786858] hover:text-[#261C14] hover:bg-[#F5EFEB] md:hidden flex items-center justify-center cursor-pointer touch-manipulation"
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

        {/* Right Section: Sound Toggle, Privacy Shield Toggle, Backup, Counter & Add Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio Soundscape Toggle Button */}
          <button
            type="button"
            onClick={handleToggleSound}
            className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-2 rounded-xl text-xs font-bold bg-[#FAF4ED] text-[#7A583B] border border-[#DEC8B0] hover:bg-[#F2E5D5] transition-colors duration-100 cursor-pointer shadow-xs touch-manipulation"
            title={
              isMuted
                ? 'Efek Suara Dinonaktifkan (Klik untuk aktifkan)'
                : 'Efek Suara Aktif (Klik untuk bisukan)'
            }
            aria-label={isMuted ? 'Aktifkan efek suara' : 'Bisukan efek suara'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-[#8C6239]" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#8C6239]" />
            )}
          </button>

          {/* Privacy Shield Toggle Button */}
          {onTogglePrivacyMode && (
            <button
              type="button"
              onClick={onTogglePrivacyMode}
              className={`min-w-[44px] min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors duration-100 cursor-pointer shadow-xs touch-manipulation ${
                isPrivacyMode
                  ? 'bg-[#2E1A0F] text-[#FFDF80] border-[#D49132] ring-1 ring-[#FFDF80]/40'
                  : 'bg-[#FAF4ED] text-[#7A583B] border-[#DEC8B0] hover:bg-[#F2E5D5]'
              }`}
              title={
                isPrivacyMode
                  ? 'Privacy Shield Aktif (Klik untuk membuka sensor)'
                  : 'Aktifkan Privacy Shield (Sensor nomor kartu & data rahasia)'
              }
            >
              {isPrivacyMode ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FFDF80] stroke-[2.5]" />
                  <span className="hidden xs:inline">Shield ON</span>
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5 text-[#8C6239]" />
                  <span className="hidden xs:inline">Privacy Shield</span>
                </>
              )}
            </button>
          )}

          {/* Backup Button */}
          {onBackup && (
            <button
              type="button"
              onClick={onBackup}
              className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#FAF4ED] text-[#7A583B] border border-[#DEC8B0] hover:bg-[#F2E5D5] transition-colors duration-100 cursor-pointer shadow-xs touch-manipulation"
              title="Cadangkan Brankas (Backup JSON)"
              aria-label="Cadangkan Brankas ke file JSON"
            >
              <Download className="w-3.5 h-3.5 text-[#8C6239]" />
              <span className="hidden md:inline">Cadangkan</span>
            </button>
          )}

          {/* Item Counter */}
          <div className="hidden md:flex items-center px-3 py-1.5 rounded-xl bg-[#F4E8D7] border border-[#DEC8B0] text-xs font-semibold text-[#664C35]">
            <span className="text-[#8C6239] font-bold mr-1">{totalItems}</span> Kompartemen
          </div>

          {/* Add Item Button */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 sm:px-4.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#FAF8F5] overflow-hidden border border-[#D4A373]/80 shadow-sm shadow-[#8C6239]/25 hover:shadow-md hover:shadow-[#8C6239]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer touch-manipulation"
            style={{
              backgroundImage: `linear-gradient(rgba(55, 30, 16, 0.72), rgba(35, 18, 9, 0.85)), url(${btnWood})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <Plus className="w-4 h-4 stroke-[2.5] text-[#FFE8C2]" />
            <span className="drop-shadow-xs whitespace-nowrap">Tambah Item</span>
          </button>
        </div>
      </div>
    </header>
  );
}
