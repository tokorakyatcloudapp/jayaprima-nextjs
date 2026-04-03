import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = await getDb();
  const info = await db
    .collection("user_info")
    .findOne({}, { projection: { _id: 0, id: 1, nama: 1, alamat: 1, info1: 1, info2: 1 } });

  // List available DB years by checking existing databases
  let dbYears: string[] = [];
  try {
    const client = db.client;
    const adminDb = client.db("admin");
    const databases = await adminDb.admin().listDatabases();
    dbYears = databases.databases
      .map((d) => d.name)
      .filter((name) => /^jayaprima_\d{4}$/.test(name))
      .map((name) => name.replace("jayaprima_", ""))
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
