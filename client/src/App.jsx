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
import { Globe, Lock } from 'lucide-react';
import { getWoodPlank } from './utils/woodTextures';
import woodPlank4 from './assets/wood-plank-4.jpg';
import woodPlank1 from './assets/wood-plank-1.jpg';

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
    <div className="min-h-[100dvh] flex text-[#261C14] relative overflow-x-hidden">
      {/* 1. Wood Plank 4 Background for Main Dashboard (Kayu Cerah: wood-plank-4.jpg) */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url(${woodPlank4})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(5px) brightness(1.04)',
          transform: 'scale(1.03)',
        }}
      />
      {/* Soft Light Overlay to keep dashboard luminous, crisp & readable */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[#FAF7F2]/75" />

      {/* 2. Left Sidebar (Semi-transparent floating over the blurred wood) */}
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

      {/* 3. Main Workspace Layout */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen relative z-10">
        {/* Top Navbar */}
        <Navbar
          onOpenAddModal={handleOpenAddModal}
          onToggleSidebar={() => setIsSidebarMobileOpen((prev) => !prev)}
          totalItems={items.length}
        />

        {/* Content Area */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Kontainer Kayu Memanjang: Judul 'Tautan' di Kiri, Filter di Kanan */}
          <div 
            className="w-full rounded-2xl px-5 sm:px-6 py-3.5 mb-6 shadow-md border border-[#4A2E1B]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 relative overflow-hidden"
            style={{
              backgroundImage: `linear-gradient(rgba(36, 20, 12, 0.72), rgba(46, 26, 14, 0.85)), url(${woodPlank1})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Subtle Brass Inlay Border */}
            <div className="absolute inset-0 border border-[#D4A373]/35 rounded-2xl pointer-events-none" />

            {/* Sebelah Kiri: Judul Tautan Minimalis */}
            <div className="flex items-center gap-2.5 relative z-10">
              <div className="w-2 h-2 rounded-full bg-[#FFDF80] shadow-[0_0_6px_rgba(255,223,128,0.8)]" />
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-[#FAF8F5] drop-shadow-sm">
                Tautan
              </h1>
            </div>

            {/* Sebelah Kanan: Filter Tabs Terintegrasi Bergaya Kayu & Kuningan */}
            <div className="inline-flex items-center p-1 rounded-xl bg-[#1C1008]/80 border border-[#B48248]/40 text-xs font-semibold self-start sm:self-auto relative z-10 shadow-inner">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-[#E5B57A] text-[#24140B] font-bold shadow-sm'
                    : 'text-[#D7C4B0] hover:text-[#FAF8F5]'
                }`}
              >
                Semua ({items.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('public')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterType === 'public'
                    ? 'bg-[#7CB364] text-[#14260D] font-bold shadow-sm'
                    : 'text-[#D7C4B0] hover:text-[#FAF8F5]'
                }`}
              >
                <Globe className="w-3 h-3" />
                <span>Publik ({items.filter((i) => !i.isPrivate).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterType('private')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterType === 'private'
                    ? 'bg-[#FFCC00] text-[#26160D] font-bold shadow-sm'
                    : 'text-[#D7C4B0] hover:text-[#FAF8F5]'
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

        {/* Footer / Bottom Bar - Lebih Kuning Hangat seperti Kayu & Teks Bersih */}
        <footer className="border-t border-[#E5DACB] bg-[#FBF5EB]/95 py-6 text-center text-xs text-[#8C7460] mt-auto relative shadow-inner">
          {/* Subtle Top Wood Accent Strip on Bottom Bar */}
          <div 
            className="absolute top-0 left-0 right-0 h-0.5 opacity-70"
            style={{
              backgroundImage: `url(${woodPlank1})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="max-w-6xl mx-auto px-4">
            <p className="font-semibold text-[#664C35] tracking-wide">
              Vaultra &mdash; Smart Personal Link &amp; Asset Vault
            </p>
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



