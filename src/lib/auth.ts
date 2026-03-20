import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "jayaprima-secret-key-change-in-production"
);

const SESSION_COOKIE = "session";
const EXPIRATION_HOURS = 20;

export interface SessionPayload {
  userId: number;
  username: string;
  nama: string;
  levelAkses: number;
  exp: number;
}

export async function createSession(user: {
  id: number;
  username: string;
  nama: string;
  level_akses: number;
}): Promise<string> {
  const token = await new SignJWT({
    userId: user.id,
    username: user.username,
    nama: user.nama,
    levelAkses: user.level_akses,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${EXPIRATION_HOURS}h`)
    .sign(SECRET_KEY);

  return token;
}

export async function verifySession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);

  if (!session?.value) return null;

  try {
    const { payload } = await jwtVerify(session.value, SECRET_KEY);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export function getSessionCookieConfig(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: EXPIRATION_HOURS * 60 * 60,
  };
}
