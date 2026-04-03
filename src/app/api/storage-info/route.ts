import { getDb, getFsDb } from "@/lib/db";
import { NextResponse } from "next/server";

const PLAN_LIMIT = 512 * 1_048_576; // 500 MB free plan

function formatSize(bytes: number): string {
  if (bytes >= 1_073_741_824) return (bytes / 1_073_741_824).toFixed(2) + " GB";
  if (bytes >= 1_048_576) return (bytes / 1_048_576).toFixed(2) + " MB";
  return (bytes / 1024).toFixed(2) + " KB";
}

function buildDbInfo(stats: Record<string, number | undefined>, label: string) {
  const dataSize = stats.dataSize ?? 0;
  const storageSize = stats.storageSize ?? 0;
  const indexSize = stats.indexSize ?? 0;
  const usedBytes = dataSize + indexSize;
  const freeBytes = Math.max(PLAN_LIMIT - usedBytes, 0);
  const percentUsed = PLAN_LIMIT > 0 ? Math.round((usedBytes / PLAN_LIMIT) * 100 * 100) / 100 : 0;
  const percentFree = PLAN_LIMIT > 0 ? Math.round((freeBytes / PLAN_LIMIT) * 100 * 100) / 100 : 0;

  return {
    label,
    labelTotal: formatSize(PLAN_LIMIT),
    labelUsed: formatSize(usedBytes),
    labelFree: formatSize(freeBytes),
    dataSize: formatSize(dataSize),
    storageSize: formatSize(storageSize),
    indexSize: formatSize(indexSize),
    percentUsed,
    percentFree,
    isLowSpace: freeBytes < 100 * 1_048_576,
  };
}

export async function GET() {
  const db = await getDb();
  const primaryStats = (await db.stats()) as Record<string, number | undefined>;
  const primary = buildDbInfo(primaryStats, "Database");

  let files = null;
  try {
    const fsDb = await getFsDb();
    const fsStats = (await fsDb.stats()) as Record<string, number | undefined>;
    files = buildDbInfo(fsStats, "File");
  } catch (err) {
    console.error("storage-info: fsDb stats failed", err);
  }

  return NextResponse.json({ databases: [primary, ...(files ? [files] : [])] });
}
