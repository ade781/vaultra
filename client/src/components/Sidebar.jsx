import React from 'react';
import { 
  FolderArchive, 
  Folder, 
  FileText, 
  FileSpreadsheet, 
  Presentation, 
  Archive, 
  Layers, 
  Tags, 
  Settings, 
  Plus, 
  X,
  Sparkles,
  HardDrive
} from 'lucide-react';

const DRIVE_TYPES = [
  { id: 'ALL', label: 'Semua Tipe', icon: Layers },
  { id: 'FOLDER', label: 'Folder Drive', icon: Folder },
  { id: 'DOC', label: 'Google Docs', icon: FileText },
  { id: 'SHEET', label: 'Google Sheets', icon: FileSpreadsheet },
  { id: 'SLIDE', label: 'Google Slides', icon: Presentation },
  { id: 'ARCHIVE', label: 'Arsip / Zip', icon: Archive },
  { id: 'OTHER', label: 'Drive Lainnya', icon: HardDrive },
];

export default function Sidebar({
  categories = [],
  tags = [],
  activeCategoryId,
  onSelectCategory,
  activeDriveType,
  onSelectDriveType,
  activeTagId,
  onSelectTag,
  onOpenCategoryModal,
  totalItems = 0,
  isOpen = false,
  onClose,
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 z-40 h-[100dvh] lg:h-[calc(100vh-4rem)] w-72 bg-slate-950/95 lg:bg-transparent border-r lg:border-r border-slate-800/80 p-5 overflow-y-auto flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          
          {/* Mobile Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 lg:hidden">
            <span className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Menu & Filter
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section: Filter Tipe Berkas Drive */}
          <div>
            <div className="px-2 mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span>Tipe File Drive</span>
            </div>
            <div className="space-y-1">
              {DRIVE_TYPES.map((type) => {
                const Icon = type.icon;
                const isActive = (activeDriveType || 'ALL') === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => {
                      onSelectDriveType(type.id === 'ALL' ? null : type.id);
                      if (onClose) onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Kategori */}
          <div>
            <div className="px-2 mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span>Kategori</span>
              <button
                onClick={onOpenCategoryModal}
                className="flex items-center gap-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                title="Kelola Kategori"
              >
                <Settings className="w-3 h-3" />
                Kelola
              </button>
            </div>

            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              {/* Semua Kategori Option */}
              <button
                onClick={() => {
                  onSelectCategory(null);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  !activeCategoryId
                    ? 'bg-slate-800 text-white font-semibold border border-slate-700/60'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-slate-100'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Semua Kategori
                </span>
                <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">
                  {totalItems}
                </span>
              </button>

              {/* Dynamic Categories */}
              {categories.map((cat) => {
                const isActive = activeCategoryId === cat.id;
                const catColor = cat.color || '#6366f1';
                const itemCount = cat._count?.items ?? 0;

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onSelectCategory(cat.id);
                      if (onClose) onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-slate-800 text-white font-semibold border border-indigo-500/30'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: catColor }}
                      />
                      <span className="truncate">{cat.name}</span>
                    </span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-slate-800/80 text-slate-400 font-mono shrink-0 ml-2">
                      {itemCount}
                    </span>
                  </button>
                );
              })}

              {categories.length === 0 && (
                <div className="px-3 py-4 text-center rounded-xl bg-slate-900/50 border border-slate-800/60 text-xs text-slate-400">
                  <p className="mb-2">Belum ada kategori.</p>
                  <button
                    onClick={onOpenCategoryModal}
                    className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Buat Kategori
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section: Tags */}
          {tags.length > 0 && (
            <div>
              <div className="px-2 mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Tags className="w-3.5 h-3.5" />
                  Filter Tag
                </span>
                {activeTagId && (
                  <button
                    onClick={() => onSelectTag(null)}
                    className="text-[11px] text-slate-400 hover:text-slate-200"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                {tags.map((tag) => {
                  const isActive = activeTagId === tag.id;
                  const count = tag._count?.items;

                  return (
                    <button
                      key={tag.id}
                      onClick={() => onSelectTag(isActive ? null : tag.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-500 text-white font-semibold shadow-sm'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      <span>#{tag.name}</span>
                      {typeof count === 'number' && (
                        <span className={`text-[10px] px-1 rounded font-mono ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer Info */}
        <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500">
          <p className="flex items-center justify-between">
            <span>Vaultra v1.0</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </p>
        </div>
      </aside>
    </>
  );
}
