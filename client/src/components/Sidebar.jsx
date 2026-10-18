import React from 'react';
import { Archive, LogIn, LogOut, User, ShieldCheck, Sparkles } from 'lucide-react';

export default function Sidebar({
  user,
  onNavigateLogin,
  onLogout,
  isOpenMobile,
  onCloseMobile,
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-[#261C14]/40 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-[100dvh] w-64 bg-[#FDFBF7] border-r border-[#EBE3D5] flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top: Brand Header with Wood Accent */}
        <div>
          <div className="p-5 border-b border-[#EFE8DE] bg-gradient-to-b from-[#F7F2EA] to-[#FDFBF7]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8C6239] to-[#5E3F21] text-[#FAF8F5] flex items-center justify-center shadow-sm shadow-[#8C6239]/25 border border-[#B48248]/40">
                <Archive className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-[#261C14] block leading-none">
                  Vaultra
                </span>
                <span className="text-[11px] font-medium text-[#9E8C7C] tracking-wide uppercase">
                  Personal Vault
                </span>
              </div>
            </div>
            {/* Subtle wood grain divider strip */}
            <div className="mt-3.5 h-[2px] w-full bg-gradient-to-r from-[#8C6239] via-[#D4A373] to-transparent rounded-full opacity-60" />
          </div>

          {/* Empty Sidebar Body (Sesuai instruksi: "menambahkan side bar tapi kosong") */}
          <div className="p-6 flex flex-col items-center justify-center text-center py-16">
            <div className="w-12 h-12 rounded-2xl bg-[#F5EFEB]/60 border border-[#E5DACB]/50 flex items-center justify-center text-[#B48248]/50 mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-[#9E8C7C] tracking-wide">
              Ruang Hening
            </p>
            <p className="text-[11px] text-[#B8A89A] mt-1 max-w-[150px]">
              Koleksi & tautan tersimpan aman di layar utama.
            </p>
          </div>
        </div>

        {/* Bottom Section: Login Button / User Profile with Wood Hover Effect */}
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
            /* Guest State: Login Button with Wood Hover Styling */
            <button
              type="button"
              onClick={onNavigateLogin}
              className="group relative w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-[#FAF8F5] bg-gradient-to-r from-[#8C6239] via-[#7B5430] to-[#694524] hover:from-[#7B5430] hover:to-[#5E3F21] border border-[#B48248]/50 shadow-sm shadow-[#8C6239]/25 hover:shadow-md hover:shadow-[#8C6239]/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 cursor-pointer overflow-hidden"
            >
              {/* Wood Grain Shimmer Effect on Hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
              
              <LogIn className="w-4 h-4 stroke-[2.2] group-hover:translate-x-0.5 transition-transform duration-200" />
              <span className="tracking-wide">Masuk ke Akun</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
