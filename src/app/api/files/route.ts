import { NextResponse } from "next/server";
import { getFsDb } from "@/lib/db";

export async function GET() {
  const db = await getFsDb();
  const files = await db
    .collection("fs.files")
    .find({}, { projection: { "metadata.contentType": 1, filename: 1, length: 1, uploadDate: 1 } })
    .sort({ uploadDate: -1 })
    .toArray();

  return NextResponse.json(
    files.map((f) => ({
      id: f._id.toString(),
      filename: f.filename,
      contentType:
        (f.metadata as { contentType?: string })?.contentType || "application/octet-stream",
      size: f.length,
      uploadDate: f.uploadDate,
    }))
  );
}
