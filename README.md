# Jaya Prima

Business management system built with Next.js 16 (App Router). Indonesian locale (id-ID). Migrated from a PHP/Bootstrap 3 project, retaining matching UI and functionality.

## Features

- Login with MD5 password hashing, JWT sessions (20h) in httpOnly cookies
- Protected dashboard — sidebar navigation, stats tiles, collapsible data panels
- Role-based access (`levelAkses === 0` for admin features)
- Business profile management — text fields + logo upload with drag-and-drop
- Dynamic company logo and profile photos served from MongoDB GridFS
- Multi-year database selector (TopNav → `getDb(year)`)
- DataTables for interactive data tables
- Chart.js for dashboard data visualization
- react-datepicker for date-based filtering
- MongoDB storage info API
- Vercel Analytics + Speed Insights

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable      | Description                                     |
| ------------- | ----------------------------------------------- |
| `MONGODB_URI` | Primary MongoDB connection string               |
| `MONGOFS_URI` | File storage MongoDB connection string (GridFS) |
| `MONGODB_DB`  | Database name (default: `jayaprima_2026`)       |
| `JWT_SECRET`  | JWT signing secret                              |

## Project Structure

```text
src/
  app/
    api/
      dashboard/          # Aggregated dashboard stats (v_beranda)
      files/              # GridFS file download
      foto-profil/        # Profile photo upload/serve
      logo/               # Company logo serve (Cache-Control: no-store)
      login/              # Auth — MD5 + JWT
      logout/             # Clear session cookie
      pendapatan-harian/
      pendapatan-bulanan/
      storage-info/       # MongoDB storage usage
      top-kategori/
      top-pelanggan/
      user-info/          # Business profile CRUD + logo upload (admin only)
    dashboard/
      profil-usaha/       # Business profile & logo management (admin only)
      layout.tsx           # Session verification + shell
      dashboard-shell.tsx  # Client layout with sidebar toggle
      dashboard-panels.tsx # Collapsible data panels + shimmer states
      dashboard.css
      page.tsx
    login/
    layout.tsx             # Root layout (Bootstrap 3.3.7 + Font Awesome 4.7 CDN)
    globals.css            # Global styles + shimmer animations
  components/
    sidebar.tsx
    top-nav.tsx            # Year switcher, user menu
    dt-table.tsx           # Reusable DataTables wrapper
    dashboard-stats.tsx    # Stats tiles
  lib/
    auth.ts                # createSession, verifySession, getSessionCookieConfig
    db.ts                  # getDb, getFsDb, getFsBucket
  proxy.ts                 # Middleware — JWT route protection
scripts/
  migrate-sqlite-to-mongo.ts
public/
  asset/css/custom.min.css
  logo.png                 # Fallback logo / favicon
```

## Database

MongoDB — 2 separate free-plan clusters (500MB each):

- **Primary** (`MONGODB_URI`): business data in `jayaprima_2026`
- **File storage** (`MONGOFS_URI`): GridFS for logos and profile photos

**Core collections:** `akun`, `user_info`, `pelanggan`, `supplier`, `kategori_brg`, `satuan_brg`, `produk`, `produk_bundle`, `brg_masuk`, `brg_keluar`, `faktur_penjualan`, `hutang_pembelian`, `antrian_printer`

**Materialized views:** `v_beranda`, `v_pendapatan_harian`, `v_pendapatan_bulanan`, `v_top_kategori`, `v_top_pelanggan`, `v_faktur_penjualan`, `v_hutang_pembelian`, `v_hutang_pelanggan`, `v_brg_keluar`, `v_brg_masuk`, `v_produk`, `v_produk_bundle`, `v_sisa_stok`, `v_antrian_printer`

**GridFS:** `fs.files`, `fs.chunks` (file storage cluster)

## Tech Stack

- **Next.js 16** — App Router
- **React 19**, **TypeScript**
- **MongoDB** — mongoose-free, native driver
- **jose** — JWT signing and verification
- **Bootstrap 3.3.7** + **Font Awesome 4.7** (CDN)
- **Chart.js**, **DataTables**, **react-datepicker**
- **react-dropzone** — logo drag-and-drop upload
- **Prettier** + **Husky** — pre-commit hooks (100 char width, no semicolons)
- **Vercel Analytics & Speed Insights**
