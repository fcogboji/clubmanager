import { NextResponse } from "next/server";
import { setCsrfCookie } from "@/lib/csrf";

// Get a CSRF token
export async function GET() {
  const token = await setCsrfCookie();
  return NextResponse.json({ token });
}
