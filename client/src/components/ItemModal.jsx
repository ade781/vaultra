import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Globe, Lock, Share2 } from 'lucide-react';
import VaultraLogo from './VaultraLogo';
import * as api from '../services/api';

export default function ItemModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  currentUser = null,
}) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [creator, setCreator] = useState('');
  const [sourceEmail, setSourceEmail] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [sharedWith, setSharedWith] = useState('');
  const [usersList, setUsersList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inputRef = useRef(null);

  // Fetch available users from backend once when modal opens
  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      api.getUsers()
        .then((users) => {
          if (isMounted && Array.isArray(users)) {
            setUsersList(users);
          }
        })
        .catch(() => {
          if (isMounted) setUsersList([]);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || '');
        setUrl(initialData.url || '');
        setCreator(
          initialData.creator === 'Anonim'
            ? currentUser?.name || currentUser?.username || ''
            : initialData.creator || ''
        );
        setSourceEmail(initialData.sourceEmail || '');
        setIsPrivate(Boolean(initialData.isPrivate));
        setSharedWith(initialData.sharedWith || '');
      } else {
        setTitle('');
        setUrl('');
        // When logged in, creator is pre-filled automatically
        setCreator(currentUser ? currentUser.name || currentUser.username : '');
        setSourceEmail('');
        setIsPrivate(false);
        setSharedWith('');
      }
      setError('');
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialData, currentUser]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isEditing = Boolean(initialData && initialData.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Judul link wajib diisi');
      return;
    }
    if (!url.trim()) {
      setError('Alamat link wajib diisi');
      return;
    }

    // Validation for guest user
    const resolvedCreator = currentUser
      ? currentUser.name || currentUser.username
      : creator.trim();
    if (!currentUser && (!resolvedCreator || resolvedCreator.toLowerCase() === 'anonim')) {
      setError('Nama pembuat wajib diisi karena Anda belum login');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(
        {
          title: title.trim(),
          url: url.trim(),
          creator: resolvedCreator,
          sourceEmail: sourceEmail.trim() || null,
          isPrivate: Boolean(isPrivate),
          sharedWith: isPrivate && sharedWith.trim() ? sharedWith.trim() : null,
        },
        initialData?.id
      );
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan tautan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#140B06]/65 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-[#FFFFFF] border border-[#E5DACB] shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with Vaultra Logo & Brass Inlay */}
        <div
          className="relative px-6 py-4 sm:py-5 border-b border-[#3D271D]/60 flex items-center justify-between overflow-hidden shadow-sm"
          style={{
            background: 'linear-gradient(135deg, #2D1A0E 0%, #3D2314 50%, #201107 100%)',
          }}
        >
          {/* Top Brass Hairline Inlay */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFE3B3]/60 to-transparent pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10">
            {/* Official Vaultra Logo */}
            <VaultraLogo variant="icon" size={36} className="drop-shadow-md" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-[#FAF8F5] drop-shadow-xs">
                  {isEditing ? 'Perbarui Tautan Brankas' : 'Tambah Tautan ke Brankas'}
                </h2>
                <span className="text-[10px] font-mono font-bold bg-[#FFCC00]/20 text-[#FFE3B3] px-2 py-0.5 rounded-full border border-[#FFCC00]/30 hidden sm:inline-block">
                  Vaultra
                </span>
              </div>
              <span className="text-[11px] font-medium text-[#D4A373] block mt-0.5">
                {isEditing ? 'Ubah informasi atau hak akses tautan' : 'Simpan link dengan perlindungan privasi'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#E5DACB] hover:text-white hover:bg-white/10 transition-colors cursor-pointer relative z-10"
            aria-label="Tutup form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body - Zero lag / instant INP inputs */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}

          {/* 1. Judul Link */}
          <div>
            <label className="block text-xs font-bold text-[#261C14] mb-1.5 uppercase tracking-wider">
              Judul Link <span className="text-rose-500">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: netflix overlay atau Dokumen Proyek"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DACB] text-[#261C14] text-sm placeholder-[#9E8C7C] focus:outline-none focus:ring-2 focus:ring-[#8C6239]/25 focus:border-[#8C6239] transition-colors duration-100"
            />
          </div>

          {/* 2. Link URL */}
          <div>
            <label className="block text-xs font-bold text-[#261C14] mb-1.5 uppercase tracking-wider">
              Link URL <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DACB] text-[#261C14] text-sm placeholder-[#9E8C7C] focus:outline-none focus:ring-2 focus:ring-[#8C6239]/25 focus:border-[#8C6239] transition-colors duration-100 font-mono text-xs sm:text-sm"
            />
          </div>

          {/* 3. Baris Pembuat & Asal Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              {currentUser ? (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#261C14] uppercase tracking-wider">
                      Pembuat
                    </label>
                    <span className="text-[10px] font-bold text-[#4A6B3D] bg-[#F0F6EE] px-1.5 py-0.5 rounded border border-[#4A6B3D]/30">
                      Otomatis
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={currentUser.name || currentUser.username}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5EEDB] border border-[#D8C7B4] text-[#261C14] text-sm font-semibold cursor-not-allowed select-none"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#786858] text-[11px] font-mono">
                      @{currentUser.username}
                    </div>
                  </div>
                  <span className="text-[10px] text-[#786858] mt-1 block">
                    Nama akun Anda terhubung otomatis ke tautan ini.
                  </span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#261C14] uppercase tracking-wider">
                      Pembuat <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      Wajib (Tamu)
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={creator}
                    onChange={(e) => setCreator(e.target.value)}
                    placeholder="Nama Anda (Wajib diisi)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DACB] text-[#261C14] text-sm placeholder-[#9E8C7C] focus:outline-none focus:ring-2 focus:ring-[#8C6239]/25 focus:border-[#8C6239] transition-colors duration-100"
                  />
                  <span className="text-[10px] text-[#8C6239] mt-1 block">
                    Wajib mengisi nama pembuat karena Anda belum masuk.
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#261C14] mb-1.5 uppercase tracking-wider">
                Asal Email
              </label>
              <input
                type="email"
                value={sourceEmail}
                onChange={(e) => setSourceEmail(e.target.value)}
                placeholder="email (Opsional)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DACB] text-[#261C14] text-sm placeholder-[#9E8C7C] focus:outline-none focus:ring-2 focus:ring-[#8C6239]/25 focus:border-[#8C6239] transition-colors duration-100"
              />
            </div>
          </div>

          {/* 4. Fitur Publik / Private */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-[#261C14] mb-2 uppercase tracking-wider">
              Status Privasi Link
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Pilihan Publik */}
              <button
                type="button"
                onClick={() => {
                  setIsPrivate(false);
                  setSharedWith('');
                }}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                  !isPrivate
                    ? 'bg-[#F0F6EE] border-[#4A6B3D] text-[#2A4520] ring-1 ring-[#4A6B3D]/30'
                    : 'bg-[#FAF8F5] border-[#E5DACB] text-[#786858] hover:border-[#B48248]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    !isPrivate
                      ? 'bg-[#4A6B3D] text-white'
                      : 'bg-[#FFFFFF] border border-[#E5DACB] text-[#9E8C7C]'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block">Publik</span>
                  <span className="text-[10px] text-[#786858] block leading-tight">
                    Terbuka untuk umum
                  </span>
                </div>
              </button>

              {/* Pilihan Private */}
              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                  isPrivate
                    ? 'bg-[#FBF0E4] border-[#8C6239] text-[#5E3F21] ring-1 ring-[#8C6239]/30'
                    : 'bg-[#FAF8F5] border-[#E5DACB] text-[#786858] hover:border-[#B48248]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isPrivate
                      ? 'bg-[#8C6239] text-white'
                      : 'bg-[#FFFFFF] border border-[#E5DACB] text-[#9E8C7C]'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block">Private</span>
                  <span className="text-[10px] text-[#786858] block leading-tight">
                    Akses terbatas
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* 5. Dropdown Berbagi ke User Tertentu (Jika Private Aktif) */}
          {isPrivate && (
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5DACB] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8C6239]">
                <Share2 className="w-3.5 h-3.5" />
                <span>Bagikan Akses Private ke User:</span>
              </div>
              <div className="relative">
                <select
                  value={sharedWith}
                  onChange={(e) => setSharedWith(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E5DACB] text-[#261C14] text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8C6239]/30 focus:border-[#8C6239] transition-colors cursor-pointer"
                >
                  <option value="">(Hanya saya / Simpan pribadi)</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.username}>
                      {u.name ? `${u.name} (@${u.username})` : `@${u.username}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#F5EFEB]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#786858] hover:text-[#261C14] hover:bg-[#F5EFEB] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#FAF8F5] border border-[#B48248]/50 shadow-sm transition-opacity cursor-pointer disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #4A2E1B 0%, #2E1B0E 100%)',
              }}
            >
              {loading ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{isEditing ? 'Simpan Perubahan' : 'Simpan Tautan'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
