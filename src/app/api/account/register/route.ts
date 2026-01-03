import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { verifyCsrfToken } from "@/lib/csrf";
import { sendVerificationEmail } from "@/lib/email";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function generateVerifyToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

// Member account registration
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
    const { email, password, name, phone, clubSlug } = body;

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

    // Check if account already exists for this club
    const existingAccount = await prisma.memberAccount.findFirst({
      where: {
        email: email.toLowerCase(),
        clubId: club.id,
      },
    });

    if (existingAccount) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Find members with this contact email to link
    const membersToLink = await prisma.member.findMany({
      where: {
        clubId: club.id,
        contactEmail: email.toLowerCase(),
        memberAccountId: null,
      },
      select: { id: true },
    });

    // Create member account
    const verifyToken = generateVerifyToken();
    const account = await prisma.memberAccount.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: hashPassword(password),
        name,
        phone: phone || null,
        verifyToken,
        clubId: club.id,
      },
    });

    // Link existing members to this account
    if (membersToLink.length > 0) {
      await prisma.member.updateMany({
        where: {
          id: { in: membersToLink.map((m) => m.id) },
        },
        data: {
          memberAccountId: account.id,
        },
      });
    }

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/account/verify?token=${verifyToken}&club=${clubSlug}`;
    await sendVerificationEmail({
      to: email,
      name: name,
      clubName: club.name,
      verificationUrl,
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully. Please check your email to verify your account.",
      linkedMembers: membersToLink.length,
    });
  } catch (error) {
    console.error("Account registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
