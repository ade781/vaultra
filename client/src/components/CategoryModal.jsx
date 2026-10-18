import React, { useState } from 'react';
import { 
  X, 
  FolderPlus, 
  Trash2, 
  Edit2, 
  Check, 
  Folder, 
  Briefcase, 
  BookOpen, 
  Code, 
  FileBox, 
  Star, 
  AlertCircle 
} from 'lucide-react';

const COLOR_PALETTE = [
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#0ea5e9', // Sky
  '#10b981', // Emerald
  '#14b8a6', // Teal
  '#f59e0b', // Amber
  '#f97316', // Orange
  '#ef4444', // Red
  '#ec4899', // Pink
  '#8b5cf6', // Violet
];

export default function CategoryModal({
  isOpen,
  onClose,
  categories = [],
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory
}) {
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLOR_PALETTE[0]);
  const [icon, setIcon] = useState('Folder');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleStartEdit = (cat) => {
    setEditingId(cat.id);
    setName(cat.name);
    setColor(cat.color || COLOR_PALETTE[0]);
    setIcon(cat.icon || 'Folder');
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setColor(COLOR_PALETTE[0]);
    setIcon('Folder');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Nama kategori tidak boleh kosong');
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        await onUpdateCategory(editingId, { name: name.trim(), color, icon });
        handleCancelEdit();
      } else {
        await onCreateCategory({ name: name.trim(), color, icon });
        setName('');
      }
    } catch (err) {
      setError(err.message || 'Gagal menyimpan kategori');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, catName) => {
    if (window.confirm(`Yakin ingin menghapus kategori "${catName}"? Link di dalamnya tidak akan terhapus, hanya kategori yang dilepas.`)) {
      try {
        setLoading(true);
        await onDeleteCategory(id);
        if (editingId === id) handleCancelEdit();
      } catch (err) {
        setError(err.message || 'Gagal menghapus kategori');
      } finally {
        setLoading(false);
      }
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
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Kelola Kategori
              </h3>
              <p className="text-xs text-slate-400">
                Atur pengelompokan folder dan berkas Anda
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Create/Edit */}
          <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">
                {editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </span>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Batal Edit
                </button>
              )}
            </div>

            <div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Pekerjaan, Kuliah, Arsip Pribadi..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Color Swatches */}
            <div>
              <span className="block text-[11px] font-medium text-slate-400 mb-2">
                Pilih Warna Kategori:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-6 h-6 rounded-full transition-transform flex items-center justify-center"
                    style={{ backgroundColor: c }}
                  >
                    {color === c && (
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{editingId ? 'Simpan Perubahan' : 'Tambah Kategori'}</span>
              </button>
            </div>
          </form>

          {/* Existing Categories List */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Daftar Kategori Saat Ini ({categories.length})
            </h4>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const count = cat._count?.items ?? 0;
                const catColor = cat.color || '#6366f1';

                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: catColor }}
                      />
                      <span className="text-sm font-medium text-slate-200 truncate">
                        {cat.name}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">
                        {count} item
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {categories.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-500 rounded-xl bg-slate-950/20 border border-slate-800">
                  Belum ada kategori. Buat kategori pertama menggunakan formulir di atas!
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
