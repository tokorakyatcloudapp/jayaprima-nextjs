import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const db = await getDb();

  const filter = startDate && endDate ? { tanggal: { $gte: startDate, $lte: endDate } } : {};

  const rows = await db
    .collection("v_pendapatan_harian")
    .find(filter, { projection: { _id: 0 } })
    .sort({ tanggal: -1 })
    .toArray();

  return NextResponse.json(rows);
}
