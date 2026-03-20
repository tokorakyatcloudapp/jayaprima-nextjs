import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

interface LogoRow {
  logo: Buffer | null;
}

export async function GET(request: NextRequest) {
  const db = getDb();
  const row = db.prepare("SELECT logo FROM user_info WHERE id = 1").get() as LogoRow | undefined;

  if (!row?.logo) {
    return NextResponse.redirect(new URL("/logo.png", request.url));
  }

  const buf = Buffer.from(row.logo);

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
