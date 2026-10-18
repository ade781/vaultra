import React from 'react';
import { Archive, LogIn, LogOut, ShieldCheck, FolderLock } from 'lucide-react';
import { getWoodPlank } from '../utils/woodTextures';

export default function Sidebar({
  user,
  onNavigateLogin,
  onLogout,
  isOpenMobile,
  onCloseMobile,
}) {
  const headerWood = getWoodPlank(1);
  const buttonWood = getWoodPlank(2);
  const badgeWood = getWoodPlank(6);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-[#261C14]/50 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-[100dvh] w-64 bg-[#FDFBF7]/90 backdrop-blur-md border-r border-[#EBE3D5] flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top: Brand Header with Wood Plank Panel */}
        <div>
          <div 
            className="p-5 border-b border-[#3D271D]/50 relative overflow-hidden shadow-sm"
            style={{
              backgroundImage: `linear-gradient(rgba(38, 22, 13, 0.72), rgba(46, 27, 14, 0.85)), url(${headerWood})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8C6239] to-[#3D271D] text-[#FAF8F5] flex items-center justify-center shadow-md shadow-black/40 border border-[#B48248]/70">
                <Archive className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-[#FAF8F5] block leading-none drop-shadow-sm">
                  Vaultra
                </span>
                <span className="text-[11px] font-semibold text-[#E5DACB] tracking-wide uppercase block mt-1">
                  Woodcraft Vault
                </span>
              </div>
            </div>
            
            {/* Brass Inlay Line */}
            <div className="mt-3.5 h-[2px] w-full bg-gradient-to-r from-[#D4A373] via-[#FFE3B3] to-transparent rounded-full opacity-90" />
          </div>

          {/* Sidebar Body with Crafted Wooden Accent Badge */}
          <div className="p-4 space-y-4">
            <div 
              className="p-3.5 rounded-2xl border border-[#B48248]/40 shadow-xs relative overflow-hidden"
              style={{
                backgroundImage: `linear-gradient(rgba(45, 26, 16, 0.82), rgba(30, 16, 9, 0.9)), url(${badgeWood})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="flex items-center gap-2 text-[#FFE3B3] text-xs font-bold mb-1">
                <FolderLock className="w-3.5 h-3.5 text-[#FFCC00]" />
                <span>Brankas Kayu Alami</span>
              </div>
              <p className="text-[11px] text-[#E0D0BE] leading-relaxed">
                Tersinkronisasi otomatis dengan database MySQL & perlindungan akses privat.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section: Login Button / User Profile */}
        <div className="p-4 border-t border-[#EFE8DE] bg-[#FAF8F5]">
          {user ? (
            /* Logged In State */
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E5DACB] shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-[#8C6239] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                  {user.username ? user.username.slice(0, 2) : 'US'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-[#261C14] truncate block">
                      {user.name || user.username}
                    </span>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#8C6239] shrink-0" />
                  </div>
                  <span className="text-[11px] text-[#786858] font-mono truncate block">
                    @{user.username}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="group relative w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#786858] hover:text-[#5E3F21] bg-[#FFFFFF] hover:bg-[#F5EFEB] border border-[#E5DACB] hover:border-[#D4A373] transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <LogOut className="w-3.5 h-3.5 text-[#8C6239] group-hover:-translate-x-0.5 transition-transform" />
                <span>Keluar Akun</span>
              </button>
            </div>
          ) : (
            /* Guest State: Prominent Wooden Plank Login Button */
            <button
              type="button"
              onClick={onNavigateLogin}
              className="group relative w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-[#FAF8F5] overflow-hidden border border-[#D4A373]/70 shadow-md shadow-[#8C6239]/30 hover:shadow-xl hover:shadow-[#8C6239]/50 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 cursor-pointer"
              style={{
                backgroundImage: `linear-gradient(rgba(50, 28, 16, 0.72), rgba(35, 18, 9, 0.85)), url(${buttonWood})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Shimmer Effect on Hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
              
              <LogIn className="w-4 h-4 stroke-[2.4] group-hover:translate-x-0.5 transition-transform duration-200 text-[#FFE3B3]" />
              <span className="tracking-wide drop-shadow-sm">Masuk ke Akun</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}


