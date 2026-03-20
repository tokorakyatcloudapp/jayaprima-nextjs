import Database from "better-sqlite3";
import path from "path";

const DB_DIR = path.join(process.cwd(), "src", "db");

let db: Database.Database | null = null;

export function getDb(year: string = "2026"): Database.Database {
  const dbPath = path.join(DB_DIR, year);

  if (db && db.name === dbPath && db.open) {
    return db;
  }

  db = new Database(dbPath, { readonly: false });
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  return db;
}
