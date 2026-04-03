import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = await getDb();
  const row = await db.collection("v_beranda").findOne({});

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

  const { _id: _, ...data } = row;
  return NextResponse.json(data);
}
