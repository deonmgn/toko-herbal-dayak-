# 🌿 Toko Herbal Dayak - Toko Online Obat Tradisional

Sistem e-commerce sederhana untuk menjual obat herbal tradisional khas Dayak Kalimantan ke seluruh Indonesia.

## Fitur

- 🛍️ **Toko Online** — Katalog produk, keranjang belanja, checkout
- 💳 **Pembayaran Otomatis** — Midtrans (QRIS, Transfer Bank, E-Wallet)
- 🚚 **Cek Ongkir Otomatis** — RajaOngkir (JNE, J&T, POS)
- 📦 **Tracking Pesanan** — Cek status & resi pengiriman
- 👩‍💼 **Admin Dashboard** — Kelola produk, pesanan, laporan
- 🛡️ **Anti-Penipuan** — Validasi telepon & alamat

## Cara Install

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

```bash
npm run setup
```

Ini akan membuat database SQLite dan mengisi data produk contoh.

### 3. Konfigurasi API Keys

Edit file `.env` dan isi API keys:

```env
# Midtrans (daftar di https://dashboard.midtrans.com)
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_CLIENT_KEY=your_client_key
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_client_key

# RajaOngkir (daftar di https://rajaongkir.com)
RAJAONGKIR_API_KEY=your_api_key

# Kota asal pengiriman (ID dari RajaOngkir)
SHIP_ORIGIN_CITY_ID=365
```

### 4. Jalankan

```bash
npm run dev
```

Buka http://localhost:3000

### Admin Panel

Buka http://localhost:3000/admin/login

- **Username:** admin
- **Password:** admin123

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma + SQLite
- Midtrans Payment Gateway
- RajaOngkir Shipping API

## Struktur Folder

```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── produk/[slug]/        # Detail produk
│   ├── checkout/             # Keranjang & checkout
│   ├── pesanan/[id]/         # Tracking pesanan
│   ├── admin/                # Dashboard admin
│   │   ├── login/            # Login admin
│   │   ├── produk/           # Kelola produk
│   │   └── pesanan/          # Kelola pesanan
│   └── api/                  # API endpoints
├── components/               # Komponen UI
└── lib/                      # Utility & integrasi
```
