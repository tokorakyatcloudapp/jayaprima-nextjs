import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

interface PendapatanHarianRow {
  tanggal: string;
  kas_kotor: number;
  phutang_kotor: number;
  kas_modal: number;
  phutang_modal: number;
  kas_bersih: number;
  phutang_bersih: number;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const db = getDb();

  let rows: PendapatanHarianRow[];
  if (startDate && endDate) {
    rows = db
      .prepare("SELECT * FROM v_pendapatan_harian WHERE tanggal BETWEEN ? AND ?")
      .all(startDate, endDate) as PendapatanHarianRow[];
  } else {
    rows = db.prepare("SELECT * FROM v_pendapatan_harian").all() as PendapatanHarianRow[];
  }

  return NextResponse.json(rows);
}
