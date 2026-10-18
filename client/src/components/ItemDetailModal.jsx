import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  Trash2, 
  Edit3,
  User, 
  Clock, 
  Mail, 
  Link as LinkIcon,
  AlertTriangle
} from 'lucide-react';

function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
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
  }, [item, isOpen]);

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
    } catch (err) {
      alert(err.message || 'Gagal menghapus link');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-[#261C14]/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl rounded-3xl bg-[#FFFFFF] border border-[#EFE8DE] shadow-2xl overflow-hidden transition-all my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#F5EFEB] bg-[#FAF8F5]">
          <span className="text-xs sm:text-sm font-bold text-[#8C6239] uppercase tracking-wider">
            Detail Link & Barcode
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#9E8C7C] hover:text-[#261C14] hover:bg-[#EFEAE1] transition-colors cursor-pointer"
            aria-label="Tutup pop-up"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body - Ekstra Besar & Lapang */}
        <div className="p-8 sm:p-10 space-y-8">
          
          {/* Card Atas: Kiri (Judul & Info) + Kanan (Barcode Ekstra Besar 180px) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 p-8 rounded-3xl bg-[#FAF8F5] border border-[#EFE8DE]">
            
            {/* Sebelah Kiri */}
            <div className="flex-1 min-w-0 pr-0 md:pr-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#261C14] leading-snug mb-5 break-words">
                {item.title}
              </h2>

              <div className="space-y-3 text-sm sm:text-base text-[#786858]">
                {/* Waktu Dibuat */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FFFFFF] border border-[#E5DACB] flex items-center justify-center text-[#8C6239] shrink-0">
                    <Clock className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-xs text-[#9E8C7C] block">Waktu Dibuat</span>
                    <time dateTime={item.createdAt} className="font-semibold text-[#261C14]">
                      {formatDate(item.createdAt)}
                    </time>
                  </div>
                </div>

                {/* Pembuat */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FFFFFF] border border-[#E5DACB] flex items-center justify-center text-[#8C6239] shrink-0">
                    <User className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs text-[#9E8C7C] block">Pembuat</span>
                    <span className="font-semibold text-[#261C14] truncate block">
                      {item.creator || 'Anonim'}
                    </span>
                  </div>
                </div>

                {/* Asal Email */}
                {item.sourceEmail && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#FFFFFF] border border-[#E5DACB] flex items-center justify-center text-[#8C6239] shrink-0">
                      <Mail className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 font-mono">
                      <span className="text-xs text-[#9E8C7C] font-sans block">Asal Email</span>
                      <span className="font-semibold text-[#261C14] truncate block text-xs sm:text-sm">
                        {item.sourceEmail}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sebelah Kanan: Barcode / QR Code Ekstra Besar (180px) */}
            <div 
              className="shrink-0 self-center md:self-auto flex flex-col items-center p-5 rounded-3xl bg-[#FFFFFF] border border-[#E5DACB] shadow-md shadow-[#8C6239]/5"
              title="Arahkan kamera ponsel Anda untuk scan link"
            >
              <QRCodeSVG 
                value={item.url || 'https://vaultra.app'} 
                size={175}
                bgColor="transparent"
                fgColor="#261C14"
                level="M"
              />
              <span className="text-xs text-[#8C6239] font-mono mt-3 font-semibold uppercase tracking-wider">
                Scan Barcode
              </span>
            </div>

          </div>

          {/* Di Bawah Kedua Itu: Alamat Link URL */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#786858] uppercase tracking-wider mb-2.5">
              Alamat Link (Klik tautan di bawah untuk membuka)
            </label>
            <div className="flex items-center gap-3.5 p-5 rounded-2xl bg-[#FAF8F5] border border-[#EFE8DE] font-mono text-sm sm:text-base text-[#261C14] break-all">
              <LinkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#8C6239] shrink-0" />
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline text-[#8C6239] font-medium leading-relaxed"
                title="Buka link di tab baru"
              >
                {item.url}
              </a>
            </div>
          </div>

          {/* Delete Confirmation Box */}
          {confirmDelete && (
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex flex-col gap-3">
              <div className="flex items-center gap-3 font-semibold text-base">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>Yakin ingin menghapus link ini dari Vaultra?</span>
              </div>
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
                >
                  {deleting ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions: Hapus di kiri, Edit di kanan */}
        <div className="flex items-center justify-between gap-4 p-6 px-8 sm:px-10 border-t border-[#F5EFEB] bg-[#FAF8F5]">
          <div>
            {!confirmDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4.5 h-4.5" />
                <span>Hapus Link</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm sm:text-base font-semibold text-white bg-[#8C6239] hover:bg-[#734F2C] active:bg-[#5E3F21] shadow-sm shadow-[#8C6239]/20 transition-colors cursor-pointer"
            >
              <Edit3 className="w-4.5 h-4.5" />
              <span>Edit Link</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
