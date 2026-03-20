import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

interface BerandaRow {
  hutang_pembelian: number;
  hutang_pelanggan: number;
  supplier: number;
  pelanggan: number;
  produk: number;
  admin_aktif: number;
}

export async function GET() {
  const db = getDb();
  const row = db.prepare("SELECT * FROM v_beranda").get() as BerandaRow | undefined;

  if (!row) {
    return NextResponse.json(
      {
        hutang_pembelian: 0,
        hutang_pelanggan: 0,
        supplier: 0,
        pelanggan: 0,
        produk: 0,
        admin_aktif: 0,
      },
      { status: 200 }
    );
  }

  return NextResponse.json(row);
}
