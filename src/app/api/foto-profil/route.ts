import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { Binary } from "mongodb";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const db = await getDb();
  const row = await db.collection("akun").findOne({ id: Number(id) }, { projection: { foto: 1 } });

  if (!row?.foto) {
    return NextResponse.redirect(new URL("/asset/default_profil.jpg", request.url));
  }

  const buf = Buffer.from(row.foto instanceof Binary ? row.foto.buffer : row.foto);

  let contentType = "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50) {
    contentType = "image/png";
  }

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(buf));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(buf.length),
      "Cache-Control": "public, max-age=3600",
    },
  });
}
