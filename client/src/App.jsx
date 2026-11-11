import React, { useState, useEffect, useCallback, startTransition } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoginPage from './components/LoginPage';
import ItemCard from './components/ItemCard';
import ItemModal from './components/ItemModal';
import ItemDetailModal from './components/ItemDetailModal';
import UrgentAlertRibbon from './components/UrgentAlertRibbon';
import EmptyState from './components/EmptyState';
import Toast from './components/Toast';
import * as api from './services/api';
import { getItemUrgency } from './utils/cardHelper';
import {
  Globe,
  Lock,
  CreditCard,
  FileText,
  Receipt,
  Key,
  BookOpen,
  Link as LinkIcon,
  LayoutGrid,
  Clock,
  Shield,
  ShieldCheck,
} from 'lucide-react';

export default function App() {
  // Navigation View: 'dashboard' | 'login'
  const [currentView, setCurrentView] = useState('dashboard');

  // Auth State
  const [currentUser, setCurrentUser] = useState(null);

  // Data & Loading States
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Compartment Filter: 'all' | 'link' | 'card_reminder' | 'document' | 'bill' | 'credential' | 'note' | 'urgent'
  const [compartmentFilter, setCompartmentFilter] = useState('all');

  // Access Filter: 'all' | 'public' | 'private'
  const [accessFilter, setAccessFilter] = useState('all');

  // Privacy Shield State
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

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
      setError('Gagal memuat item dari server. Pastikan backend server berjalan.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Non-blocking Concurrent View Navigators
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
        setToastMessage('Kompartemen brankas berhasil diperbarui');
      } else {
        const newItem = await api.createItem(formData);
        setItems((prev) => [newItem, ...prev]);
        setToastMessage('Item berhasil ditambahkan ke brankas');
      }
    } catch (err) {
      throw new Error(err.message || 'Gagal menyimpan ke brankas');
    }
  };

  // Handle Delete Item
  const handleDeleteItem = async (id) => {
    try {
      await api.deleteItem(id);
      setItems((prev) => prev.filter((it) => it.id !== id));
      setToastMessage('Item berhasil dihapus dari brankas');
    } catch (err) {
      throw new Error(err.message || 'Gagal menghapus item');
    }
  };

  // Handle Item Updated directly from Quick Extend in Detail Modal
  const handleItemUpdated = (updated) => {
    setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
    setToastMessage('Masa aktif berhasil diperpanjang!');
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    // 1. Access Filter
    if (accessFilter === 'public' && item.isPrivate) return false;
    if (accessFilter === 'private' && !item.isPrivate) return false;

    // 2. Compartment Filter
    if (compartmentFilter === 'all') return true;
    if (compartmentFilter === 'urgent') {
      return getItemUrgency(item).isUrgent;
    }
    const itemType = item.type || 'link';
    return itemType === compartmentFilter;
  });

  // Calculate counts for badges
  const urgentCount = items.filter((it) => getItemUrgency(it).isUrgent).length;
  const linkCount = items.filter((it) => (it.type || 'link') === 'link').length;
  const cardCount = items.filter((it) => it.type === 'card_reminder').length;
  const docCount = items.filter((it) => it.type === 'document').length;
  const billCount = items.filter((it) => it.type === 'bill').length;
  const credCount = items.filter((it) => it.type === 'credential').length;
  const noteCount = items.filter((it) => it.type === 'note').length;

  const compartmentTabs = [
    { id: 'all', label: 'Semua', icon: LayoutGrid, count: items.length },
    { id: 'link', label: 'Tautan', icon: LinkIcon, count: linkCount },
    { id: 'card_reminder', label: 'Kartu', icon: CreditCard, count: cardCount },
    { id: 'document', label: 'Dokumen', icon: FileText, count: docCount },
    { id: 'bill', label: 'Tagihan', icon: Receipt, count: billCount },
    { id: 'credential', label: 'Kredensial', icon: Key, count: credCount },
    { id: 'note', label: 'Catatan', icon: BookOpen, count: noteCount },
    {
      id: 'urgent',
      label: 'Urgent (≤ 7 Hari)',
      icon: Clock,
      count: urgentCount,
      isSpecial: true,
    },
  ];

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
        {/* Sticky Top Navbar with Privacy Shield Toggle */}
        <Navbar
          onOpenAddModal={handleOpenAddModal}
          onToggleSidebar={() => setIsSidebarMobileOpen(true)}
          totalItems={items.length}
          isPrivacyMode={isPrivacyMode}
          onTogglePrivacyMode={() => setIsPrivacyMode((prev) => !prev)}
        />

        {/* Content Body */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Top Woodcraft Plank Header with Integrated Access Filters & Privacy Indicator */}
          <div
            className="w-full mb-4 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl border border-[#B48248]/60 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #2D1A0E 0%, #3F2413 45%, #241308 100%)',
            }}
          >
            {/* Top Gloss & Brass Inlay */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFE3B3]/60 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#B48248]/50 to-transparent pointer-events-none" />

            {/* Left: Brand / Section Label */}
            <div className="flex items-center gap-2.5 relative z-10">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFDF80] shadow-[0_0_8px_rgba(255,223,128,0.9)]" />
              <div>
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-[#FAF8F5] drop-shadow-sm leading-tight">
                  Kompartemen Brankas
                </h1>
                <span className="text-[10px] text-[#D4A373] font-medium block">
                  Penyimpanan Aman Kayu Mahoni &amp; Kuningan
                </span>
              </div>
            </div>

            {/* Right: Access Filters (Semua | Publik | Private) + Privacy Shield Trigger */}
            <div className="flex items-center gap-2 flex-wrap relative z-10">
              <div className="inline-flex items-center p-1 rounded-xl bg-[#1C1008]/80 border border-[#B48248]/40 text-xs font-semibold shadow-inner">
                <button
                  type="button"
                  onClick={() => setAccessFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-colors duration-100 cursor-pointer ${
                    accessFilter === 'all'
                      ? 'bg-[#E5B57A] text-[#24140B] font-bold shadow-sm'
                      : 'text-[#D7C4B0] hover:text-[#FAF8F5]'
                  }`}
                >
                  Semua ({items.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAccessFilter('public')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors duration-100 cursor-pointer ${
                    accessFilter === 'public'
                      ? 'bg-[#7CB364] text-[#14260D] font-bold shadow-sm'
                      : 'text-[#D7C4B0] hover:text-[#FAF8F5]'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  <span>Publik ({items.filter((i) => !i.isPrivate).length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAccessFilter('private')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors duration-100 cursor-pointer ${
                    accessFilter === 'private'
                      ? 'bg-[#FFCC00] text-[#26160D] font-bold shadow-sm'
                      : 'text-[#D7C4B0] hover:text-[#FAF8F5]'
                  }`}
                >
                  <Lock className="w-3 h-3" />
                  <span>Private ({items.filter((i) => i.isPrivate).length})</span>
                </button>
              </div>

              {/* Privacy Shield Indicator Button */}
              <button
                type="button"
                onClick={() => setIsPrivacyMode((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors duration-100 cursor-pointer shadow-xs ${
                  isPrivacyMode
                    ? 'bg-[#FFDF80] text-[#241208] border-[#FFE3B3] ring-1 ring-[#FFDF80]'
                    : 'bg-[#1C1008]/70 text-[#D7C4B0] border-[#B48248]/40 hover:text-white'
                }`}
                title="Toggle Sensor Nomor Rahasia"
              >
                {isPrivacyMode ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#241208] stroke-[2.5]" />
                    <span>Shield ON</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-3.5 h-3.5 text-[#D4A373]" />
                    <span>Sensor Mode</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Horizontal Scrollable Compartment Category Tab Bar */}
          <div className="w-full mb-6 overflow-x-auto pb-1.5 scrollbar-none">
            <div className="flex items-center gap-2 min-w-max">
              {compartmentTabs.map((tab) => {
                const IconComp = tab.icon;
                const isSelected = compartmentFilter === tab.id;
                const isUrgentTab = tab.id === 'urgent';

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCompartmentFilter(tab.id)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors duration-100 cursor-pointer shrink-0 shadow-xs ${
                      isSelected
                        ? isUrgentTab
                          ? 'bg-[#EF4444] text-white border-[#DC2626] ring-2 ring-[#FCA5A5]'
                          : 'bg-[#2E1A0F] text-[#FFE3B3] border-[#D49132] ring-1 ring-[#D49132]'
                        : isUrgentTab && tab.count > 0
                        ? 'bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5] hover:bg-[#FEE2E2]'
                        : 'bg-[#FFFFFF] text-[#664C35] border-[#E5DACB] hover:bg-[#F7EFE4] hover:text-[#261C14]'
                    }`}
                  >
                    <IconComp
                      className={`w-3.5 h-3.5 ${
                        isSelected
                          ? isUrgentTab
                            ? 'text-white'
                            : 'text-[#FFDF80]'
                          : isUrgentTab && tab.count > 0
                          ? 'text-rose-600 animate-pulse'
                          : 'text-[#8C6239]'
                      }`}
                    />
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? isUrgentTab
                            ? 'bg-white/20 text-white'
                            : 'bg-[#D49132] text-[#241208]'
                          : isUrgentTab && tab.count > 0
                          ? 'bg-[#EF4444] text-white'
                          : 'bg-[#F2E5D5] text-[#8C6239]'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Urgent Alert Ribbon: Peringatan jika ada kartu / tagihan mendekati tempo atau expired */}
          <UrgentAlertRibbon
            items={items}
            onSelectUrgentFilter={() =>
              setCompartmentFilter((prev) => (prev === 'urgent' ? 'all' : 'urgent'))
            }
            isCurrentFilterUrgent={compartmentFilter === 'urgent'}
          />

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
          {!loading && !error && filteredItems.length === 0 && (
            <EmptyState
              onOpenAddModal={handleOpenAddModal}
              compartmentName={
                compartmentFilter === 'all'
                  ? null
                  : compartmentTabs.find((t) => t.id === compartmentFilter)?.label
              }
            />
          )}

          {/* Items Grid */}
          {!loading && !error && filteredItems.length > 0 && (
            <section>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredItems.map((item) => (
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
      />

      {/* 5. Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </div>
  );
}
