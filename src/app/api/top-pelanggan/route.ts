import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

interface TopPelangganRow {
  id: number;
  nama_pelanggan: string;
  total_belanja: number;
}

export async function GET() {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM v_top_pelanggan").all() as TopPelangganRow[];

  return NextResponse.json(rows);
}
