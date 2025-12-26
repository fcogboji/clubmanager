import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function generateVerifyToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

// Parent registration (invited by club admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, phone, clubSlug, inviteToken } = body;

    if (!email || !password || !name || !clubSlug) {
      return NextResponse.json(
        { error: "Email, password, name, and club are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
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

    // Check if parent already exists for this club
    const existingParent = await prisma.parentAccount.findFirst({
      where: {
        email: email.toLowerCase(),
        clubId: club.id,
      },
    });

    if (existingParent) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Find members with this parent email to link
    const membersToLink = await prisma.member.findMany({
      where: {
        clubId: club.id,
        parentEmail: email.toLowerCase(),
        parentAccountId: null,
      },
      select: { id: true },
    });

    // Create parent account
    const verifyToken = generateVerifyToken();
    const parent = await prisma.parentAccount.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: hashPassword(password),
        name,
        phone: phone || null,
        verifyToken,
        clubId: club.id,
      },
    });

    // Link existing members to this parent account
    if (membersToLink.length > 0) {
      await prisma.member.updateMany({
        where: {
          id: { in: membersToLink.map((m) => m.id) },
        },
        data: {
          parentAccountId: parent.id,
        },
      });
    }

    // TODO: Send verification email

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      linkedMembers: membersToLink.length,
    });
  } catch (error) {
    console.error("Parent registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
