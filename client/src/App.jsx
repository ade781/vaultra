import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import ItemCard from './components/ItemCard';
import ItemModal from './components/ItemModal';
import ItemDetailModal from './components/ItemDetailModal';
import EmptyState from './components/EmptyState';
import Toast from './components/Toast';
import * as api from './services/api';

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItemForPopup, setSelectedItemForPopup] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Fetch items
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
        setToastMessage('Link berhasil diperbarui');
      } else {
        // Add mode
        const newItem = await api.createItem(formData);
        setItems((prev) => [newItem, ...prev]);
        setToastMessage('Link berhasil ditambahkan');
      }
    } catch (err) {
      throw new Error(err.message || 'Gagal menyimpan link');
    }
  };

  // Handle Delete Item
  const handleDeleteItem = async (id) => {
    try {
      await api.deleteItem(id);
      setItems((prev) => prev.filter((it) => it.id !== id));
      setToastMessage('Link berhasil dihapus');
    } catch (err) {
      throw new Error(err.message || 'Gagal menghapus link');
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#FAF8F5] text-[#261C14]">
      {/* 1. Header Navbar */}
      <Navbar 
        onOpenAddModal={handleOpenAddModal} 
        totalItems={items.length} 
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        
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
                className="h-32 rounded-2xl bg-[#FFFFFF] border border-[#EFE8DE] p-5 flex flex-col justify-between animate-pulse"
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
        {!loading && !error && items.length === 0 && (
          <EmptyState onOpenAddModal={handleOpenAddModal} />
        )}

        {/* Items Grid */}
        {!loading && !error && items.length > 0 && (
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item) => (
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

      {/* 3. Footer */}
      <footer className="border-t border-[#EFEAE1] bg-[#FFFFFF] py-6 text-center text-xs text-[#9E8C7C]">
        <div className="max-w-6xl mx-auto px-4">
          <p>Vaultra</p>
        </div>
      </footer>

      {/* 4. Modal Form (Bisa untuk Tambah Baru atau Edit) */}
      <ItemModal
        isOpen={isModalOpen}
        initialData={editingItem}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleSaveItem}
      />

      {/* 5. Pop-up Detail Modal (Dengan Barcode dan Tombol Edit) */}
      <ItemDetailModal
        isOpen={Boolean(selectedItemForPopup)}
        item={selectedItemForPopup}
        onClose={() => setSelectedItemForPopup(null)}
        onEdit={handleStartEdit}
        onDelete={handleDeleteItem}
      />

      {/* 6. Toast Notification */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage('')}
      />
    </div>
  );
}
