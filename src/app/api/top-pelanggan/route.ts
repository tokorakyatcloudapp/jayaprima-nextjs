import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = await getDb();
  const rows = await db
    .collection("v_top_pelanggan")
    .find({}, { projection: { _id: 0 } })
    .sort({ total_belanja: -1 })
    .toArray();

  return NextResponse.json(rows);
}
