# Vaultra Client (Frontend)

Antarmuka web modern untuk **Vaultra** — Smart Personal Vault untuk Google Drive links & digital assets.

## Fitur Frontend
- **Desain Modern & Estetik**: Tampilan bernuansa gelap (slate-950) dengan aksen indigo, tipografi *Plus Jakarta Sans*, micro-interactions, dan responsive design.
- **Deteksi Tipe Google Drive Otomatis**: Realtime filetype preview (Folder, Google Docs, Sheets, Slides, Forms, Zip/Arsip).
- **Aksi Cepat 1-Klik**:
  - Salin URL instan dengan visual feedback toast notification.
  - Buka berkas langsung di tab baru.
  - Edit & Hapus dengan modal konfirmasi aman.
- **Pencarian & Multi-Filter**:
  - Pencarian reaktif (debounced 300ms) berdasarkan judul, deskripsi, atau URL.
  - Filter tipe Google Drive (Folder, Docs, Sheets, Slides, Arsip).
  - Filter kategori dinamis dengan badge item count.
  - Filter tag cloud.
  - Grid View & List View switcher.
- **Manajemen Kategori**: Buat, edit nama & warna swatches, dan hapus kategori langsung dari modal.
- **Empty States & Loading Skeletons**: Penanganan kondisi loading, kosong, maupun kesalahan jaringan yang elegan.

## Menjalankan Secara Lokal
```bash
# Masuk ke direktori client
cd client

# Install dependensi (jika belum)
npm install

# Jalankan development server
npm run dev
```

Aplikasi frontend akan berjalan di `http://localhost:5173`.
Target backend API dikonfigurasi ke `http://localhost:5000/api`.

## Build Produksi
```bash
npm run build
```
Hasil build akan tersimpan di folder `dist/`.
