import crypto from "crypto";
import { cookies } from "next/headers";

const CSRF_TOKEN_NAME = "csrf_token";
const CSRF_SECRET = process.env.CSRF_SECRET || crypto.randomBytes(32).toString("hex");

export function generateCsrfToken(): string {
  const timestamp = Date.now().toString();
  const randomBytes = crypto.randomBytes(16).toString("hex");
  const data = `${timestamp}:${randomBytes}`;
  const signature = crypto
    .createHmac("sha256", CSRF_SECRET)
    .update(data)
    .digest("hex");
  return `${data}:${signature}`;
}

export function validateCsrfToken(token: string): boolean {
  if (!token) return false;

  const parts = token.split(":");
  if (parts.length !== 3) return false;

  const [timestamp, randomBytes, signature] = parts;
  const data = `${timestamp}:${randomBytes}`;

  // Verify signature
  const expectedSignature = crypto
    .createHmac("sha256", CSRF_SECRET)
    .update(data)
    .digest("hex");

  // Check length first to avoid timingSafeEqual error with different lengths
  if (signature.length !== expectedSignature.length) {
    return false;
  }

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return false;
  }

  // Check token age (valid for 1 hour)
  const tokenAge = Date.now() - parseInt(timestamp, 10);
  const ONE_HOUR = 60 * 60 * 1000;
  if (tokenAge > ONE_HOUR) {
    return false;
  }

  return true;
}

export async function setCsrfCookie(): Promise<string> {
  const token = generateCsrfToken();
  const cookieStore = await cookies();

  cookieStore.set(CSRF_TOKEN_NAME, token, {
    httpOnly: false, // Needs to be readable by JavaScript to include in requests
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60, // 1 hour
    path: "/",
  });

  return token;
}

export async function getCsrfTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_TOKEN_NAME)?.value || null;
}

export async function verifyCsrfToken(headerToken: string | null): Promise<boolean> {
  if (!headerToken) return false;

  const cookieToken = await getCsrfTokenFromCookie();
  if (!cookieToken) return false;

  // Token must match and be valid
  if (headerToken !== cookieToken) return false;

  return validateCsrfToken(headerToken);
}
