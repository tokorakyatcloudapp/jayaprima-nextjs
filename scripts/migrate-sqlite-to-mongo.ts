import Database from "better-sqlite3";
import { MongoClient, Binary } from "mongodb";
import path from "path";
import dotenv from "dotenv";

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const SQLITE_PATH = path.join(process.cwd(), "src", "db", "2026");
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_DB || "jayaprima_2026";

// Tables to migrate
const TABLES = [
  "akun",
  "user_info",
  "pelanggan",
  "supplier",
  "kategori_brg",
  "satuan_brg",
  "produk",
  "produk_bundle",
  "brg_masuk",
  "brg_keluar",
  "faktur_penjualan",
  "hutang_pembelian",
  "antrian_printer",
];

// Views to materialize as collections
const VIEWS = [
  "v_beranda",
  "v_top_kategori",
  "v_top_pelanggan",
  "v_pendapatan_harian",
  "v_pendapatan_bulanan",
  "v_faktur_penjualan",
  "v_hutang_pembelian",
  "v_hutang_pelanggan",
  "v_brg_keluar",
  "v_brg_masuk",
  "v_produk",
  "v_produk_bundle",
  "v_sisa_stok",
  "v_antrian_printer",
];

// Columns that contain BLOB data
const BLOB_COLUMNS: Record<string, string[]> = {
  akun: ["foto"],
  user_info: ["logo"],
};

function convertRow(table: string, row: Record<string, unknown>): Record<string, unknown> {
  const blobCols = BLOB_COLUMNS[table];
  if (!blobCols) return row;

  const converted = { ...row };
  for (const col of blobCols) {
    if (converted[col] && Buffer.isBuffer(converted[col])) {
      converted[col] = new Binary(converted[col] as Buffer);
    }
  }
  return converted;
}

async function migrate() {
  console.log("Opening SQLite database:", SQLITE_PATH);
  const sqlite = new Database(SQLITE_PATH, { readonly: true });

  console.log("Connecting to MongoDB:", MONGODB_URI);
  const mongo = new MongoClient(MONGODB_URI);
  await mongo.connect();

  const db = mongo.db(MONGODB_DB);

  // Drop existing collections to start fresh
  const existingCollections = await db.listCollections().toArray();
  const existingNames = new Set(existingCollections.map((c) => c.name));

  // Migrate tables
  console.log("\n=== Migrating Tables ===\n");
  for (const table of TABLES) {
    try {
      const rows = sqlite.prepare(`SELECT * FROM "${table}"`).all() as Record<string, unknown>[];
      console.log(`  ${table}: ${rows.length} rows`);

      if (existingNames.has(table)) {
        await db.collection(table).drop();
      }

      if (rows.length > 0) {
        const converted = rows.map((row) => convertRow(table, row));
        await db.collection(table).insertMany(converted);
      } else {
        await db.createCollection(table);
      }
    } catch (err) {
      console.error(`  ERROR migrating table "${table}":`, (err as Error).message);
    }
  }

  // Migrate views (materialize as collections)
  console.log("\n=== Materializing Views ===\n");
  for (const view of VIEWS) {
    try {
      const rows = sqlite.prepare(`SELECT * FROM "${view}"`).all() as Record<string, unknown>[];
      console.log(`  ${view}: ${rows.length} rows`);

      if (existingNames.has(view)) {
        await db.collection(view).drop();
      }

      if (rows.length > 0) {
        await db.collection(view).insertMany(rows);
      } else {
        await db.createCollection(view);
      }
    } catch (err) {
      console.error(`  ERROR materializing view "${view}":`, (err as Error).message);
    }
  }

  // Create useful indexes
  console.log("\n=== Creating Indexes ===\n");
  await db.collection("akun").createIndex({ username: 1 }, { unique: true });
  console.log("  akun: index on username (unique)");

  await db.collection("akun").createIndex({ id: 1 }, { unique: true });
  console.log("  akun: index on id (unique)");

  await db.collection("user_info").createIndex({ id: 1 }, { unique: true });
  console.log("  user_info: index on id (unique)");

  await db.collection("v_pendapatan_harian").createIndex({ tanggal: 1 });
  console.log("  v_pendapatan_harian: index on tanggal");

  await db.collection("v_pendapatan_bulanan").createIndex({ Ym: 1 });
  console.log("  v_pendapatan_bulanan: index on Ym");

  await db.collection("v_top_kategori").createIndex({ total: -1 });
  console.log("  v_top_kategori: index on total (desc)");

  await db.collection("v_top_pelanggan").createIndex({ total_belanja: -1 });
  console.log("  v_top_pelanggan: index on total_belanja (desc)");

  // Summary
  const finalCollections = await db.listCollections().toArray();
  console.log(
    `\n=== Done! ${finalCollections.length} collections created in "${MONGODB_DB}" ===\n`
  );

  sqlite.close();
  await mongo.close();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
