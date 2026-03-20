import { NextResponse } from "next/server";
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

export async function GET() {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM v_pendapatan_harian").all() as PendapatanHarianRow[];

  return NextResponse.json(rows);
}
