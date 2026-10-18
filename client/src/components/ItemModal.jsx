import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Link as LinkIcon, 
  FileText, 
  Folder, 
  Plus, 
  Tag as TagIcon,
  Check,
  AlertCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { detectDriveType, getDriveTypeMeta } from '../utils/driveHelper';

export default function ItemModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  categories = [],
  availableTags = [],
  onOpenCategoryModal
}) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inputRef = useRef(null);

  // Initialize or reset form state
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setUrl(initialData.url || '');
      setDescription(initialData.description || '');
      setCategoryId(initialData.categoryId ? String(initialData.categoryId) : '');
      
      const currentTags = (initialData.tags || []).map((t) => (t.tag ? t.tag.name : t.name || t));
      setTags(currentTags);
    } else {
      setTitle('');
      setUrl('');
      setDescription('');
      setCategoryId('');
      setTags([]);
    }
    setTagInput('');
    setError('');
    setLoading(false);

    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [initialData, isOpen]);

  // Handle ESC key press
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

  // Realtime Drive Type preview
  const detectedType = detectDriveType(url);
  const detectedMeta = getDriveTypeMeta(detectedType);
  const DetectedIcon = detectedMeta.icon;

  // Add tag handler
  const handleAddTag = (newTag) => {
    const trimmed = (newTag || tagInput).trim().toLowerCase().replace(/^#/, '');
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Judul link wajib diisi');
      return;
    }
    if (!url.trim()) {
      setError('URL link Google Drive wajib diisi');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        title: title.trim(),
        url: url.trim(),
        description: description.trim() || null,
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        tagNames: tags,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {initialData ? 'Edit Link Vaultra' : 'Simpan Link Baru'}
              </h3>
              <p className="text-xs text-slate-400">
                {initialData ? 'Perbarui detail informasi link' : 'Tambahkan link Google Drive atau berkas ke vault'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Input URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              URL Google Drive / Web Link <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/... atau https://docs.google.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all font-mono"
              />
            </div>

            {/* Instant Detection Preview */}
            {url.trim() && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="text-slate-400">Terdeteksi:</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium border ${detectedMeta.badgeClass}`}>
                  <DetectedIcon className="w-3.5 h-3.5" />
                  {detectedMeta.label}
                </span>
              </div>
            )}
          </div>

          {/* Input Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Judul Link <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Dokumen SOP Perusahaan 2026, Template Budget, dsb."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Kategori
              </label>
              {onOpenCategoryModal && (
                <button
                  type="button"
                  onClick={onOpenCategoryModal}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Buat Kategori Baru
                </button>
              )}
            </div>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
            >
              <option value="">-- Tanpa Kategori --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Deskripsi / Catatan (Opsional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tambahkan catatan khusus, informasi akses, atau isi penting berkas..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          {/* Tags Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tags / Label (Tekan Enter untuk menambah)
            </label>
            
            {/* Tag Chips */}
            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-950 border border-slate-800 min-h-[42px] focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:border-indigo-500">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-400 p-0.5 rounded transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => handleAddTag()}
                placeholder={tags.length === 0 ? "Ketik tag lalu tekan Enter..." : "Tambah tag..."}
                className="flex-1 min-w-[120px] bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none px-1 py-0.5"
              />
            </div>

            {/* Quick suggested existing tags */}
            {availableTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 mt-2">
                <span className="text-[11px] text-slate-500">Saran:</span>
                {availableTags
                  .filter((t) => !tags.includes(t.name))
                  .slice(0, 6)
                  .map((t) => (
                    <button
                      key={t.id || t.name}
                      type="button"
                      onClick={() => handleAddTag(t.name)}
                      className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-400 hover:text-indigo-300 hover:bg-slate-700 transition-colors"
                    >
                      +{t.name}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-50"
            >
              {loading ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{initialData ? 'Perbarui Link' : 'Simpan Link'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
