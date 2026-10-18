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
} from 'lucide-react';
import VaultraLogo from './VaultraLogo';
import { getWoodPlank } from '../utils/woodTextures';
import * as api from '../services/api';

export default function Sidebar({
  user,
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
        className={`fixed md:sticky top-0 left-0 z-40 h-[100dvh] w-68 bg-[#FBF5EB]/95 backdrop-blur-md border-r border-[#E5DACB] flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Section: Header & Daftar User */}
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
            <div className="flex items-center gap-3 relative z-10">
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

            {/* Brass Inlay Line */}
            <div className="mt-3.5 h-[1.5px] w-full bg-gradient-to-r from-[#D4A373] via-[#FFE3B3] to-transparent rounded-full opacity-80" />
          </div>

          {/* Section: Daftar User Header */}
          <div className="px-4 pt-4 pb-2 flex items-center justify-between shrink-0">
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
                className="p-1 rounded-md text-[#8C6239] hover:bg-[#EAE0D2] transition-colors cursor-pointer"
                title="Perbarui daftar pengguna"
                aria-label="Refresh daftar pengguna"
              >
                <RefreshCw className={`w-3 h-3 ${loadingUsers ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Section: Daftar User Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-3.5 py-1 space-y-2.5 min-h-0">
            {loadingUsers && usersList.length === 0 ? (
              /* Skeletal Loading State */
              <div className="space-y-2 py-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-14 rounded-xl bg-[#EFE4D6]/70 animate-pulse border border-[#E5DACB]/50"
                  />
                ))}
              </div>
            ) : userError ? (
              /* Error State */
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
              /* Empty State */
              <div className="p-4 text-center text-xs text-[#8A7563] my-4">
                Belum ada data pengguna terdaftar.
              </div>
            ) : (
              /* Render Users: Admin First with Prominent "ADMIN" designation */
              usersList.map((u) => {
                const isAdmin = u.role === 'admin';

                if (isAdmin) {
                  return (
                    /* 1. KHUSUS ADMIN: Ditampilkan paling atas dengan styling mewah & badge 'ADMIN' */
                    <div
                      key={u.id}
                      className="p-3 rounded-xl border border-[#B48248] shadow-sm relative overflow-hidden transition-all duration-150 hover:shadow-md"
                      style={{
                        background:
                          'linear-gradient(135deg, #2D1A0E 0%, #1A0F08 100%)',
                      }}
                    >
                      {/* Top Brass Accent Line */}
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D4A373] via-[#FFE3B3] to-[#D4A373]" />

                      <div className="flex items-center gap-2.5">
                        {/* Admin Avatar with Crown */}
                        <div className="relative shrink-0">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FFCC00] to-[#B48248] p-[1.5px] shadow-xs">
                            <div className="w-full h-full rounded-[6px] bg-[#1E1109] flex items-center justify-center font-black text-xs text-[#FFD15C] uppercase">
                              {u.username ? u.username.slice(0, 2) : 'AD'}
                            </div>
                          </div>
                          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#FFCC00] text-[#1E1109] flex items-center justify-center shadow-xs">
                            <Crown className="w-2.5 h-2.5 stroke-[2.5]" />
                          </div>
                        </div>

                        {/* Admin Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="text-xs font-black text-[#FAF8F5] truncate block tracking-wide">
                              {u.name || u.username}
                            </span>
                            {/* TULISAN ADMIN WAJIB & TEGAS */}
                            <span className="shrink-0 px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider rounded-md bg-[#FFCC00] text-[#1E1109] border border-[#FFE885] shadow-xs">
                              Admin
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[10.5px] text-[#D7C4B0] font-mono truncate block">
                              @{u.username}
                            </span>
                            {u.isInitial && (
                              <span className="text-[9px] text-[#E5B57A] font-semibold italic">
                                (Seed)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                /* 2. REGULAR USER: Tampil rapi di bawah Admin */
                return (
                  <div
                    key={u.id}
                    className="p-2.5 rounded-xl bg-[#FAF5EE] hover:bg-[#F5ECE0] border border-[#E5DACB] transition-colors duration-150 flex items-center gap-2.5"
                  >
                    {/* User Avatar Initial */}
                    <div className="w-8 h-8 rounded-lg bg-[#E2D2C0] text-[#543820] flex items-center justify-center font-bold text-xs uppercase shrink-0 border border-[#D5C2AD]">
                      {u.username ? u.username.slice(0, 2) : 'US'}
                    </div>

                    {/* User Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-[#261C14] truncate block">
                          {u.name || u.username}
                        </span>
                        <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded bg-[#EAE0D2] text-[#6B4F36]">
                          User
                        </span>
                      </div>
                      <span className="text-[10px] text-[#786858] font-mono truncate block mt-0.5">
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
            /* Logged In State */
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#FAF4ED] border border-[#DEC8B0] shadow-xs">
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
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-[#786858] font-mono truncate block">
                      @{user.username}
                    </span>
                    <span
                      className={`text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded ${
                        user.role === 'admin'
                          ? 'bg-[#8C6239] text-[#FAF8F5]'
                          : 'bg-[#DEC8B0] text-[#543820]'
                      }`}
                    >
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="group relative w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#786858] hover:text-[#5E3F21] bg-[#FFFFFF] hover:bg-[#F5EFEB] border border-[#E5DACB] hover:border-[#D4A373] transition-all duration-150 cursor-pointer shadow-xs active:scale-[0.98] touch-manipulation"
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
              className="group relative w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold text-[#FAF8F5] overflow-hidden border border-[#D4A373]/70 shadow-md shadow-[#8C6239]/30 hover:shadow-xl hover:shadow-[#8C6239]/50 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-150 cursor-pointer touch-manipulation will-change-transform"
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
