import React, { useEffect, useState } from 'react';
import { X, Clock, User, Mail, Link as LinkIcon, Trash2, Edit3, AlertTriangle, Globe, Lock, Share2, Archive } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getWoodPlank } from '../utils/woodTextures';

function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '-';
  }
}

export default function ItemDetailModal({
  isOpen,
  item,
  onClose,
  onEdit,
  onDelete
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setConfirmDelete(false);
    setDeleting(false);
  }, [isOpen, item]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await onDelete(item.id);
      onClose();
    } catch {
      setDeleting(false);
    }
  };

  const isPrivate = Boolean(item.isPrivate);
  const woodTexture = getWoodPlank(item.id || item.title || 0);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#261C14]/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl rounded-3xl bg-[#FFFFFF] border border-[#E5DACB] shadow-2xl overflow-hidden my-auto transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prominent Wood Plank Modal Header Band */}
        <div 
          className="relative px-6 py-5 border-b border-[#3D271D]/50 flex items-center justify-between overflow-hidden shadow-sm"
          style={{
            backgroundImage: `linear-gradient(rgba(35, 20, 12, 0.72), rgba(48, 28, 16, 0.86)), url(${woodTexture})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="flex items-center gap-2.5 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-[#FAF8F5]/10 border border-[#D4A373]/50 flex items-center justify-center text-[#FFE8C2] shadow-xs">
              <Archive className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#E5DACB] uppercase tracking-wider block">
                Detail Tautan Brankas
              </span>
              <span className="text-[11px] font-semibold text-[#D4A373]">
                ID #{item.id} • {isPrivate ? 'Akses Privat' : 'Akses Publik'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#E5DACB] hover:text-white hover:bg-white/10 transition-colors cursor-pointer relative z-10"
            aria-label="Tutup pop-up"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          
          {/* Top Section: Metadata & Barcode Side by Side */}
          <div className="flex flex-col-reverse sm:flex-row items-start justify-between gap-6 pb-5 border-b border-[#F5EFEB]">
            
            {/* Info Kiri */}
            <div className="flex-1 min-w-0 pr-0 sm:pr-4 space-y-3">
              
              {/* Privacy Pill */}
              <div>
                {isPrivate ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FBF0E4] text-[#8C6239] border border-[#E8CDB5]">
                    <Lock className="w-3 h-3 stroke-[2.5]" />
                    <span>Private</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F0F6EE] text-[#4A6B3D] border border-[#CFE1C9]">
                    <Globe className="w-3 h-3 stroke-[2.5]" />
                    <span>Publik</span>
                  </span>
                )}
              </div>

              {/* Judul */}
              <h2 className="text-lg sm:text-xl font-bold text-[#261C14] leading-snug break-words">
                {item.title}
              </h2>

              {/* Shared With info */}
              {isPrivate && item.sharedWith && (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#FAF4ED] text-[#8C6239] text-xs font-medium border border-[#E5DACB]">
                  <Share2 className="w-3.5 h-3.5 text-[#B48248]" />
                  <span>Dibagikan ke: <strong>@{item.sharedWith}</strong></span>
                </div>
              )}

              {/* Metadata List */}
              <div className="space-y-2 pt-1 text-xs text-[#786858]">
                {/* Waktu Dibuat */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#FFFFFF] border border-[#E5DACB] flex items-center justify-center text-[#8C6239] shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[#9E8C7C]">Dibuat: </span>
                    <time dateTime={item.createdAt} className="font-semibold text-[#261C14]">
                      {formatDate(item.createdAt)}
                    </time>
                  </div>
                </div>

                {/* Pembuat */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#FFFFFF] border border-[#E5DACB] flex items-center justify-center text-[#8C6239] shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[#9E8C7C]">Pembuat: </span>
                    <span className="font-semibold text-[#261C14]">
                      {item.creator || 'Anonim'}
                    </span>
                  </div>
                </div>

                {/* Asal Email */}
                {item.sourceEmail && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#FFFFFF] border border-[#E5DACB] flex items-center justify-center text-[#8C6239] shrink-0">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <div className="font-mono text-[11px] truncate">
                      <span className="text-[#9E8C7C] font-sans">Email: </span>
                      <span className="font-semibold text-[#261C14]">
                        {item.sourceEmail}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sebelah Kanan: Barcode / QR Code dengan Frame Kayu Alami */}
            <div 
              className="shrink-0 self-center sm:self-auto flex flex-col items-center p-3.5 rounded-2xl border border-[#B48248]/50 shadow-md relative overflow-hidden"
              style={{
                backgroundImage: `linear-gradient(rgba(45, 26, 16, 0.8), rgba(30, 16, 9, 0.9)), url(${woodTexture})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              title="Arahkan kamera ponsel Anda untuk scan tautan"
            >
              <div className="p-2.5 rounded-xl bg-white shadow-inner">
                <QRCodeSVG 
                  value={item.url || 'https://vaultra.app'} 
                  size={120}
                  bgColor="#FFFFFF"
                  fgColor="#261C14"
                  level="M"
                />
              </div>
              <span className="text-[10px] text-[#FFE8C2] font-mono mt-2 font-bold uppercase tracking-wider drop-shadow-xs">
                Scan Barcode
              </span>
            </div>

          </div>

          {/* Di Bawah: Alamat Link URL */}
          <div>
            <label className="block text-xs font-bold text-[#786858] uppercase tracking-wider mb-1.5">
              Alamat Tautan
            </label>
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5DACB] font-mono text-xs sm:text-sm text-[#261C14] break-all">
              <LinkIcon className="w-4 h-4 text-[#8C6239] shrink-0" />
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline text-[#8C6239] font-medium"
                title="Buka link di tab baru"
              >
                {item.url}
              </a>
            </div>
          </div>

          {/* Delete Confirmation Box */}
          {confirmDelete && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col gap-2.5">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Yakin ingin menghapus tautan ini?</span>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
                >
                  {deleting ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions: Hapus di kiri, Edit di kanan dengan Wood Button Accent */}
        <div className="flex items-center justify-between gap-3 p-4 px-6 border-t border-[#F5EFEB] bg-[#FAF8F5]">
          <div>
            {!confirmDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#FAF8F5] overflow-hidden border border-[#D4A373]/80 shadow-sm shadow-[#8C6239]/25 hover:shadow-lg hover:shadow-[#8C6239]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              style={{
                backgroundImage: `linear-gradient(rgba(55, 30, 16, 0.72), rgba(35, 18, 9, 0.85)), url(${woodTexture})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <Edit3 className="w-4 h-4 text-[#FFE8C2]" />
              <span>Edit Tautan</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
