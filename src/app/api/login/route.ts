import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { createSession, getSessionCookieConfig } from "@/lib/auth";
import { getDb } from "@/lib/db";

interface AkunRow {
  id: number;
  username: string;
  nama: string;
  level_akses: number;
  isActive: number;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json({ error: "Username dan password harus diisi" }, { status: 400 });
  }

  const db = getDb();
  const md5Pass = createHash("md5").update(password).digest("hex");

  const akun = db
    .prepare(
      "SELECT id, username, nama, level_akses, isActive FROM akun WHERE username = ? AND password = ?"
    )
    .get(username, md5Pass) as AkunRow | undefined;

  if (!akun) {
    return NextResponse.json({ error: "Username atau Password tidak valid" }, { status: 401 });
  }

  if (!akun.isActive) {
    return NextResponse.json({ error: "Akun dinonaktifkan" }, { status: 403 });
  }

  const token = await createSession(akun);
  const cookieConfig = getSessionCookieConfig(token);

  const response = NextResponse.json({ success: true });
  response.cookies.set(cookieConfig);

  return response;
}
