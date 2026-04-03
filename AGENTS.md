<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Database

This project uses **MongoDB** (native driver, no Mongoose). There is no SQLite. Two clusters:

- Primary (`MONGODB_URI`) — business data
- File storage (`MONGOFS_URI`) — GridFS for binary uploads (logos, photos)

Helpers: `getDb(year?)`, `getFsDb()`, `getFsBucket()` from `src/lib/db.ts`.

## Auth

JWT via `jose`. Always call `verifySession()` in mutating API routes. Admin-only routes check `session.levelAkses === 0`.

## File Uploads

Use `req.formData()` in API routes — do not use `busboy` or `multer`. GridFS streams via `bucket.openUploadStream` / `bucket.openDownloadStream`.

## UI

Bootstrap 3 loaded from CDN in `src/app/layout.tsx`. Do not install Bootstrap via npm. Tailwind is present but rarely used — prefer Bootstrap 3 classes and `custom.min.css`.
