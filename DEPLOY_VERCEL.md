# Panduan Deploy Vaultra ke Vercel

Vaultra sudah disiapkan dan dioptimalkan agar dapat dideploy ke **Vercel** dengan sangat mudah.

---

## 1. Persiapan Database MySQL Cloud

Karena Vercel adalah platform *serverless*, database MySQL lokal di laptop Anda (`localhost:3306`) tidak bisa diakses dari internet. Anda memerlukan satu database MySQL gratis di cloud.

### Rekomendasi Database MySQL Gratis:
* **[TiDB Serverless](https://tidbcloud.com/)** (Paling direkomendasikan: Gratis 5GB, 100% kompatibel MySQL, sangat kencang, tanpa kartu kredit).
* **[Aiven for MySQL](https://aiven.io/)** (Gratis tier cloud MySQL).
* **[Railway](https://railway.app/)** (Tersedia template MySQL 1-click).

Setelah membuat database, Anda akan mendapatkan satu URL koneksi, contohnya:
```env
DATABASE_URL="mysql://root:password123@gateway.tidbcloud.com:4000/vaultra?sslaccept=strict"
```

> **Tips Singkat Sinkronisasi Tabel:**
> Sebelum deploy, ubah sementara `DATABASE_URL` di `server/.env` ke URL cloud tersebut, lalu jalankan:
> ```bash
> cd server
> npx prisma db push
> node prisma/seed.js
> ```
> Database cloud Anda akan langsung siap dengan tabel dan akun admin seed!

---

## 2. Cara Deploy (Pilihan 1: Full-Stack Monorepo - Paling Praktis)

Ini adalah opsi terbaik karena Frontend dan Backend Express berjalan dalam **satu project Vercel yang sama** tanpa pusing mengatur CORS atau domain terpisah.

1. **Push Seluruh Folder `vaultra` ke GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: prepare vercel deployment"
   git branch -M main
   git remote add origin https://github.com/username-anda/vaultra.git
   git push -u origin main
   ```

2. **Buka [Vercel Dashboard](https://vercel.com/dashboard)**:
   * Klik tombol **Add New...** $\rightarrow$ **Project**.
   * Pilih repository GitHub **vaultra** Anda.

3. **Pengaturan Project di Vercel**:
   * **Root Directory**: Biarkan default (`./`).
   * Vercel akan otomatis mendeteksi file konfigurasi `vercel.json` dan `package.json` yang sudah kami buatkan di root.

4. **Environment Variables di Vercel**:
   Buka accordion **Environment Variables**, lalu tambahkan:
   * **`DATABASE_URL`**: *(Isi dengan URL MySQL cloud Anda dari Langkah 1)*
   * **`JWT_SECRET`**: `vaultra_jwt_secret_wood_key_2026` *(atau teks rahasia acak Anda)*

5. **Klik "Deploy"**:
   * Vercel akan mem-build frontend React Vite dan serverless API backend Express.
   * Begitu selesai, website Vaultra Anda langsung aktif di domain seperti:
     `https://vaultra.vercel.app`

---

## 3. Pilihan 2: Deploy Frontend Saja di Vercel

Jika backend Express Anda sudah berjalan di VPS, Render, atau Railway terpisah:

1. Di Vercel, pilih **Root Directory**: `client`.
2. Di **Environment Variables**, tambahkan:
   * **`VITE_API_URL`**: `https://backend-anda.com/api`
3. Klik **Deploy**. File `client/vercel.json` sudah otomatis menangani routing SPA agar tidak terjadi error 404 saat *refresh* halaman.

---

## 4. Struktur File Deployment yang Sudah Dikonfigurasi

* **`vercel.json` (Root)**: Mengarahkan `/api/*` ke Serverless Express, dan halaman lainnya ke frontend Vite.
* **`api/index.js`**: Entry point Serverless Function Express untuk Vercel.
* **`client/vercel.json`**: Pengaturan rewrites SPA agar route client-side aman.
* **`client/src/services/api.js`**: Otomatis menggunakan `/api` relatif saat di Vercel (bebas error CORS).
* **`server/package.json`**: Script `postinstall: prisma generate` otomatis memastikan binary Prisma Client tersedia di serverless container Vercel.
