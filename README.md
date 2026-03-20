# Jaya Prima

Sistem manajemen Jaya Prima — built with Next.js and TypeScript. Migrated from a PHP/Bootstrap 3 project with matching UI and functionality.

## Features

- Login page matching original PHP project styling
- Protected dashboard with sidebar navigation, stats tiles, and data panels
- JWT-based sessions (20-hour expiration) stored in httpOnly cookies
- Proxy-based route protection (Next.js 16)
- SQLite database connector (better-sqlite3, WAL mode)
- Role-based menu access (admin vs regular user)
- Dynamic company logo and profile images served from database BLOBs
- Database year selector for multi-year data access
- Prettier + Husky pre-commit hooks for code quality

## Getting Started

### Install dependencies

```bash
npm install
```

### Database

Place SQLite database files in `src/db/`. Files should be named by year (e.g., `2026`).

### Set environment variable (optional)

```bash
# Default secret is used in development. Set this in production:
export JWT_SECRET="your-secret-key"
```

### Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── dashboard/route.ts         # Dashboard stats from v_beranda
│   │   ├── foto-profil/route.ts       # Profile photo BLOB from akun table
│   │   ├── logo/route.ts              # Company logo BLOB from user_info table
│   │   ├── login/route.ts             # Auth with MD5 password hashing
│   │   ├── logout/route.ts            # Clear session cookie
│   │   ├── pendapatan-bulanan/route.ts
│   │   ├── pendapatan-harian/route.ts
│   │   ├── top-kategori/route.ts
│   │   ├── top-pelanggan/route.ts
│   │   └── user-info/route.ts         # Company info + available DB years
│   ├── dashboard/
│   │   ├── layout.tsx                 # Session verification + shell
│   │   ├── dashboard-shell.tsx        # Client layout with sidebar toggle
│   │   ├── dashboard-panels.tsx       # Collapsible data panels
│   │   ├── dashboard.css
│   │   └── page.tsx                   # Dashboard home
│   ├── login/
│   │   └── page.tsx                   # Login page
│   ├── globals.css
│   └── layout.tsx                     # Root layout (Bootstrap 3 + Font Awesome 4)
├── components/
│   ├── sidebar.tsx                    # Left navigation with menu items
│   ├── top-nav.tsx                    # Top bar with profile + DB year selector
│   └── dashboard-stats.tsx            # Stats tiles
├── db/                                # SQLite database files (by year)
├── lib/
│   ├── auth.ts                        # JWT session utilities (jose)
│   └── db.ts                          # SQLite connector (better-sqlite3)
└── proxy.ts                           # Route protection proxy
```

## Tech Stack

- **Next.js 16** — App Router
- **TypeScript**
- **Bootstrap 3.3.7** + **Font Awesome 4.7** — matching original PHP project
- **better-sqlite3** — SQLite database access
- **jose** — JWT signing and verification
- **Prettier** + **Husky** — code formatting and pre-commit hooks
