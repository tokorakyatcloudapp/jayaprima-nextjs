import { NextRequest, NextResponse } from "next/server";
import { getFsBucket, getFsDb } from "@/lib/db";
import { ObjectId } from "mongodb";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Preview / Download
export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
  }

  const objectId = new ObjectId(id);
  const db = await getFsDb();
  const fileMeta = await db.collection("fs.files").findOne({ _id: objectId });

  if (!fileMeta) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const contentType =
    (fileMeta.metadata as { contentType?: string })?.contentType || "application/octet-stream";
  const filename = fileMeta.filename || "download";

  // Check if client wants download or preview (inline)
  const mode = request.nextUrl.searchParams.get("mode");
  const disposition = mode === "download" ? `attachment; filename="${filename}"` : "inline";

  const bucket = await getFsBucket();

  // Stream chunks from GridFS into a buffer
  const downloadStream = bucket.openDownloadStream(objectId);
  const chunks: Buffer[] = [];

  await new Promise<void>((resolve, reject) => {
    downloadStream.on("data", (chunk: Buffer) => chunks.push(chunk));
    downloadStream.on("end", resolve);
    downloadStream.on("error", reject);
  });

  const fileBuffer = Buffer.concat(chunks);

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": disposition,
      "Content-Length": fileBuffer.length.toString(),
      "Cache-Control": "public, max-age=3600",
    },
  });
}

// Delete
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
  }

  const objectId = new ObjectId(id);
  const bucket = await getFsBucket();

  // Verify file exists
  const db = await getFsDb();
  const fileMeta = await db.collection("fs.files").findOne({ _id: objectId });

  if (!fileMeta) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // GridFS delete removes both fs.files and fs.chunks entries
  await bucket.delete(objectId);

  return NextResponse.json({ success: true, id });
}
