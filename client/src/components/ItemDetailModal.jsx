import React, { useEffect, useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Trash2, 
  User, 
  Clock, 
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
  onDelete,
  onCopySuccess
}) {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setCopied(false);
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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(true);
      if (onCopySuccess) onCopySuccess('Link berhasil disalin ke clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = item.url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      if (onCopySuccess) onCopySuccess('Link berhasil disalin');
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#261C14]/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg rounded-2xl bg-[#FFFFFF] border border-[#EFE8DE] shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Pop-up */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-[#F5EFEB]">
          <div className="pr-4">
            <span className="text-[11px] font-semibold text-[#8C6239] uppercase tracking-wider mb-1 block">
              Detail Link Tersimpan
            </span>
            <h2 className="text-lg font-bold text-[#261C14] leading-snug">
              {item.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9E8C7C] hover:text-[#261C14] hover:bg-[#F5EFEB] transition-colors shrink-0"
            aria-label="Tutup pop-up"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          
          {/* Metadata: Pembuat & Waktu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EFE8DE]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FFFFFF] border border-[#E5DACB] flex items-center justify-center text-[#8C6239] shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] text-[#9E8C7C]">Pembuat</span>
                <span className="text-xs font-semibold text-[#261C14] truncate block">
                  {item.creator || 'Anonim'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FFFFFF] border border-[#E5DACB] flex items-center justify-center text-[#8C6239] shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] text-[#9E8C7C]">Waktu Dibuat</span>
                <span className="text-xs font-semibold text-[#261C14] block">
                  {formatDate(item.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Link URL Display */}
          <div>
            <label className="block text-xs font-semibold text-[#786858] mb-1.5">
              Alamat Link
            </label>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FAF8F5] border border-[#EFE8DE] font-mono text-xs text-[#261C14] break-all">
              <LinkIcon className="w-4 h-4 text-[#8C6239] shrink-0" />
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline text-[#8C6239] line-clamp-2"
              >
                {item.url}
              </a>
            </div>
          </div>

          {/* Delete Confirmation Box */}
          {confirmDelete && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col gap-3">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Yakin ingin menghapus link ini dari Vaultra?</span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50"
                >
                  {deleting ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 px-6 border-t border-[#F5EFEB] bg-[#FAF8F5]">
          <div>
            {!confirmDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#261C14] bg-[#FFFFFF] border border-[#E5DACB] hover:bg-[#F5EFEB] transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-[#8C6239]" /> : <Copy className="w-4 h-4 text-[#786858]" />}
              <span>{copied ? 'Tersalin' : 'Salin Link'}</span>
            </button>

            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#8C6239] hover:bg-[#734F2C] active:bg-[#5E3F21] shadow-xs transition-colors"
            >
              <span>Buka Link</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
