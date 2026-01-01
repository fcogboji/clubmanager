import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import crypto from "crypto";
import { verifyCsrfToken } from "@/lib/csrf";

// Simple password hashing (in production, use bcrypt)
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Parent login
export async function POST(request: NextRequest) {
  try {
    // Verify CSRF token
    const csrfToken = request.headers.get("x-csrf-token");
    if (!(await verifyCsrfToken(csrfToken))) {
      return NextResponse.json(
        { error: "Invalid or expired security token. Please refresh and try again." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, clubSlug } = body;

    if (!email || !password || !clubSlug) {
      return NextResponse.json(
        { error: "Email, password, and club are required" },
        { status: 400 }
      );
    }

    // Find the club
    const club = await prisma.club.findUnique({
      where: { slug: clubSlug },
    });

    if (!club) {
      return NextResponse.json(
        { error: "Club not found" },
        { status: 404 }
      );
    }

    // Find parent account
    const parent = await prisma.parentAccount.findFirst({
      where: {
        email: email.toLowerCase(),
        clubId: club.id,
      },
      include: {
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!parent) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    if (!verifyPassword(password, parent.passwordHash)) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate session token and store in database
    const token = generateToken();
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.parentAccount.update({
      where: { id: parent.id },
      data: {
        sessionToken: token,
        sessionTokenExpiry: sessionExpiry,
      },
    });

    // Set cookie with session info
    const cookieStore = await cookies();
    cookieStore.set("parent_session", JSON.stringify({
      token,
      parentId: parent.id,
      clubId: club.id,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      parent: {
        id: parent.id,
        name: parent.name,
        email: parent.email,
        members: parent.members,
      },
    });
  } catch (error) {
    console.error("Parent login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}

// Parent logout
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("parent_session");

    // Invalidate session in database if cookie exists
    if (sessionCookie?.value) {
      try {
        const session = JSON.parse(sessionCookie.value);
        if (session.parentId) {
          await prisma.parentAccount.update({
            where: { id: session.parentId },
            data: {
              sessionToken: null,
              sessionTokenExpiry: null,
            },
          });
        }
      } catch {
        // Session parsing failed, just delete the cookie
      }
    }

    // Delete the session cookie
    cookieStore.delete("parent_session");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Parent logout error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}
