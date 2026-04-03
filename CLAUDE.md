# CLAUDE

@AGENTS.md

## Project Overview

Jaya Prima - Business management system built with Next.js 16 (App Router). Indonesian locale throughout (id-ID). Bootstrap 3 legacy UI with custom CSS overlays.

## Tech Stack

- **Framework:** Next.js 16, React 19, TypeScript
- **Database:** MongoDB (2 separate free-plan clusters, 500MB each)
  - Primary (`MONGODB_URI`): business data in `jayaprima_2026`
  - File storage (`MONGOFS_URI`): GridFS for file uploads
- **Auth:** JWT (jose) with httpOnly cookies, MD5 password hashing, 20h expiry
- **UI:** Bootstrap 3.3.7 (CDN), Font Awesome 4.7 (CDN), Chart.js, DataTables.net, react-datepicker
- **Monitoring:** Vercel Analytics + Speed Insights

## Project Structure

```text
src/
  app/
    api/            # API routes (login, logout, dashboard, pendapatan-*, top-*, storage-info, files/*, foto-profil, logo, user-info)
    dashboard/
      profil-usaha/ # Business profile & logo management (admin only, levelAkses === 0)
      layout.tsx
      page.tsx
      dashboard-panels.tsx
      dashboard-shell.tsx
    login/          # Login page
    layout.tsx      # Root layout (Bootstrap/FA CDN links)
    globals.css     # Global styles + shimmer animations
  components/       # Sidebar, TopNav, DashboardStats, DashboardShell, DataTable (dt-table.tsx)
  lib/
    auth.ts         # JWT session helpers (createSession, verifySession, getSessionCookieConfig)
    db.ts           # MongoDB connections (getDb, getFsDb, getFsBucket)
  proxy.ts          # Middleware for route protection
scripts/
  migrate-sqlite-to-mongo.ts  # SQLite to MongoDB migration script
public/
  asset/css/custom.min.css    # Legacy custom styles
  logo.png                    # Company logo / favicon (fallback when no GridFS logo)
```

## Database Collections

- **Core:** akun, user_info, pelanggan, supplier, kategori_brg, satuan_brg, produk, produk_bundle, brg_masuk, brg_keluar, faktur_penjualan, hutang_pembelian, antrian_printer
- **Views (materialized):** v_beranda, v_pendapatan_harian, v_pendapatan_bulanan, v_top_kategori, v_top_pelanggan, v_faktur_penjualan, v_hutang_pembelian, v_hutang_pelanggan, v_brg_keluar, v_brg_masuk, v_produk, v_produk_bundle, v_sisa_stok, v_antrian_printer
- **GridFS:** fs.files, fs.chunks (on file storage cluster)

## Environment Variables

- `MONGODB_URI` - Primary MongoDB connection string
- `MONGOFS_URI` - File storage MongoDB connection string
- `MONGODB_DB` - Database name (default: `jayaprima_2026`)
- `JWT_SECRET` - JWT signing secret

## Conventions

- CSS: Bootstrap 3 classes + custom.min.css. Tailwind is configured but barely used.
- Data fetching: Client-side with useState/useEffect in dashboard components.
- Loading states: Shimmer animations (ShimmerLines, ShimmerTable, ShimmerChart components in dashboard-panels.tsx).
- Collapsible panels: `CollapsiblePanel` component wraps each dashboard section.
- Multi-year DB support: Year selectable in TopNav, switches `getDb(year)`.
- Role-based access: `levelAkses === 0` for admin-only features.
- Code quality: Husky pre-commit hooks with ESLint + Prettier (100 char width, no semicolons).
- `/api/logo` must use `Cache-Control: no-store` — never add long-lived caching or the updated logo won't appear after upload.
- Logo/profile uploads use react-dropzone with immediate upload on drop; successful save reloads the page via `window.location.reload()`.
