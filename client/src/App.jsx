import React, { useState, useEffect, useCallback, startTransition } from 'react';
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
      api.getMe()
        .then((user) => {
          setCurrentUser(user);
          if (user.isInitial && user.role === 'admin') {
            startTransition(() => {
              setCurrentView('login');
            });
          }
        })
        .catch(() => {
          api.logout();
          setCurrentUser(null);
        });
    }
  }, []);

  // 2. Fetch items
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

  // Non-blocking Concurrent View Navigators (Low INP)
  const handleNavigateLogin = () => {
    startTransition(() => {
      setCurrentView('login');
    });
  };

  const handleNavigateDashboard = () => {
    startTransition(() => {
      setCurrentView('dashboard');
    });
  };

  // Auth Handlers
  const handleLoginSuccess = (user) => {
    startTransition(() => {
      setCurrentUser(user);
      setCurrentView('dashboard');
    });
    const roleText = user.role === 'admin' ? 'Administrator' : 'Pengguna';
    setToastMessage(`Selamat datang, ${user.name || user.username} (${roleText})!`);
  };

  const handleLogout = () => {
    api.logout();
    startTransition(() => {
      setCurrentUser(null);
    });
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
        const updated = await api.updateItem(id, formData);
        setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
        setToastMessage('Tautan berhasil diperbarui');
      } else {
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
        onBack={handleNavigateDashboard}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#261C14] flex flex-col md:flex-row relative">
      
      {/* High-Performance Ambient Wood Parchment Canvas (0ms LCP / Zero GPU overhead) */}
      <div 
        className="fixed inset-0 pointer-events-none z-0" 
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, #FCFAF7 0%, #F5EFE6 55%, #ECE3D4 100%)',
        }}
      />

      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        user={currentUser}
        onNavigateLogin={handleNavigateLogin}
        onLogout={handleLogout}
        isOpenMobile={isSidebarMobileOpen}
        onCloseMobile={() => setIsSidebarMobileOpen(false)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        
        {/* Sticky Top Navbar */}
        <Navbar
          onOpenAddModal={handleOpenAddModal}
          onToggleSidebar={() => setIsSidebarMobileOpen(true)}
          totalItems={items.length}
        />

        {/* Content Body */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">

          {/* Container Batang Kayu Penuh (Ultra-Fast 0ms LCP CSS Woodcraft Plank) */}
          <div 
            className="w-full mb-6 px-5 py-3.5 rounded-2xl border border-[#B48248]/60 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #2D1A0E 0%, #3F2413 45%, #241308 100%)',
            }}
          >
            {/* Top Gloss & Brass Inlay */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFE3B3]/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#B48248]/50 to-transparent" />

            {/* Sebelah Kiri: Teks "Tautan" Sederhana & Minimalis */}
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

        {/* Footer / Bottom Bar */}
        <footer className="border-t border-[#E5DACB] bg-[#FBF5EB]/95 py-6 text-center text-xs text-[#8C7460] mt-auto relative shadow-inner">
          <div 
            className="absolute top-0 left-0 right-0 h-0.5 opacity-70"
            style={{
              background: 'linear-gradient(90deg, #B48248 0%, #FFE3B3 50%, #B48248 100%)',
            }}
          />
          <div className="max-w-6xl mx-auto px-4">
            <p className="font-semibold text-[#664C35] tracking-wide">
              Vaultra &mdash; Smart Personal Link &amp; Asset Vault
            </p>
          </div>
        </footer>
      </div>

      {/* 3. Modal Form (Add & Edit) dengan currentUser */}
      <ItemModal
        isOpen={isModalOpen}
        initialData={editingItem}
        currentUser={currentUser}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleSaveItem}
      />

      {/* 4. Pop-up Detail Modal */}
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