import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { execSync } from "node:child_process";

function formatSize(bytes: number): string {
  if (bytes >= 1_073_741_824) return (bytes / 1_073_741_824).toFixed(2) + " GB";
  if (bytes >= 1_048_576) return (bytes / 1_048_576).toFixed(2) + " MB";
  return (bytes / 1024).toFixed(2) + " KB";
}

function getDiskSpace(targetPath: string): { total: number; used: number; free: number } {
  try {
    const output = execSync(`df -k "${targetPath}"`).toString();
    const lines = output.trim().split("\n");
    const parts = lines[1].trim().split(/\s+/);
    const total = Number.parseInt(parts[1]) * 1024;
    const available = Number.parseInt(parts[3]) * 1024;
    const used = total - available;
    return { total, used, free: available };
  } catch {
    return { total: 0, used: 0, free: 0 };
  }
}

export async function GET() {
  const db = getDb();
  // Get the database file path to determine which disk to check
  const dbPath = (db as unknown as { name: string }).name ?? process.cwd();

  const { total, used, free } = getDiskSpace(dbPath);

  const percentUsed = total > 0 ? Math.round((used / total) * 100 * 100) / 100 : 0;
  const percentFree = total > 0 ? Math.round((free / total) * 100 * 100) / 100 : 0;
  const isLowSpace = free < 100 * 1_048_576; // < 100 MB

  return NextResponse.json({
    labelTotal: formatSize(total),
    labelUsed: formatSize(used),
    labelFree: formatSize(free),
    percentUsed,
    percentFree,
    isLowSpace,
  });
}
