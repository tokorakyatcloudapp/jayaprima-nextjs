import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

interface FotoRow {
  foto: Buffer | null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const db = getDb();
  const row = db.prepare("SELECT foto FROM akun WHERE id = ?").get(Number(id)) as
    | FotoRow
    | undefined;

  if (!row?.foto) {
    return NextResponse.redirect(new URL("/asset/default_profil.jpg", request.url));
  }

  const buf = Buffer.from(row.foto);

  // Detect content type from magic bytes
  let contentType = "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50) {
    contentType = "image/png";
  }

  return new NextResponse(buf, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
