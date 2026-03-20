import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

interface TopKategoriRow {
  id: number;
  kategori: string;
  total: number;
}

export async function GET() {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM v_top_kategori").all() as TopKategoriRow[];

  return NextResponse.json(rows);
}
