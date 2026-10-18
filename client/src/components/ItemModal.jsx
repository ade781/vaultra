import React, { useState, useEffect, useRef } from 'react';
import { X, Check, AlertCircle, PlusCircle, Edit3, Globe, Lock, Share2, UserCheck } from 'lucide-react';
import * as api from '../services/api';
import { getWoodPlank } from '../utils/woodTextures';

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
  const woodTexture = getWoodPlank(initialData?.id || initialData?.title || 4);

  // Fetch available users from backend
  useEffect(() => {
    if (isOpen) {
      api.getUsers()
        .then((users) => {
          if (Array.isArray(users)) {
            setUsersList(users);
          }
        })
        .catch(() => {
          setUsersList([]);
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || '');
        setUrl(initialData.url || '');
        setCreator(initialData.creator === 'Anonim' ? (currentUser?.name || currentUser?.username || '') : initialData.creator || '');
        setSourceEmail(initialData.sourceEmail || '');
        setIsPrivate(Boolean(initialData.isPrivate));
        setSharedWith(initialData.sharedWith || '');
      } else {
        setTitle('');
        setUrl('');
        // Ketika sudah login, nama otomatis terinput di pembuat
        setCreator(currentUser ? (currentUser.name || currentUser.username) : '');
        setSourceEmail('');
        setIsPrivate(false);
        setSharedWith('');
      }
      setError('');
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
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

    // Validasi: Ketika user BELUM login, dia WAJIB mengisi nama pembuat
    const resolvedCreator = currentUser ? (currentUser.name || currentUser.username) : creator.trim();
    if (!currentUser && (!resolvedCreator || resolvedCreator.toLowerCase() === 'anonim')) {
      setError('Nama pembuat wajib diisi karena Anda belum login');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        title: title.trim(),
        url: url.trim(),
        creator: resolvedCreator,
        sourceEmail: sourceEmail.trim() || null,
        isPrivate: Boolean(isPrivate),
        sharedWith: isPrivate && sharedWith.trim() ? sharedWith.trim() : null,
      }, initialData?.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan tautan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#261C14]/40 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg rounded-3xl bg-[#FFFFFF] border border-[#E5DACB] shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prominent Wood Plank Modal Header */}
        <div 
          className="relative px-6 py-5 border-b border-[#3D271D]/50 flex items-center justify-between overflow-hidden shadow-sm"
          style={{
            backgroundImage: `linear-gradient(rgba(35, 20, 12, 0.72), rgba(48, 28, 16, 0.86)), url(${woodTexture})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F5]/10 border border-[#D4A373]/50 flex items-center justify-center text-[#FFE8C2] shadow-xs">
              {isEditing ? (
                <Edit3 className="w-4.5 h-4.5 stroke-[2.2]" />
              ) : (
                <PlusCircle className="w-4.5 h-4.5 stroke-[2.2]" />
              )}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#FAF8F5] drop-shadow-xs">
                {isEditing ? 'Perbarui Tautan Brankas' : 'Tambah Tautan ke Brankas'}
              </h2>
              <span className="text-[11px] font-semibold text-[#D4A373] block mt-0.5">
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Judul */}
          <div>
            <label className="block text-xs font-semibold text-[#261C14] mb-1.5 uppercase tracking-wider">
              Judul Link <span className="text-rose-500">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul link"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DACB] text-[#261C14] text-sm placeholder-[#9E8C7C] focus:outline-none focus:ring-2 focus:ring-[#8C6239]/25 focus:border-[#8C6239] transition-all"
            />
          </div>

          {/* 2. Link / URL */}
          <div>
            <label className="block text-xs font-semibold text-[#261C14] mb-1.5 uppercase tracking-wider">
              Link URL <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DACB] text-[#261C14] text-sm placeholder-[#9E8C7C] focus:outline-none focus:ring-2 focus:ring-[#8C6239]/25 focus:border-[#8C6239] font-mono transition-all"
            />
          </div>

          {/* 3. Pembuat & 4. Asal Email (Grid 2 Kolom) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              {currentUser ? (
                /* Ketika SUDAH Login: Otomatis terinput & terkunci */
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#261C14] uppercase tracking-wider">
                      Pembuat
                    </label>
                    <span className="text-[10px] font-bold text-[#4A6B3D] bg-[#F0F6EE] px-1.5 py-0.5 rounded flex items-center gap-1 border border-[#4A6B3D]/20">
                      <UserCheck className="w-3 h-3 stroke-[2.5]" /> Otomatis
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={currentUser.name || currentUser.username}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5EEDB] border border-[#D8C7B4] text-[#261C14] text-sm font-semibold cursor-not-allowed select-none shadow-xs"
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
                /* Ketika BELUM Login: WAJIB mengisi nama pembuat */
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#261C14] uppercase tracking-wider">
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DACB] text-[#261C14] text-sm placeholder-[#9E8C7C] focus:outline-none focus:ring-2 focus:ring-[#8C6239]/25 focus:border-[#8C6239] transition-all"
                  />
                  <span className="text-[10px] text-[#8C6239] mt-1 block">
                    Wajib mengisi nama pembuat karena Anda belum masuk.
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#261C14] mb-1.5 uppercase tracking-wider">
                Asal Email
              </label>
              <input
                type="email"
                value={sourceEmail}
                onChange={(e) => setSourceEmail(e.target.value)}
                placeholder="email (Opsional)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DACB] text-[#261C14] text-sm placeholder-[#9E8C7C] focus:outline-none focus:ring-2 focus:ring-[#8C6239]/25 focus:border-[#8C6239] transition-all"
              />
            </div>
          </div>

          {/* 5. Fitur Publik / Private */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-[#261C14] mb-2 uppercase tracking-wider">
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
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  !isPrivate
                    ? 'bg-[#F0F6EE] border-[#4A6B3D] text-[#2A4520] shadow-xs ring-1 ring-[#4A6B3D]/30'
                    : 'bg-[#FAF8F5] border-[#E5DACB] text-[#786858] hover:border-[#B48248]'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  !isPrivate ? 'bg-[#4A6B3D] text-white' : 'bg-[#FFFFFF] border border-[#E5DACB] text-[#9E8C7C]'
                }`}>
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block">Publik</span>
                  <span className="text-[10px] text-[#786858] block leading-tight">Terbuka untuk umum</span>
                </div>
              </button>

              {/* Pilihan Private */}
              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isPrivate
                    ? 'bg-[#FBF0E4] border-[#8C6239] text-[#5E3F21] shadow-xs ring-1 ring-[#8C6239]/30'
                    : 'bg-[#FAF8F5] border-[#E5DACB] text-[#786858] hover:border-[#B48248]'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isPrivate ? 'bg-[#8C6239] text-white' : 'bg-[#FFFFFF] border border-[#E5DACB] text-[#9E8C7C]'
                }`}>
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block">Private</span>
                  <span className="text-[10px] text-[#786858] block leading-tight">Akses terbatas</span>
                </div>
              </button>
            </div>
          </div>

          {/* 6. Dropdown Berbagi ke User Tertentu (Jika Private Aktif) */}
          {isPrivate && (
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5DACB] space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8C6239]">
                <Share2 className="w-3.5 h-3.5" />
                <span>Bagikan Akses Private ke User:</span>
              </div>
              <div className="relative">
                <select
                  value={sharedWith}
                  onChange={(e) => setSharedWith(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E5DACB] text-[#261C14] text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8C6239]/30 focus:border-[#8C6239] transition-all cursor-pointer"
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
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#FAF8F5] border border-[#B48248]/50 shadow-sm shadow-[#8C6239]/20 hover:shadow-md hover:shadow-[#8C6239]/30 transition-all disabled:opacity-50 cursor-pointer" 
              style={{ 
                backgroundImage: `linear-gradient(rgba(74, 46, 27, 0.75), rgba(46, 27, 14, 0.85)), url(${woodTexture})`, 
                backgroundSize: "cover", 
                backgroundPosition: "center" 
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