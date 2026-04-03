import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb, getFsBucket } from "@/lib/db";

export async function GET(request: NextRequest) {
  const db = await getDb();
  const row = await db.collection("user_info").findOne({ id: 1 }, { projection: { logoId: 1 } });

  if (!row?.logoId) {
    return NextResponse.redirect(new URL("/logo.png", request.url));
  }

  const bucket = await getFsBucket();
  try {
    const downloadStream = bucket.openDownloadStream(row.logoId as ObjectId);
    const chunks: Uint8Array[] = [];

    const buf: Buffer = await new Promise((resolve, reject) => {
      downloadStream.on("data", (chunk) => chunks.push(chunk));
      downloadStream.on("error", reject);
      downloadStream.on("end", () => resolve(Buffer.concat(chunks)));
    });

    let contentType = "image/jpeg";
    if (buf[0] === 0x89 && buf[1] === 0x50) {
      contentType = "image/png";
    } else if (buf[0] === 0x47 && buf[1] === 0x49) {
      contentType = "image/gif";
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
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.redirect(new URL("/logo.png", request.url));
  }
}
