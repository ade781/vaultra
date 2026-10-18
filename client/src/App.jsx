import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, 
  Folder, 
  FileSpreadsheet, 
  FileText, 
  Sparkles, 
  RefreshCw, 
  Filter, 
  X,
  LayoutGrid,
  List,
  Layers,
  AlertCircle
} from 'lucide-react';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ItemCard from './components/ItemCard';
import ItemModal from './components/ItemModal';
import CategoryModal from './components/CategoryModal';
import DeleteModal from './components/DeleteModal';
import EmptyState from './components/EmptyState';
import Toast from './components/Toast';

import * as api from './services/api';
import { getDriveTypeMeta } from './utils/driveHelper';

export default function App() {
  // Main Data States
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeDriveType, setActiveDriveType] = useState(null);
  const [activeTagId, setActiveTagId] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // UI / Modal States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Show Toast Helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Fetch Items
  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getItems({
        search: debouncedSearch,
        categoryId: activeCategoryId,
        driveType: activeDriveType,
        tagId: activeTagId,
      });
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(err.message || 'Gagal memuat daftar link dari server.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, activeCategoryId, activeDriveType, activeTagId]);

  // Fetch Categories & Tags
  const loadTaxonomies = useCallback(async () => {
    try {
      const [cats, tgs] = await Promise.allSettled([
        api.getCategories(),
        api.getTags(),
      ]);

      if (cats.status === 'fulfilled' && Array.isArray(cats.value)) {
        setCategories(cats.value);
      }
      if (tgs.status === 'fulfilled' && Array.isArray(tgs.value)) {
        setTags(tgs.value);
      }
    } catch (err) {
      console.error('Error loading categories/tags:', err);
    }
  }, []);

  // Initial Load & On Filter Change
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    loadTaxonomies();
  }, [loadTaxonomies]);

  // Item Modal Handlers
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsItemModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  const handleSubmitItem = async (formData) => {
    if (editingItem) {
      await api.updateItem(editingItem.id, formData);
      showToast('Link berhasil diperbarui!');
    } else {
      await api.createItem(formData);
      showToast('Link baru berhasil disimpan ke vault!');
    }
    await Promise.all([loadItems(), loadTaxonomies()]);
  };

  // Delete Item Handlers
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setActionLoading(true);
      await api.deleteItem(itemToDelete.id);
      showToast('Link berhasil dihapus dari vault.');
      setItemToDelete(null);
      await Promise.all([loadItems(), loadTaxonomies()]);
    } catch (err) {
      showToast(err.message || 'Gagal menghapus link', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Category Management Handlers
  const handleCreateCategory = async (catData) => {
    await api.createCategory(catData);
    showToast('Kategori baru berhasil dibuat!');
    await Promise.all([loadCategories(), loadItems()]);
  };

  const handleUpdateCategory = async (id, catData) => {
    await api.updateCategory(id, catData);
    showToast('Kategori berhasil diperbarui!');
    await Promise.all([loadCategories(), loadItems()]);
  };

  const handleDeleteCategory = async (id) => {
    await api.deleteCategory(id);
    if (activeCategoryId === id) {
      setActiveCategoryId(null);
    }
    showToast('Kategori berhasil dihapus!');
    await Promise.all([loadCategories(), loadItems()]);
  };

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      if (Array.isArray(data)) setCategories(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Quick reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setActiveCategoryId(null);
    setActiveDriveType(null);
    setActiveTagId(null);
  };

  // Tag click filter
  const handleSelectTagFromCard = (tag) => {
    if (tag?.id) {
      setActiveTagId(tag.id === activeTagId ? null : tag.id);
    }
  };

  // Active filter summary info
  const activeCategoryObj = useMemo(() => {
    return categories.find((c) => c.id === activeCategoryId);
  }, [categories, activeCategoryId]);

  const activeTagObj = useMemo(() => {
    return tags.find((t) => t.id === activeTagId);
  }, [tags, activeTagId]);

  const activeDriveMeta = useMemo(() => {
    return activeDriveType ? getDriveTypeMeta(activeDriveType) : null;
  }, [activeDriveType]);

  const isAnyFilterActive = Boolean(
    debouncedSearch || activeCategoryId || activeDriveType || activeTagId
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Top Navigation Bar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddNew={handleOpenAddModal}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        totalItems={items.length}
      />

      {/* Main Container: Sidebar + Content */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex">
        
        {/* Left Sidebar */}
        <Sidebar
          categories={categories}
          tags={tags}
          activeCategoryId={activeCategoryId}
          onSelectCategory={setActiveCategoryId}
          activeDriveType={activeDriveType}
          onSelectDriveType={setActiveDriveType}
          activeTagId={activeTagId}
          onSelectTag={setActiveTagId}
          onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
          totalItems={items.length}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Center Main Content Area */}
        <main className="flex-1 py-6 lg:pl-8 min-w-0">
          
          {/* Active Filter Badges Bar */}
          {isAnyFilterActive && (
            <div className="mb-6 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Filter Aktif:</span>
                
                {debouncedSearch && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                    Pencarian: "{debouncedSearch}"
                    <button onClick={() => setSearchQuery('')} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {activeCategoryObj && (
                  <span 
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium"
                    style={{
                      backgroundColor: `${activeCategoryObj.color || '#6366f1'}15`,
                      color: activeCategoryObj.color || '#6366f1',
                      borderColor: `${activeCategoryObj.color || '#6366f1'}30`,
                    }}
                  >
                    Kategori: {activeCategoryObj.name}
                    <button onClick={() => setActiveCategoryId(null)} className="hover:opacity-75">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {activeDriveMeta && (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium ${activeDriveMeta.badgeClass}`}>
                    Tipe: {activeDriveMeta.label}
                    <button onClick={() => setActiveDriveType(null)} className="hover:opacity-75">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {activeTagObj && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-medium">
                    #{activeTagObj.name}
                    <button onClick={() => setActiveTagId(null)} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              <button
                onClick={handleResetFilters}
                className="text-xs font-medium text-slate-400 hover:text-indigo-400 hover:underline transition-colors shrink-0"
              >
                Hapus Semua Filter
              </button>
            </div>
          )}

          {/* Section Heading & View Switcher */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
                <span>
                  {activeCategoryObj 
                    ? activeCategoryObj.name 
                    : activeDriveMeta 
                    ? activeDriveMeta.label 
                    : activeTagObj 
                    ? `#${activeTagObj.name}` 
                    : 'Semua Berkas & Tautan'}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60 font-mono">
                  {items.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Akses cepat dokumen, spreadsheet, slide, dan folder Google Drive
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadItems()}
                title="Segarkan data"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
              </button>

              <div className="flex items-center p-0.5 rounded-xl bg-slate-900 border border-slate-800">
                <button
                  onClick={() => setViewMode('grid')}
                  title="Tampilan Grid"
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-slate-800 text-indigo-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  title="Tampilan List"
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-slate-800 text-indigo-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Error Banner with Retry */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start justify-between gap-3 text-sm">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
                <div>
                  <p className="font-semibold">Terjadi Kendala Koneksi</p>
                  <p className="text-xs text-rose-400/90 mt-0.5">{error}</p>
                </div>
              </div>
              <button
                onClick={() => loadItems()}
                className="px-3 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold shrink-0 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Loading Skeletons */}
          {loading ? (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="rounded-2xl bg-slate-900/50 border border-slate-800/80 p-5 space-y-4 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="w-24 h-6 rounded-lg bg-slate-800" />
                    <div className="w-12 h-6 rounded-lg bg-slate-800" />
                  </div>
                  <div className="w-3/4 h-5 rounded-lg bg-slate-800" />
                  <div className="w-full h-3 rounded bg-slate-800" />
                  <div className="w-2/3 h-3 rounded bg-slate-800" />
                  <div className="pt-4 border-t border-slate-800/60 flex gap-2">
                    <div className="flex-1 h-8 rounded-xl bg-slate-800" />
                    <div className="flex-1 h-8 rounded-xl bg-slate-800" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            /* Empty State */
            <EmptyState
              searchQuery={debouncedSearch}
              activeCategory={activeCategoryId}
              activeTag={activeTagId}
              activeDriveType={activeDriveType}
              onResetFilters={handleResetFilters}
              onAddNew={handleOpenAddModal}
            />
          ) : (
            /* Items Grid or List */
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onEdit={handleOpenEditModal}
                  onDelete={(candidate) => setItemToDelete(candidate)}
                  onSelectTag={handleSelectTagFromCard}
                  onCopySuccess={(title) => showToast(`Link "${title}" disalin ke clipboard!`)}
                />
              ))}
            </div>
          )}

        </main>
      </div>

      {/* Modals & Overlays */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleSubmitItem}
        initialData={editingItem}
        categories={categories}
        availableTags={tags}
        onOpenCategoryModal={() => {
          setIsItemModalOpen(false);
          setIsCategoryModalOpen(true);
        }}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onCreateCategory={handleCreateCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <DeleteModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.title}
        loading={actionLoading}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

    </div>
  );
}
