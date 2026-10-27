# 🪵 Vaultra — Personal Woodcraft Link & Asset Vault

> **Smart Personal Vault for Google Drive Links, Digital Assets, and Universal Bookmarks with Artisan Woodcraft Aesthetics.**

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-5-lightgrey?logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-teal?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ecf8e?logo=supabase)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deployment-Vercel%20Serverless-black?logo=vercel)](https://vercel.com/)

---

## 📖 Tentang Vaultra

**Vaultra** adalah aplikasi repositori link digital dan manajemen bookmark aset (khususnya Google Drive & resource web penting) dengan sentuhan desain unik bernuansa **Artisan Woodcraft** (papan kayu bertekstur, aksen kuningan/brass, dan pencahayaan temaram yang nyaman).

Vaultra dirancang tidak hanya untuk estetika visual yang hangat, tetapi juga dibangun dengan performa tinggi berorientasi standar **Core Web Vitals (CWV)** yang ketat: responsivitas form input seketika (INP < 16ms), LCP cepat (< 250ms), serta navigasi bebas lag.

---

## ✨ Fitur Utama

- 🗂️ **Smart Link & Asset Management**
  - Simpan dan atur link Google Drive (folder, dokumen, spreadsheet, slide) dan tautan web penting.
  - Quick Copy URL dengan feedback animasi.
  - Modal detail link lengkap dengan **QR Code generator** (`qrcode.react`) untuk kemudahan scan lewat smartphone.
- 🔒 **Sistem Privasi & Akses Berjenjang**
  - **Public Links**: Dapat diakses dan dilihat oleh siapa saja.
  - **Private Links**: Terproteksi ketat, hanya dapat dilihat oleh pembuat link, admin, atau akun spesifik yang diberikan akses (`sharedWith`).
- 💡 **Interactive Physics-based Pull-Cord Lamp Switch**
  - Lampu ambient hangat yang bisa dinyalakan/dimatikan dengan menarik tali saklar interaktif.
  - Ditenagai simulasi fisika tali elastis *spring mechanics* berbasis manipulasi langsung SVG DOM tanpa membebani rekonsiliasi React.
- 🪵 **Artisan Wood Plank Design System**
  - Pemetaan deterministik tekstur kayu alami berkualitas tinggi pada kartu link dan header.
  - Aksen warna kayu warm, dark mode temaram, dan visual premium tanpa backdrop-filter berat saat mengetik.
- 👥 **Role-Based Authentication (JWT + Bcrypt)**
  - Hak akses **Admin** & **User**.
  - Deteksi dan proteksi akun admin awal (*seed*).
  - Sidebar dinamis yang menampilkan daftar user terdaftar (Admin-first sorted).
- ⚡ **Optimasi Performa Ekstrem (Anti-Lag & Low INP)**
  - Input form tanpa efek transisi berat layout (`transition-colors duration-100` murni).
  - Navigasi view non-blocking memanfaatkan React `startTransition`.
  - Zero network fetch spamming saat user sedang mengetik input form.

---

## 🛠️ Tech Stack & Arsitektur

### Frontend (`client/`)
- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Utilities**: `axios`, `qrcode.react`

### Backend (`server/` & `api/`)
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js 5](https://expressjs.com/)
- **ORM**: [Prisma ORM 6](https://www.prisma.io/)
- **Security**: `jsonwebtoken` (JWT), `bcryptjs`, `cors`
- **Deployment**: Vercel Serverless Function ready via `api/index.js`

### Database
- **Production**: [Supabase PostgreSQL](https://supabase.com/) (dengan connection pool PgBouncer)
- **Kompatibilitas**: Kompatibel juga dengan MySQL / TiDB Cloud via konfigurasi Prisma provider.

---

## 📁 Struktur Direktori

```text
vaultra/
├── api/
│   └── index.js               # Entry point Serverless Function Vercel
├── client/                    # Frontend React + Vite + Tailwind CSS
│   ├── public/
│   ├── src/
│   │   ├── assets/            # Aset gambar tekstur kayu & icon
│   │   ├── components/        # ItemCard, PullCord, ItemModal, Sidebar, Navbar, dll.
│   │   ├── services/          # Client API calls (axios)
│   │   ├── utils/             # Wood texture selector, helper
│   │   ├── App.jsx            # Komponen utama & state router
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                    # Backend Node.js + Express + Prisma
│   ├── prisma/
│   │   ├── schema.prisma      # Skema database User & Item
│   │   └── seed.js            # Seed data user awal & sampel link
│   ├── src/
│   │   ├── config/            # Inisialisasi DB & tabel otomatis
│   │   ├── controllers/       # Logika auth & CRUD item
│   │   ├── middlewares/       # JWT auth & error handler
│   │   ├── routes/            # Endpoint /api/items & /api/auth
│   │   ├── prisma.js          # PrismaClient singleton
│   │   └── server.js          # Express app & CORS setup
│   ├── .env                   # Environment variable backend
│   └── package.json
├── run_vaultra.bat            # Script 1-klik jalan lokal (Windows)
├── vercel.json                # Konfigurasi deploy Vercel
├── package.json               # Root monorepo orchestration
└── README.md
```

---

## 🚀 Panduan Memulai Cepat (Local Development)

### Prasyarat
- [Node.js](https://nodejs.org/) (versi 18 ke atas)
- [Git](https://git-scm.com/)
- Database PostgreSQL (atau Supabase URL)

### 1. Clone Repository
```bash
git clone https://github.com/username-anda/vaultra.git
cd vaultra
```

### 2. Konfigurasi Environment Variables

Buat atau edit file `server/.env`:
```env
PORT=5000
DATABASE_URL="postgresql://user:password@host:port/database?pgbouncer=true"
JWT_SECRET="vaultra_jwt_secret_wood_key_2026"
```

> *Tip: Jika ingin mengarahkan frontend ke server API lokal, port default backend adalah `5000`.*

### 3. Setup Database & Seed Data
Masuk ke direktori server dan jalankan migrasi Prisma:
```bash
cd server
npm install
npx prisma db push
node prisma/seed.js
cd ..
```

### 4. Menjalankan Aplikasi

#### Cara 1: Menggunakan Script Windows (Paling Cepat)
Cukup klik ganda file:
```text
run_vaultra.bat
```
Script akan otomatis membuka terminal backend (Port `5000`) dan terminal frontend (Port `5173`).

#### Cara 2: Menjalankan Manual Lewat Terminal

**Jalankan Backend:**
```bash
cd server
npm run dev
```

**Jalankan Frontend (di tab/terminal lain):**
```bash
cd client
npm install
npm run dev
```

Buka browser Anda di:
👉 **`http://localhost:5173`**

---

## 🔑 Akun Default (Hasil Seed)

Setelah menjalankan `node prisma/seed.js`, akun berikut tersedia untuk login:

| Role | Username | Password | Keterangan |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Administrator awal (*initial seed admin*) |
| **User** | `user` | `user123` | Pengguna standar |
| **User** | `petugas` | `password123` | Petugas arsip / koleksi |
| **User** | `budi` | `password123` | Akun sampel |

---

## ☁️ Panduan Deploy ke Vercel

Vaultra sudah dilengkapi arsitektur monorepo serverless:

1. **Push ke GitHub**: Pastikan seluruh kode sudah di-commit dan di-push ke remote GitHub.
2. **Import ke Vercel**:
   - Buka [Vercel Dashboard](https://vercel.com/dashboard) $\rightarrow$ **Add New Project** $\rightarrow$ Pilih repository `vaultra`.
   - **Root Directory**: Biarkan `./`. Vercel akan otomatis mengenali konfigurasi `vercel.json` dan skrip `vercel-build`.
3. **Atur Environment Variables di Vercel**:
   - `DATABASE_URL`: Masukkan connection string database Supabase/PostgreSQL cloud Anda.
   - `JWT_SECRET`: Masukkan string rahasia untuk enkripsi token JWT.
4. **Deploy**: Klik tombol **Deploy**. Aplikasi frontend dan serverless API backend akan aktif dalam satu domain terpadu.

*Dokumentasi detail deploy dapat dibaca di [DEPLOY_VERCEL.md](file:///c:/Users/ad/OneDrive/Dokumen/ad/ISENG/vaultra/DEPLOY_VERCEL.md).*

---

## 📜 Lisensi & Catatan

Proyek ini dibuat untuk kebutuhan personal vault dan manajemen aset digital dengan arsitektur modern yang mudah dikembangkan.

Silakan dikembangkan lebih lanjut sesuai kebutuhan! 🪵✨
