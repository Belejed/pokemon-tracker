# ⚡ Pokémon Tracker Indonesia

<div align="center">

> **A Modern, Production-Grade Pokémon TCG Portfolio, Inventory, & Cash Flow Management Platform for Indonesian Cards.**  
> Powered by **React 18 + TypeScript + Vite + Tailwind CSS + Chart.js + Firebase + TCGdex API & Camera OCR Scanner**.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-v10-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![TCGdex API](https://img.shields.io/badge/TCGdex-Indonesia_API-8B5CF6)](https://tcgdex.dev/)

🔗 **Live Demo:** [https://belejed.github.io/pokemon-tracker/](https://belejed.github.io/pokemon-tracker/)

</div>

---

## 🌟 Overview

**Pokémon Tracker Indonesia** adalah platform web open-source modern yang dirancang khusus untuk kolektor, pemain, dan penjual kartu **Pokémon TCG Indonesia**. Aplikasi ini membantu melacak valuasi aset portofolio kartu, mencatat mutasi kas buku besar (pembelian & penjualan), menganalisis ROI pembukaan booster box (gacha/rip), memindai kartu fisik langsung lewat kamera (OCR), serta menghubungkan pencarian harga pasaran real-time di e-commerce Indonesia (**Tokopedia & Shopee**).

---

## ✨ Fitur Utama

### 1. 🇮🇩 Integrasi Database Resmi Pokémon Indonesia (TCGdex API)
- **Autocomplete Pencarian Instan**: Cukup ketik nama Pokémon (misal: *Pikachu, Charizard ex, Mewtwo*), sistem otomatis memuat artwork definisi tinggi (HD WebP), nama set ekspansi resmi Indonesia (*Letusan Tanah, Kilau Hitam, Pertemuan Paradoks, dll.*), nomor kartu, dan rarity (*AR, SAR, SR, RR, C, U, R*).
- **Metadata Lengkap**: Deskripsi kartu berbahasa Indonesia, serangan, HP, tipe energi, dan ilustrator.

### 2. 📷 Pemindai Kartu Kamera (Camera OCR Scanner)
- **Pindai Langsung dari Kamera HP / Webcam**: Dilengkapi overlay bingkai kartu untuk mempermudah framing.
- **Deteksi Otomatis (OCR via Tesseract.js)**: Mengekstrak nama kartu dan kode set dari gambar secara instan di sisi browser tanpa perlu backend.
- **1-Klik Tambah ke Katalog**: Hasil pemindaian langsung dicocokkan dengan database Indonesia dan dapat ditambahkan ke portofolio hanya dengan satu ketukan.
- **Dukungan Upload Foto**: Pengguna juga dapat mengunggah file foto kartu dari galeri.

### 3. 🛍️ Pengecekan Harga Pasaran E-Commerce (Tokopedia & Shopee)
- **1-Click Live Search**: Tombol cepat untuk mengecek harga pasaran kartu di **Tokopedia** dan **Shopee** dengan kata kunci pencarian terformat rapi sesuai nama dan set kartu.
- **Kalkulator Profit / Loss (P/L)**: Menghitung selisih harga modal beli dan estimasi harga jual saat ini secara otomatis.

### 4. 📊 Buku Kas Utama & Valuasi Portofolio Real-Time
- **Perhitungan Kas Akurat**: Mengkalkulasi Saldo Kas Tunai (`Suntikan Modal + Hasil Penjualan - Belanja Stok + Pinjaman`).
- **Valuasi Aset Koleksi**: Menghitung total kekayaan bersih (*Net Worth*) dari seluruh kartu dan box yang tersimpan.
- **Grafik Interaktif (Chart.js)**:
  - *Riwayat Cash Flow Harian/Bulanan*: Bar chart visualisasi pemasukan vs pengeluaran.
  - *Distribusi Kategori Aset*: Donut chart sebaran Single Card, Sealed Box, Booster Pack, dan Graded Slab.

### 5. 🎲 Box Break / Gacha ROI Profit Calculator
- **Buka Box (Rip Box)**: Tandai status Box menjadi *Opened (Dibuka)*.
- **Tautkan Hasil Tarikan**: Kartu hasil gacha dapat dihubungkan ke Box asalnya dengan modal otomatis Rp 0 (karena biaya sudah tercatat pada pembelian box).
- **Kalkulator ROI Otomatis**: Menghitung akumulasi harga pasar seluruh kartu yang ditarik dibanding harga modal beli box untuk mengetahui apakah gacha menghasilkan profit atau minus!

### 6. ⚡ Quick Sell & Mutasi Transaksi Otomatis
- **Jual Cepat (Quick Sell)**: Mengubah status kartu menjadi *Terjual* dan otomatis mencatat transaksi pemasukan (*Sales*) ke Buku Kas.
- **Pencatatan Pembelian Otomatis**: Menambah kartu dengan modal > Rp 0 otomatis membuat mutasi pengeluaran (*Expense*) di Buku Kas.
- **Pelacakan Hutang/Pinjaman**: Mencatat pinjaman modal beserta nama pemberi pinjaman.

### 7. 🎯 Target Incaran (Wishlist)
- Catat kartu incaran impian lengkap dengan batas harga maksimal yang diinginkan.
- Fitur **"Beli"** 1-klik untuk langsung memindahkan kartu dari wishlist ke portofolio inventaris.
- Tombol cepat pencarian hunting ke Tokopedia & Shopee.

### 8. 🔐 Akses Berbasis Peran & Ekspor Data
- **Admin Edit Mode**: Login menggunakan Email & Password atau Google Sign-In via Firebase Auth.
- **Public Read-Only Mode**: Tampilan aman untuk pengunjung publik melihat etalase koleksi tanpa hak modifikasi.
- **Ekspor CSV / Excel**: Unduh rekapitulasi data inventaris dan buku kas dalam 1 klik.

---

## 🛠️ Tech Stack

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18 + TypeScript** | Komponen modular, performa tinggi, & type-safe |
| **Build Tool** | **Vite 6** | Ultra-fast HMR & bundling produksi |
| **Styling** | **Tailwind CSS 3.4** | Desain responsif modern & mobile-first |
| **Backend & Database** | **Firebase Firestore & Auth** | Sinkronisasi real-time & role-based authentication |
| **Card Database API** | **TCGdex API (Indonesian Locale)** | Database kartu & artwork resmi Pokémon Indonesia |
| **Camera & OCR Engine** | **Tesseract.js & WebRTC** | Pengenalan teks kartu langsung di sisi browser |
| **Data Visualization** | **Chart.js + react-chartjs-2** | Visualisasi grafik cash flow dan donat kategori |
| **Icons** | **Lucide React** | Ikon vektor ringan & konsisten |
| **CI / CD** | **GitHub Actions** | Otomatisasi build & deploy ke GitHub Pages |

---

## 📁 Struktur Direktori

```
pokemon-tracker/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions auto-deployment
├── src/
│   ├── assets/                 # Logo & aset grafis
│   ├── components/
│   │   ├── auth/
│   │   │   └── LoginModal.tsx  # Modal login Admin & Google Auth
│   │   ├── common/
│   │   │   ├── Badge.tsx       # Komponen badge kategori & rarity
│   │   │   └── Modal.tsx       # Reusable modal dialog
│   │   ├── dashboard/
│   │   │   ├── CashFlowChart.tsx
│   │   │   ├── CategoryChart.tsx
│   │   │   ├── DashboardTab.tsx
│   │   │   └── MetricCard.tsx
│   │   ├── inventory/
│   │   │   ├── CameraScannerModal.tsx # Scanner kamera + OCR Tesseract
│   │   │   ├── CardDetailModal.tsx    # Detail kartu + link E-Commerce
│   │   │   ├── InventoryCard.tsx      # Kartu item + ROI gacha calculator
│   │   │   ├── InventoryTab.tsx       # Filter & search katalog
│   │   │   ├── ItemModal.tsx          # Tambah/edit kartu + TCGdex search
│   │   │   └── QuickSellModal.tsx     # Modal jual cepat
│   │   ├── layout/
│   │   │   ├── BottomNav.tsx   # Navigasi bawah layar mobile
│   │   │   └── Navbar.tsx      # Top floating glass navbar
│   │   ├── transactions/
│   │   │   ├── TransactionModal.tsx
│   │   │   └── TransactionsTab.tsx
│   │   └── wishlist/
│   │       ├── WishlistModal.tsx
│   │       └── WishlistTab.tsx
│   ├── context/
│   │   ├── AuthContext.tsx     # State autentikasi Admin
│   │   └── TrackerContext.tsx  # State Firestore & kalkulasi kas
│   ├── services/
│   │   ├── firebase.ts         # Inisialisasi Firebase SDK
│   │   ├── ocrService.ts       # Service OCR Tesseract
│   │   └── tcgdexService.ts    # Service TCGdex API Indonesia
│   ├── types/
│   │   ├── index.ts            # Tipe data utama
│   │   └── tcgdex.ts           # Schema API TCGdex
│   ├── utils/
│   │   ├── ecommerce.ts        # Generator link Tokopedia & Shopee
│   │   ├── exportCsv.ts        # Generator file CSV Excel
│   │   └── formatters.ts       # Format mata uang Rupiah & tanggal
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── vite-env.d.ts
├── .env.example                # Template environment variable
├── .gitignore
├── CONTRIBUTING.md             # Panduan kontribusi open source
├── LICENSE                     # Lisensi MIT
├── index.html                  # Entry point HTML
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Panduan Menjalankan Secara Lokal

### 1. Kloning Repository
```bash
git clone https://github.com/Belejed/pokemon-tracker.git
cd pokemon-tracker
```

### 2. Instal Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
*(Opsional) Kamu dapat menggunakan database Firebase bawaan atau memasukkan kredensial Firebase milikmu sendiri dari Firebase Console.*

### 4. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka browser dan akses [http://localhost:3000](http://localhost:3000).

### 5. Build untuk Produksi
```bash
npm run build
```
File hasil kompilasi yang siap dideploy akan berada di folder `/dist`.

---

## 🌐 Panduan Deploy ke GitHub Pages

Repository ini telah dilengkapi alur kerja otomatis GitHub Actions (`.github/workflows/deploy.yml`):

1. Masuk ke halaman **Settings** repository kamu di GitHub.
2. Buka menu **Pages** di bilah sisi kiri.
3. Pada bagian **Build and deployment > Source**, pilih **GitHub Actions**.
4. Setiap kali kamu melakukan `git push origin main`, GitHub Actions akan otomatis membangun aplikasi dan mempublikasikannya ke domain GitHub Pages kamu!

---

## 🤝 Kontribusi

Kontribusi dari komunitas sangat diterima! Silakan baca panduan lengkap di [CONTRIBUTING.md](CONTRIBUTING.md) sebelum membuat Pull Request.

1. Fork repository ini.
2. Buat branch fitur kamu (`git checkout -b feature/fitur-baru`).
3. Commit perubahan (`git commit -m 'feat: menambahkan fitur baru'`).
4. Push ke branch (`git push origin feature/fitur-baru`).
5. Buat Pull Request baru.

---

## 📄 Lisensi

Proyek ini didistribusikan di bawah lisensi **MIT License**. Lihat file [LICENSE](LICENSE) untuk informasi lebih lanjut.

---

<div align="center">

Dibuat dengan ❤️ untuk Komunitas Pokémon TCG Indonesia &bull; *Gotta Track 'Em All!*

</div>
