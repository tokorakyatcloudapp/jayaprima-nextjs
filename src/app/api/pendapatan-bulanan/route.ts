import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = await getDb();
  const rows = await db
    .collection("v_pendapatan_bulanan")
    .find({}, { projection: { _id: 0 } })
    .toArray();

  return NextResponse.json(rows);
}
