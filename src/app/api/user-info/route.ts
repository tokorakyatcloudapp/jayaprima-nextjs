import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb, getFsBucket } from "@/lib/db";
import { verifySession } from "@/lib/auth";

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

export async function PUT(req: NextRequest) {
  const session = await verifySession();
  if (session?.levelAkses !== 0) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const formData = await req.formData();
  const nama = formData.get("nama") as string | null;
  const alamat = formData.get("alamat") as string | null;
  const info1 = formData.get("info1") as string | null;
  const info2 = formData.get("info2") as string | null;
  const logoFile = formData.get("logo") as File | null;

  const update: Record<string, string | ObjectId> = {};
  if (nama !== null) update.nama = nama;
  if (alamat !== null) update.alamat = alamat;
  if (info1 !== null) update.info1 = info1;
  if (info2 !== null) update.info2 = info2;

  let newLogoId: ObjectId | null = null;

  if (logoFile && logoFile.size > 0) {
    const bucket = await getFsBucket();
    const uploadStream = bucket.openUploadStream("logo", {
      contentType: logoFile.type || "application/octet-stream",
    });
    const buf = Buffer.from(await logoFile.arrayBuffer());
    await new Promise<void>((resolve, reject) => {
      uploadStream.on("error", reject);
      uploadStream.on("finish", () => resolve());
      uploadStream.end(buf);
    });
    newLogoId = uploadStream.id as ObjectId;
    update.logoId = newLogoId;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Tidak ada perubahan" }, { status: 400 });
  }

  const db = await getDb();
  const existing = await db
    .collection("user_info")
    .findOne({ id: 1 }, { projection: { logoId: 1 } });
  await db.collection("user_info").updateOne({ id: 1 }, { $set: update });

  if (newLogoId && existing?.logoId) {
    try {
      const bucket = await getFsBucket();
      await bucket.delete(existing.logoId as ObjectId);
    } catch {
      // ignore cleanup failures
    }
  }

  return NextResponse.json({ result: true });
}
