import React, { useState, useEffect, useCallback } from 'react';
import {
  LogIn,
  LogOut,
  ShieldCheck,
  Shield,
  User,
  Users,
  Crown,
  RefreshCw,
  X,
  LayoutGrid,
  Calendar,
  Receipt,
  Download,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';
import VaultraLogo from './VaultraLogo';
import { getWoodPlank } from '../utils/woodTextures';
import * as api from '../services/api';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Beranda Brankas', icon: LayoutGrid },
  { id: 'calendar', label: 'Kalender & Linimasa', icon: Calendar },
  { id: 'security', label: 'Diagnostik Keamanan', icon: ShieldCheck },
  { id: 'bills', label: 'Intelijen Tagihan', icon: Receipt },
  { id: 'backup', label: 'Studio Cadangan', icon: Download },
  { id: 'emergency', label: 'Protokol Darurat SOS', icon: AlertOctagon },
];

export default function Sidebar({
  user,
  currentView = 'dashboard',
  onNavigateView,
  onNavigateLogin,
  onLogout,
  isOpenMobile,
  onCloseMobile,
}) {
  const headerWood = getWoodPlank(1);
  const buttonWood = getWoodPlank(2);

  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userError, setUserError] = useState(null);

  // Fetch registered users list
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      setUserError(null);
      const res = await api.getUsers();
      if (Array.isArray(res)) {
        // Guaranteed Admin-First Sort
        const sorted = [...res].sort((a, b) => {
          if (a.role === 'admin' && b.role !== 'admin') return -1;
          if (a.role !== 'admin' && b.role === 'admin') return 1;
          return (a.name || a.username).localeCompare(b.name || b.username);
        });
        setUsersList(sorted);
      } else {
        setUsersList([]);
      }
    } catch (err) {
      console.error('Error fetching users for sidebar:', err);
      setUserError('Gagal memuat daftar user');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, user]);

  const handleNavClick = (viewId) => {
    if (onNavigateView) {
      onNavigateView(viewId);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-[#261C14]/60 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-[100dvh] w-72 bg-[#FBF5EB] border-r border-[#E5DACB] flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Section: Header & Navigation */}
        <div className="flex flex-col min-h-0 flex-1">
          {/* Brand Header with Wood Plank Panel */}
          <div
            className="p-4 sm:p-5 border-b border-[#3D271D]/50 relative overflow-hidden shadow-sm shrink-0"
            style={{
              backgroundImage: `linear-gradient(rgba(38, 22, 13, 0.76), rgba(46, 27, 14, 0.88)), url(${headerWood})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <VaultraLogo variant="icon" size={38} className="drop-shadow-md" />
                <div>
                  <span className="text-lg font-extrabold tracking-tight text-[#FAF8F5] block leading-none drop-shadow-sm font-sans">
                    Vaultra
                  </span>
                  <span className="text-[10px] font-bold text-[#E5DACB] tracking-widest uppercase block mt-1 font-mono">
                    Woodcraft Vault
                  </span>
                </div>
              </div>

              {/* Explicit Mobile Close Button */}
              <button
                type="button"
                onClick={onCloseMobile}
                className="min-w-[44px] min-h-[44px] md:hidden p-2 rounded-xl text-[#FAF8F5] hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Tutup navigasi"
              >
                <X className="w-5 h-5 stroke-[2.2]" />
              </button>
            </div>

            {/* Brass Inlay Line */}
            <div className="mt-3.5 h-[1.5px] w-full bg-gradient-to-r from-[#D4A373] via-[#FFE3B3] to-transparent rounded-full opacity-80" />
          </div>

          {/* Navigation Menu Section */}
          <div className="px-3 pt-3.5 pb-2 shrink-0 border-b border-[#EBE3D5]">
            <span className="text-[10px] font-bold text-[#8C6239] uppercase tracking-wider px-2 block mb-1.5">
              Menu Brankas
            </span>
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const IconComp = item.icon;
                const isActive = currentView === item.id;
                const isEmergency = item.id === 'emergency';

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors duration-100 cursor-pointer ${
                      isActive
                        ? isEmergency
                          ? 'bg-[#3A0D0D] text-rose-200 border border-rose-500 shadow-xs'
                          : 'bg-[#2E1A0F] text-[#FFE3B3] border border-[#D49132] shadow-xs'
                        : isEmergency
                        ? 'text-rose-700 hover:bg-rose-50 border border-transparent'
                        : 'text-[#664C35] hover:bg-[#F2E5D5] hover:text-[#261C14] border border-transparent'
                    }`}
                  >
                    <IconComp
                      className={`w-4 h-4 ${
                        isActive
                          ? isEmergency
                            ? 'text-rose-400'
                            : 'text-[#FFDF80]'
                          : isEmergency
                          ? 'text-rose-600'
                          : 'text-[#8C6239]'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Section: Daftar User Header */}
          <div className="px-4 pt-3 pb-1.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#8C6239]" />
              <h3 className="text-xs font-bold text-[#3D271D] uppercase tracking-wider">
                Daftar Pengguna
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#E8DACB] text-[#543820] font-mono">
                {usersList.length}
              </span>
              <button
                type="button"
                onClick={fetchUsers}
                className="min-w-[40px] min-h-[40px] p-2 rounded-xl text-[#8C6239] hover:text-[#543820] hover:bg-[#EAE0D2] flex items-center justify-center transition-colors cursor-pointer touch-manipulation"
                title="Perbarui daftar pengguna"
                aria-label="Refresh daftar pengguna"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Section: Daftar User Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-3.5 py-1 space-y-2 min-h-0">
            {loadingUsers && usersList.length === 0 ? (
              <div className="space-y-2 py-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 rounded-xl bg-[#EFE4D6]/70 animate-pulse border border-[#E5DACB]/50"
                  />
                ))}
              </div>
            ) : userError ? (
              <div className="p-3 rounded-xl bg-[#FDF0ED] border border-[#F5C2B8] text-center my-2">
                <p className="text-xs text-[#9E3624] font-medium mb-1.5">{userError}</p>
                <button
                  type="button"
                  onClick={fetchUsers}
                  className="text-[11px] font-bold text-[#8C6239] underline hover:text-[#5C3B14] cursor-pointer"
                >
                  Coba lagi
                </button>
              </div>
            ) : usersList.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#8A7563] my-4">
                Belum ada data pengguna terdaftar.
              </div>
            ) : (
              usersList.map((u) => {
                const isAdmin = u.role === 'admin';

                if (isAdmin) {
                  return (
                    <div
                      key={u.id}
                      className="p-2.5 rounded-xl border border-[#B48248] shadow-xs relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, #2D1A0E 0%, #1A0F08 100%)',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="relative shrink-0">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFCC00] to-[#B48248] p-[1px]">
                            <div className="w-full h-full rounded-[6px] bg-[#1E1109] flex items-center justify-center font-black text-[11px] text-[#FFD15C] uppercase">
                              {u.username ? u.username.slice(0, 2) : 'AD'}
                            </div>
                          </div>
                          <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#FFCC00] text-[#1E1109] flex items-center justify-center shadow-xs">
                            <Crown className="w-2 h-2 stroke-[2.5]" />
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="text-xs font-black text-[#FAF8F5] truncate block">
                              {u.name || u.username}
                            </span>
                            <span className="shrink-0 px-1.5 py-0.2 text-[9px] font-black uppercase rounded bg-[#FFCC00] text-[#1E1109]">
                              Admin
                            </span>
                          </div>
                          <span className="text-[10px] text-[#D7C4B0] font-mono truncate block">
                            @{u.username}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={u.id}
                    className="p-2 rounded-xl bg-[#FAF5EE] hover:bg-[#F5ECE0] border border-[#E5DACB] transition-colors duration-100 flex items-center gap-2"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#E2D2C0] text-[#543820] flex items-center justify-center font-bold text-[10px] uppercase shrink-0 border border-[#D5C2AD]">
                      {u.username ? u.username.slice(0, 2) : 'US'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-[#261C14] truncate block">
                          {u.name || u.username}
                        </span>
                        <span className="shrink-0 px-1 py-0.2 text-[8.5px] font-semibold uppercase rounded bg-[#EAE0D2] text-[#6B4F36]">
                          User
                        </span>
                      </div>
                      <span className="text-[9.5px] text-[#4A3525] font-mono truncate block">
                        @{u.username}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bottom Section: Active User Session / Login Button */}
        <div className="p-3.5 border-t border-[#E5DACB] bg-[#F5EADB] touch-manipulation shrink-0">
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF4ED] border border-[#DEC8B0] shadow-xs">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs uppercase text-white shadow-xs ${
                    user.role === 'admin' ? 'bg-[#8C6239]' : 'bg-[#6D543F]'
                  }`}
                >
                  {user.username ? user.username.slice(0, 2) : 'US'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-[#261C14] truncate block">
                      {user.name || user.username}
                    </span>
                    {user.role === 'admin' ? (
                      <Crown className="w-3 h-3 text-[#B48248] shrink-0" />
                    ) : (
                      <ShieldCheck className="w-3 h-3 text-[#8C6239] shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-[#4A3525] font-mono truncate block">
                    @{user.username}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#4A3525] hover:text-[#261C14] bg-[#FFFFFF] hover:bg-[#F5EFEB] border border-[#E5DACB] hover:border-[#D4A373] transition-colors duration-100 cursor-pointer shadow-xs active:scale-[0.98] touch-manipulation"
              >
                <LogOut className="w-3.5 h-3.5 text-[#8C6239]" />
                <span>Keluar Akun</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onNavigateLogin}
              className="group relative w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#FAF8F5] overflow-hidden border border-[#D4A373]/70 shadow-md shadow-[#8C6239]/30 hover:shadow-lg transition-colors duration-100 cursor-pointer touch-manipulation"
              style={{
                backgroundImage: `linear-gradient(rgba(50, 28, 16, 0.72), rgba(35, 18, 9, 0.85)), url(${buttonWood})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <LogIn className="w-4 h-4 stroke-[2.4] text-[#FFE3B3]" />
              <span className="tracking-wide drop-shadow-sm">Masuk ke Akun</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
