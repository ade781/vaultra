import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoginPage from './components/LoginPage';
import ItemCard from './components/ItemCard';
import ItemModal from './components/ItemModal';
import ItemDetailModal from './components/ItemDetailModal';
import EmptyState from './components/EmptyState';
import Toast from './components/Toast';
import * as api from './services/api';
import { Shield, Sparkles, Filter, Globe, Lock, Archive } from 'lucide-react';
import { getWoodPlank } from './utils/woodTextures';

export default function App() {
  // Navigation View: 'dashboard' | 'login'
  const [currentView, setCurrentView] = useState('dashboard');

  // Auth State
  const [currentUser, setCurrentUser] = useState(null);

  // Data & Loading States
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter: 'all' | 'public' | 'private'
  const [filterType, setFilterType] = useState('all');

  // Sidebar Mobile State
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItemForPopup, setSelectedItemForPopup] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // 1. Check Initial Auth
  useEffect(() => {
    const savedUser = api.getCurrentUser();
    if (savedUser) {
      setCurrentUser(savedUser);
      // Optional verification
      api.getMe()
        .then((user) => setCurrentUser(user))
        .catch(() => {
          api.logout();
          setCurrentUser(null);
        });
    }
  }, []);

  // 2. Fetch items (Semua user, termasuk belum login, bisa melihat data publik & private)
  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getItems();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Gagal memuat link dari server. Pastikan backend server berjalan.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Auth Handlers
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
    setToastMessage(`Selamat datang kembali, ${user.name || user.username}!`);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setToastMessage('Anda telah keluar dari akun');
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal from Pop-up
  const handleStartEdit = (item) => {
    setSelectedItemForPopup(null);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // Handle Save (Add or Edit)
  const handleSaveItem = async (formData, id) => {
    try {
      if (id) {
        // Edit mode
        const updated = await api.updateItem(id, formData);
        setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
        setToastMessage('Tautan berhasil diperbarui');
      } else {
        // Add mode
        const newItem = await api.createItem(formData);
        setItems((prev) => [newItem, ...prev]);
        setToastMessage('Tautan berhasil ditambahkan ke brankas');
      }
    } catch (err) {
      throw new Error(err.message || 'Gagal menyimpan tautan');
    }
  };

  // Handle Delete Item
  const handleDeleteItem = async (id) => {
    try {
      await api.deleteItem(id);
      setItems((prev) => prev.filter((it) => it.id !== id));
      setToastMessage('Tautan berhasil dihapus');
    } catch (err) {
      throw new Error(err.message || 'Gagal menghapus tautan');
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    if (filterType === 'public') return !item.isPrivate;
    if (filterType === 'private') return item.isPrivate;
    return true;
  });

  // Render Login View if active
  if (currentView === 'login') {
    return (
      <LoginPage
        onBack={() => setCurrentView('dashboard')}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Dashboard View (Main Page with Sidebar on Left)
  return (
    <div className="min-h-[100dvh] flex bg-[#FAF8F5] text-[#261C14]">
      {/* 1. Left Sidebar (Sesuai instruksi: Sidebar tapi kosong, tombol login di bawah dengan hover) */}
      <Sidebar
        user={currentUser}
        onNavigateLogin={() => {
          setIsSidebarMobileOpen(false);
          setCurrentView('login');
        }}
        onLogout={handleLogout}
        isOpenMobile={isSidebarMobileOpen}
        onCloseMobile={() => setIsSidebarMobileOpen(false)}
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Navbar
          onOpenAddModal={handleOpenAddModal}
          onToggleSidebar={() => setIsSidebarMobileOpen((prev) => !prev)}
          totalItems={items.length}
        />

        {/* Content Area */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
          
          {/* 1. Prominent Wood Plank Showcase Banner (Aksen Kayu Nyata Utama) */}
          <div 
            className="relative rounded-3xl p-6 sm:p-7 overflow-hidden border border-[#52331B]/40 shadow-lg mb-6"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(38, 22, 13, 0.82) 0%, rgba(54, 32, 18, 0.88) 100%), url(${getWoodPlank(0)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Ambient Lighting & Inlay Border */}
            <div className="absolute inset-0 border border-[#D4A373]/30 rounded-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C1008]/75 border border-[#B48248]/50 text-[#FCEBD4] text-[11px] font-bold uppercase tracking-wider mb-2.5 shadow-sm">
                  <Archive className="w-3.5 h-3.5 text-[#FFCC00]" />
                  <span>Brankas Tautan Digital Beraksen Kayu Alami</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#FAF8F5] drop-shadow-md">
                  Koleksi Tautan Brankas
                </h1>
                <p className="text-xs sm:text-sm text-[#D7C4B0] mt-1 max-w-xl leading-relaxed">
                  Penyimpanan tautan terorganisir dengan kendali privasi publik dan privat, dibalut sentuhan hangat tekstur kayu alami.
                </p>
              </div>

              {/* Quick Counter Badges on Wooden Plaque */}
              <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
                <div className="px-4 py-2 rounded-2xl bg-[#1C1008]/85 border border-[#B48248]/40 text-center shadow-md">
                  <span className="block text-[10px] font-bold tracking-wider uppercase text-[#BFA895]">Total</span>
                  <span className="block text-base font-extrabold text-[#FAF8F5]">{items.length}</span>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-[#1C1008]/85 border border-[#7CB364]/40 text-center shadow-md">
                  <span className="block text-[10px] font-bold tracking-wider uppercase text-[#9EE37D]">Publik</span>
                  <span className="block text-base font-extrabold text-[#D7F2CB]">{items.filter((i) => !i.isPrivate).length}</span>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-[#1C1008]/85 border border-[#D4A373]/40 text-center shadow-md">
                  <span className="block text-[10px] font-bold tracking-wider uppercase text-[#FFCC00]">Private</span>
                  <span className="block text-base font-extrabold text-[#FCE3C3]">{items.filter((i) => i.isPrivate).length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Filter Bar with Wooden Button Accents */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#EBE3D5]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#786858]">
              <Filter className="w-3.5 h-3.5 text-[#8C6239]" />
              <span>Saring Tampilan Koleksi:</span>
            </div>

            {/* Filter Tabs with Wood Button Styling */}
            <div className="inline-flex items-center p-1 rounded-xl bg-[#F0EAE1] border border-[#E5DACB] text-xs font-semibold self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-[#FFFFFF] text-[#8C6239] shadow-xs'
                    : 'text-[#786858] hover:text-[#261C14]'
                }`}
              >
                Semua ({items.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('public')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterType === 'public'
                    ? 'bg-[#FFFFFF] text-[#4A6B3D] shadow-xs'
                    : 'text-[#786858] hover:text-[#261C14]'
                }`}
              >
                <Globe className="w-3 h-3" />
                <span>Publik ({items.filter((i) => !i.isPrivate).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterType('private')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterType === 'private'
                    ? 'bg-[#FFFFFF] text-[#8C6239] shadow-xs'
                    : 'text-[#786858] hover:text-[#261C14]'
                }`}
              >
                <Lock className="w-3 h-3" />
                <span>Private ({items.filter((i) => i.isPrivate).length})</span>
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={loadItems}
                className="text-xs font-semibold underline hover:text-rose-900 cursor-pointer"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div 
                  key={idx} 
                  className="h-36 rounded-2xl bg-[#FFFFFF] border border-[#EBE3D5] p-5 flex flex-col justify-between animate-pulse"
                >
                  <div className="space-y-2">
                    <div className="h-4 bg-[#F5EFEB] rounded-md w-3/4" />
                    <div className="h-3 bg-[#F5EFEB] rounded-md w-1/2" />
                  </div>
                  <div className="h-3 bg-[#F5EFEB] rounded-md w-2/3 pt-2" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredItems.length === 0 && (
            <EmptyState onOpenAddModal={handleOpenAddModal} />
          )}

          {/* Items Grid */}
          {!loading && !error && filteredItems.length > 0 && (
            <section>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onClick={(clickedItem) => setSelectedItemForPopup(clickedItem)}
                  />
                ))}
              </div>
            </section>
          )}

        </main>

        {/* Footer */}
        <footer className="border-t border-[#EBE3D5] bg-[#FFFFFF] py-6 text-center text-xs text-[#9E8C7C] mt-auto">
          <div className="max-w-6xl mx-auto px-4">
            <p className="font-medium text-[#786858]">Vaultra — Smart Personal Link & Asset Vault</p>
          </div>
        </footer>
      </div>

      {/* 3. Modal Form (Add & Edit) */}
      <ItemModal
        isOpen={isModalOpen}
        initialData={editingItem}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleSaveItem}
      />

      {/* 4. Pop-up Detail Modal / Layer 2 (Dengan Barcode, Status Privasi, dan Desain Ramping) */}
      <ItemDetailModal
        isOpen={Boolean(selectedItemForPopup)}
        item={selectedItemForPopup}
        onClose={() => setSelectedItemForPopup(null)}
        onEdit={handleStartEdit}
        onDelete={handleDeleteItem}
      />

      {/* 5. Toast Notification */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage('')}
      />
    </div>
  );
}

