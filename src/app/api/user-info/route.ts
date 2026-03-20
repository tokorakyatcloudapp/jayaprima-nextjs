import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import fs from "fs";
import path from "path";

interface UserInfoRow {
  id: number;
  nama: string;
  alamat: string;
  info1: string;
  info2: string;
}

export async function GET() {
  const db = getDb();
  const info = db.prepare("SELECT id, nama, alamat, info1, info2 FROM user_info LIMIT 1").get() as
    | UserInfoRow
    | undefined;

  // Scan available DB years
  const dbDir = path.join(process.cwd(), "src", "db");
  let dbYears: string[] = [];
  try {
    dbYears = fs
      .readdirSync(dbDir)
      .filter((f) => /^\d{4}$/.test(f))
      .sort()
      .reverse();
  } catch {
    dbYears = ["2026"];
  }

  return NextResponse.json({
    nama: info?.nama || "Jaya Prima",
    alamat: info?.alamat || "",
    info1: info?.info1 || "",
    info2: info?.info2 || "",
    dbYears,
    currentYear: "2026",
  });
}
