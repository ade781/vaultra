import React, { useState, useEffect, useRef } from 'react';
import { X, Check, AlertCircle, PlusCircle, Edit3 } from 'lucide-react';

export default function ItemModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null
}) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [creator, setCreator] = useState('');
  const [sourceEmail, setSourceEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || '');
        setUrl(initialData.url || '');
        setCreator(initialData.creator === 'Anonim' ? '' : initialData.creator || '');
        setSourceEmail(initialData.sourceEmail || '');
      } else {
        setTitle('');
        setUrl('');
        setCreator('');
        setSourceEmail('');
      }
      setError('');
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, initialData]);

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

    try {
      setLoading(true);
      await onSubmit({
        title: title.trim(),
        url: url.trim(),
        creator: creator.trim() || 'Anonim',
        sourceEmail: sourceEmail.trim() || null,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#261C14]/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md rounded-2xl bg-[#FFFFFF] border border-[#EFE8DE] shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5EFEB] bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFFFFF] border border-[#E5DACB] flex items-center justify-center text-[#8C6239]">
              {isEditing ? (
                <Edit3 className="w-4 h-4 stroke-[2.2]" />
              ) : (
                <PlusCircle className="w-4 h-4 stroke-[2.2]" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-[#261C14]">
                {isEditing ? 'Edit Link' : 'Tambah Link Baru'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9E8C7C] hover:text-[#261C14] hover:bg-[#EFEAE1] transition-colors"
            aria-label="Tutup form"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Judul */}
          <div>
            <label className="block text-xs font-semibold text-[#261C14] mb-1.5">
              Judul Link <span className="text-rose-500">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Dokumen Rencana Kerja 2026"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#EFE8DE] text-[#261C14] text-sm placeholder-[#9E8C7C] focus:outline-none focus:ring-2 focus:ring-[#8C6239]/25 focus:border-[#8C6239] transition-all"
            />
          </div>

          {/* 2. Link / URL */}
          <div>
            <label className="block text-xs font-semibold text-[#261C14] mb-1.5">
              Link URL <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://drive.google.com/... atau https://..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#EFE8DE] text-[#261C14] text-sm placeholder-[#9E8C7C] focus:outline-none focus:ring-2 focus:ring-[#8C6239]/25 focus:border-[#8C6239] font-mono transition-all"
            />
          </div>

          {/* 3. Pembuat & 4. Asal Email (Grid 2 Kolom) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#261C14] mb-1.5">
                Pembuat
              </label>
              <input
                type="text"
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                placeholder="Contoh: Budi (Opsional)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#EFE8DE] text-[#261C14] text-sm placeholder-[#9E8C7C] focus:outline-none focus:ring-2 focus:ring-[#8C6239]/25 focus:border-[#8C6239] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#261C14] mb-1.5">
                Asal Email
              </label>
              <input
                type="text"
                value={sourceEmail}
                onChange={(e) => setSourceEmail(e.target.value)}
                placeholder="akun@gmail.com (Opsional)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#EFE8DE] text-[#261C14] text-sm placeholder-[#9E8C7C] focus:outline-none focus:ring-2 focus:ring-[#8C6239]/25 focus:border-[#8C6239] transition-all"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#F5EFEB]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#786858] hover:text-[#261C14] hover:bg-[#F5EFEB] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#8C6239] hover:bg-[#734F2C] active:bg-[#5E3F21] shadow-sm shadow-[#8C6239]/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{isEditing ? 'Simpan Perubahan' : 'Simpan Link'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
