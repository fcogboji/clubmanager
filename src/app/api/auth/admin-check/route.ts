import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";

export async function GET() {
  try {
    const adminStatus = await isAdmin();
    return NextResponse.json({ isAdmin: adminStatus });
  } catch {
    return NextResponse.json({ isAdmin: false });
  }
}
