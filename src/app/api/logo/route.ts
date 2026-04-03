import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { Binary } from "mongodb";

export async function GET(request: NextRequest) {
  const db = await getDb();
  const row = await db.collection("user_info").findOne({ id: 1 }, { projection: { logo: 1 } });

  if (!row?.logo) {
    return NextResponse.redirect(new URL("/logo.png", request.url));
  }

  const buf = Buffer.from(row.logo instanceof Binary ? row.logo.buffer : row.logo);

  let contentType = "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50) {
    contentType = "image/png";
  } else if (buf[0] === 0x47 && buf[1] === 0x49) {
    contentType = "image/gif";
  }

  return new NextResponse(buf, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
