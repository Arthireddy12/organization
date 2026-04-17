import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const AUTH_COOKIE_NAME = "hrms_auth_token";
const encoder = new TextEncoder();

export type SessionPayload = {
  userId: string;
  email: string;
  role: string;
};

function getJwtSecret() {
  return encoder.encode(process.env.JWT_SECRET || "dev-only-secret-change-me");
}

export async function signSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret());
  return payload as unknown as SessionPayload;
}

export async function getSessionFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export function getAuthCookieName() {
  return AUTH_COOKIE_NAME;
}
