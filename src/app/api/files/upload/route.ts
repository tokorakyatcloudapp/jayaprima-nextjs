import { NextRequest, NextResponse } from "next/server";
import { getFsBucket } from "@/lib/db";
import { Readable } from "stream";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const CHUNK_SIZE = 255 * 1024; // 255 KB (GridFS default)

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File exceeds 50 MB limit" }, { status: 400 });
  }

  const bucket = await getFsBucket();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload via chunked stream through GridFS
  const readableStream = new Readable();
  const uploadStream = bucket.openUploadStream(file.name, {
    chunkSizeBytes: CHUNK_SIZE,
    metadata: {
      contentType: file.type || "application/octet-stream",
      originalName: file.name,
      size: file.size,
    },
  });

  const uploadPromise = new Promise<void>((resolve, reject) => {
    uploadStream.on("finish", resolve);
    uploadStream.on("error", reject);
  });

  // Push buffer in chunks to ensure safe chunked writing
  let offset = 0;
  while (offset < buffer.length) {
    const end = Math.min(offset + CHUNK_SIZE, buffer.length);
    readableStream.push(buffer.subarray(offset, end));
    offset = end;
  }
  readableStream.push(null);
  readableStream.pipe(uploadStream);

  await uploadPromise;

  return NextResponse.json({
    id: uploadStream.id.toString(),
    filename: file.name,
    contentType: file.type || "application/octet-stream",
    size: file.size,
  });
}
