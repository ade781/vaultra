import React, { useState, useEffect, useCallback, useMemo, startTransition } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoginPage from './components/LoginPage';
import ItemCard from './components/ItemCard';
import ItemModal from './components/ItemModal';
import ItemDetailModal from './components/ItemDetailModal';
import UrgentAlertRibbon from './components/UrgentAlertRibbon';
import EmptyState from './components/EmptyState';
import Toast from './components/Toast';

// 5 Dedicated Vaultra Pages
import CalendarPage from './components/CalendarPage';
import SecurityPage from './components/SecurityPage';
import BillsPage from './components/BillsPage';
import BackupPage from './components/BackupPage';
import EmergencyPage from './components/EmergencyPage';

import * as api from './services/api';
import { getItemUrgency } from './utils/cardHelper';
import {
  Search,
  Plus,
  Sparkles,
  Layers,
  Shield,
  X,
} from 'lucide-react';

export default function App() {
  // Navigation View: 'dashboard' | 'calendar' | 'security' | 'bills' | 'backup' | 'emergency' | 'login'
  const [currentView, setCurrentView] = useState('dashboard');

  // Auth State
  const [currentUser, setCurrentUser] = useState(null);

  // Data & Loading States
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clean Dashboard Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Privacy Shield State
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  // Sidebar Mobile State
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItemForPopup, setSelectedItemForPopup] = useState(null);

  // Toast Notification State (supports type: 'success' | 'error')
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // 1. Fetch items
  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getItems();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Gagal memuat item dari server. Pastikan backend server berjalan.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Check Initial Auth
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
    loadItems();
  }, [loadItems]);

  // 3. Listen to 401 unauthorized session expiry
  useEffect(() => {
    const handleUnauthorized = () => {
      api.logout();
      startTransition(() => {
        setCurrentUser(null);
      });
      showToast('Sesi login telah berakhir. Silakan masuk kembali.', 'error');
      loadItems();
    };

    window.addEventListener('vaultra:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('vaultra:unauthorized', handleUnauthorized);
  }, [loadItems, showToast]);

  // View Navigation
  const handleNavigateView = (view) => {
    startTransition(() => {
      setCurrentView(view);
    });
  };

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
    showToast(`Selamat datang, ${user.name || user.username} (${roleText})!`, 'success');
    loadItems();
  };

  const handleLogout = () => {
    api.logout();
    startTransition(() => {
      setCurrentUser(null);
    });
    setItems([]);
    showToast('Anda telah keluar dari akun', 'success');
    loadItems();
  };

  // Panic Lockdown Handler
  const handlePanicLockdown = () => {
    api.logout();
    startTransition(() => {
      setCurrentUser(null);
      setCurrentView('dashboard');
    });
    setItems([]);
    showToast('Mode Panic Lockdown aktif! Sesi dibersihkan seketika.', 'error');
    loadItems();
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
        showToast('Kompartemen brankas berhasil diperbarui', 'success');
        return updated;
      } else {
        const newItem = await api.createItem(formData);
        setItems((prev) => [newItem, ...prev]);
        showToast('Item berhasil ditambahkan ke brankas', 'success');
        return newItem;
      }
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan ke brankas', 'error');
      throw err;
    }
  };

  // Handle Delete Item
  const handleDeleteItem = async (id) => {
    try {
      await api.deleteItem(id);
      setItems((prev) => prev.filter((it) => it.id !== id));
      showToast('Item berhasil dihapus dari brankas', 'success');
    } catch (err) {
      showToast(err.message || 'Gagal menghapus item', 'error');
      throw err;
    }
  };

  // Handle Quick Extend in Detail Modal
  const handleItemUpdated = (updated) => {
    setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
    showToast('Masa aktif berhasil diperpanjang!', 'success');
  };

  // Handle Restore Backup
  const handleRestoreItems = async (itemsToRestore) => {
    try {
      setLoading(true);
      await api.restoreBackup(itemsToRestore);
      showToast(`Berhasil memulihkan ${itemsToRestore.length} item ke dalam brankas!`, 'success');
      await loadItems();
    } catch (err) {
      showToast(err.message || 'Gagal memulihkan cadangan', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Handle Export Backup JSON
  const handleExportBackup = async () => {
    try {
      const backup = await api.exportBackup();
      showToast(`Cadangan brankas berhasil diunduh (${backup.totalItems} item)`, 'success');
    } catch (err) {
      showToast(err.message || 'Gagal mengunduh cadangan data', 'error');
    }
  };

  // Clean Dashboard: Filter items solely based on quick search query (zero filter tab clutter!)
  const cleanDashboardItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter((item) => {
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchCreator = item.creator?.toLowerCase().includes(q);
      const matchType = item.type?.toLowerCase().includes(q);
      const matchUrl = item.url?.toLowerCase().includes(q);
      const matchProvider = item.metadata?.provider?.toLowerCase().includes(q);
      const matchUsername = item.metadata?.username?.toLowerCase().includes(q);
      const matchDocNo = item.metadata?.docNumber?.toLowerCase().includes(q);
      const matchDocHolder = item.metadata?.docHolder?.toLowerCase().includes(q);
      const matchAccountNo = item.metadata?.accountNo?.toLowerCase().includes(q);
      const matchNotes = item.metadata?.notes?.toLowerCase().includes(q);

      // Match cards in card_reminder
      let matchCard = false;
      if (Array.isArray(item.metadata?.cards)) {
        matchCard = item.metadata.cards.some(
          (c) =>
            c.label?.toLowerCase().includes(q) ||
            c.lastDigits?.toLowerCase().includes(q) ||
            c.notes?.toLowerCase().includes(q)
        );
      }

      return (
        matchTitle ||
        matchCreator ||
        matchType ||
        matchUrl ||
        matchProvider ||
        matchUsername ||
        matchDocNo ||
        matchDocHolder ||
        matchAccountNo ||
        matchNotes ||
        matchCard
      );
    });
  }, [items, searchQuery]);

  // Urgent items count
  const urgentCount = useMemo(() => {
    return items.reduce((acc, it) => (getItemUrgency(it).isUrgent ? acc + 1 : acc), 0);
  }, [items]);

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
      {/* High-Performance Ambient Wood Parchment Canvas (0ms LCP / Pure CSS Gradient) */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, #FCFAF7 0%, #F5EFE6 55%, #ECE3D4 100%)',
        }}
      />

      {/* 1. Left Sidebar Navigation with dedicated Menu Brankas */}
      <Sidebar
        user={currentUser}
        currentView={currentView}
        onNavigateView={handleNavigateView}
        onNavigateLogin={handleNavigateLogin}
        onLogout={handleLogout}
        isOpenMobile={isSidebarMobileOpen}
        onCloseMobile={() => setIsSidebarMobileOpen(false)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        {/* Sticky Top Navbar with Direct Navigation Pills */}
        <Navbar
          onOpenAddModal={handleOpenAddModal}
          onToggleSidebar={() => setIsSidebarMobileOpen(true)}
          onBackup={handleExportBackup}
          totalItems={items.length}
          isPrivacyMode={isPrivacyMode}
          onTogglePrivacyMode={() => setIsPrivacyMode((prev) => !prev)}
          currentView={currentView}
          onNavigateView={handleNavigateView}
        />

        {/* Dynamic Page Router */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* View 1: Clean & Minimal Dashboard */}
          {currentView === 'dashboard' && (
            <div className="space-y-6">
              {/* Clean Minimal Woodcraft Header Plaque (Free of messy category tabs & access pills) */}
              <div
                className="w-full px-5 py-4 sm:py-5 rounded-2xl border border-[#B48248]/60 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #2D1A0E 0%, #3F2413 50%, #241308 100%)',
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFE3B3]/70 to-transparent pointer-events-none" />

                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-3 h-3 rounded-full bg-[#FFDF80] shadow-[0_0_10px_rgba(255,223,128,0.9)]" />
                  <div>
                    <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-[#FAF8F5] leading-tight">
                      Brankas Utama Vaultra
                    </h1>
                    <span className="text-xs text-[#D4A373] font-medium block">
                      Penyimpanan Bersih, Tenang, &amp; Terorganisir
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                  <span className="px-3 py-1 rounded-xl bg-[#1C1008]/80 border border-[#B48248]/40 text-xs font-mono font-bold text-[#FFE3B3]">
                    {items.length} Kompartemen Aktif
                  </span>
                  {urgentCount > 0 && (
                    <button
                      type="button"
                      onClick={() => handleNavigateView('calendar')}
                      className="px-2.5 py-1 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs font-bold text-rose-300 hover:bg-rose-900 transition-colors duration-100 cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <span>{urgentCount} Perlu Perhatian</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Clean Search Input (STRICT Form Input Anti-Lag: transition-colors duration-100) */}
              <div className="relative w-full">
                <Search className="w-4 h-4 text-[#8C6239] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari cepat judul dokumen, nama kartu, atau kata kunci brankas..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#DEC8B0] bg-[#FFFFFF] text-xs sm:text-sm text-[#261C14] placeholder-[#8A7563] focus:outline-none focus:border-[#B48248] focus:ring-1 focus:ring-[#B48248] shadow-xs transition-colors duration-100"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C6239] hover:text-[#261C14] cursor-pointer"
                    aria-label="Bersihkan pencarian"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Subtle Urgent Alert Ribbon if any urgent items exist and no search */}
              {!searchQuery && urgentCount > 0 && (
                <UrgentAlertRibbon
                  items={items}
                  onSelectUrgentFilter={() => handleNavigateView('calendar')}
                  isCurrentFilterUrgent={false}
                />
              )}

              {/* Error Alert */}
              {error && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
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
                      className="h-44 rounded-2xl bg-[#FFFFFF] border border-[#EBE3D5] p-5 flex flex-col justify-between animate-pulse"
                    >
                      <div className="space-y-2.5">
                        <div className="h-4 bg-[#F5EFEB] rounded-md w-3/4" />
                        <div className="h-3 bg-[#F5EFEB] rounded-md w-1/2" />
                        <div className="h-10 bg-[#FAF4ED] rounded-xl w-full mt-2" />
                      </div>
                      <div className="h-3 bg-[#F5EFEB] rounded-md w-2/3 pt-2" />
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && cleanDashboardItems.length === 0 && (
                <div className="text-center py-12 px-4 rounded-2xl bg-white border border-[#E5DACB] space-y-3">
                  <Sparkles className="w-10 h-10 mx-auto text-[#DEC8B0]" />
                  <h3 className="text-base font-extrabold text-[#261C14]">
                    {searchQuery ? 'Tidak Ada Kompartemen yang Cocok' : 'Brankas Masih Kosong'}
                  </h3>
                  <p className="text-xs text-[#786858] max-w-sm mx-auto">
                    {searchQuery
                      ? `Tidak ditemukan item yang mengandung kata kunci "${searchQuery}". Coba kata kunci lain.`
                      : 'Mulai simpan tautan penting, nomor kartu, dokumen, tagihan, atau kredensial rahasia ke dalam brankas.'}
                  </p>
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-xs font-bold text-[#8C6239] underline cursor-pointer"
                    >
                      Hapus Kata Kunci
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleOpenAddModal}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#E5B57A] text-[#24140B] border border-[#B48248] cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Item Baru</span>
                    </button>
                  )}
                </div>
              )}

              {/* Clean Items Grid */}
              {!loading && !error && cleanDashboardItems.length > 0 && (
                <section>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {cleanDashboardItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        isPrivacyMode={isPrivacyMode}
                        onClick={(clickedItem) => setSelectedItemForPopup(clickedItem)}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* View 2: Kalender & Linimasa Brankas */}
          {currentView === 'calendar' && (
            <CalendarPage
              items={items}
              onSelectItem={(item) => setSelectedItemForPopup(item)}
            />
          )}

          {/* View 3: Pusat Diagnostik & Skor Keamanan */}
          {currentView === 'security' && (
            <SecurityPage
              items={items}
              onSelectItem={(item) => setSelectedItemForPopup(item)}
            />
          )}

          {/* View 4: Intelijen Tagihan & Langganan */}
          {currentView === 'bills' && (
            <BillsPage
              items={items}
              onUpdateItem={handleSaveItem}
              onSelectItem={(item) => setSelectedItemForPopup(item)}
            />
          )}

          {/* View 5: Studio Cadangan & Enkripsi */}
          {currentView === 'backup' && (
            <BackupPage
              items={items}
              currentUser={currentUser}
              onRestoreItems={handleRestoreItems}
              showToast={showToast}
            />
          )}

          {/* View 6: Protokol Darurat SOS & Warisan Digital */}
          {currentView === 'emergency' && (
            <EmergencyPage
              onPanicLockdown={handlePanicLockdown}
              showToast={showToast}
            />
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
              Vaultra &mdash; Smart Personal Woodcraft Vault &amp; Asset Compartments
            </p>
          </div>
        </footer>
      </div>

      {/* Mobile Floating Action Button (FAB) */}
      <button
        type="button"
        onClick={handleOpenAddModal}
        className="fixed bottom-6 right-5 z-30 sm:hidden w-13 h-13 rounded-full shadow-xl bg-gradient-to-br from-[#E5B57A] to-[#B48248] text-[#24140B] font-extrabold flex items-center justify-center border border-[#FFE3B3]/70 active:scale-95 transition-transform duration-100 cursor-pointer touch-manipulation"
        title="Tambah Item"
        aria-label="Tambah Item"
      >
        <Plus className="w-6 h-6 stroke-[2.8]" />
      </button>

      {/* 3. Modal Form (Add & Edit) */}
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

      {/* 4. Pop-up Detail Modal with Quick Extend */}
      <ItemDetailModal
        isOpen={Boolean(selectedItemForPopup)}
        item={selectedItemForPopup}
        isPrivacyMode={isPrivacyMode}
        onClose={() => setSelectedItemForPopup(null)}
        onEdit={handleStartEdit}
        onDelete={handleDeleteItem}
        onItemUpdated={handleItemUpdated}
        onError={(msg) => showToast(msg, 'error')}
      />

      {/* 5. Toast Notification (Success & Error variants) */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
}
