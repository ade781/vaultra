# Global GEMINI Instructions & Rules

## Browser Testing Restriction
- **STRICT RULE**: JANGAN PERNAH gunakan tool `browser_subagent` atau membuka browser otomatis untuk pengujian/testing.
- Dilarang membuka sesi browser otomatis untuk visual verification.
- Semua validasi kode WAJIB dilakukan melalui terminal/CLI (seperti syntax checking `node -c`, linting, atau `npm run build`).
- Pengujian visual diserahkan sepenuhnya kepada pengguna secara manual di browser mereka sendiri.

## Frontend Form Input Performance & Anti-Lag Rule (STRICT INP & LCP)
- **DILARANG KERAS membuat pengetikan form menjadi lambat/lag atau memicu kalkulasi berat per karakter**:
  - JANGAN PERNAH pasang CSS `transition-all` pada elemen input form (`<input>`, `<textarea>`). Gunakan `transition-colors duration-100` agar input merespons seketika (< 16ms) tanpa layout recalculation.
  - JANGAN PERNAH gunakan `backdrop-filter: blur(...)` pada overlay modal aktif saat ada input form, karena GPU dipaksa merasterisasi ulang seluruh layar di setiap tombol keyboard ditekan.
  - JANGAN PERNAH melakukan network request atau re-fetch data di saat user sedang mengetik input form.
- **Standar LCP (Largest Contentful Paint)**:
  - Dilarang memuat background image berat (> 100 kB) pada kontainer utama di atas fold. Wajib gunakan CSS gradient murni untuk performa LCP instan (< 250ms).
- **Standar SVG Logo**:
  - Semua SVG Logo wajib memakai `useId()` untuk linearGradient agar tidak terjadi tabrakan ID yang membuat logo hilang/transparan.
