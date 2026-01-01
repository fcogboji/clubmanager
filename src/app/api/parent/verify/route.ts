import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Verify parent email
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    const clubSlug = request.nextUrl.searchParams.get("club");

    if (!token || !clubSlug) {
      return NextResponse.redirect(
        new URL(`/portal/${clubSlug || ""}?error=invalid_token`, request.url)
      );
    }

    // Find the club
    const club = await prisma.club.findUnique({
      where: { slug: clubSlug },
    });

    if (!club) {
      return NextResponse.redirect(
        new URL(`/portal/${clubSlug}?error=club_not_found`, request.url)
      );
    }

    // Find parent with matching verify token
    const parent = await prisma.parentAccount.findFirst({
      where: {
        verifyToken: token,
        clubId: club.id,
        emailVerified: false,
      },
    });

    if (!parent) {
      return NextResponse.redirect(
        new URL(`/portal/${clubSlug}?error=invalid_or_expired_token`, request.url)
      );
    }

    // Mark email as verified and clear the token
    await prisma.parentAccount.update({
      where: { id: parent.id },
      data: {
        emailVerified: true,
        verifyToken: null,
      },
    });

    // Redirect to login with success message
    return NextResponse.redirect(
      new URL(`/portal/${clubSlug}?verified=true`, request.url)
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(
      new URL("/portal?error=verification_failed", request.url)
    );
  }
}

// Resend verification email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, clubSlug } = body;

    if (!email || !clubSlug) {
      return NextResponse.json(
        { error: "Email and club are required" },
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
    });

    if (!parent) {
      // Don't reveal if account exists
      return NextResponse.json({
        success: true,
        message: "If an account exists, a verification email will be sent.",
      });
    }

    if (parent.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "Email is already verified.",
      });
    }

    // Generate new verification token
    const crypto = await import("crypto");
    const verifyToken = crypto.randomBytes(32).toString("hex");

    await prisma.parentAccount.update({
      where: { id: parent.id },
      data: { verifyToken },
    });

    // Send verification email
    const { sendParentVerificationEmail } = await import("@/lib/email");
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/parent/verify?token=${verifyToken}&club=${clubSlug}`;

    await sendParentVerificationEmail({
      to: parent.email,
      parentName: parent.name,
      clubName: club.name,
      verificationUrl,
    });

    return NextResponse.json({
      success: true,
      message: "Verification email sent.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Failed to resend verification email" },
      { status: 500 }
    );
  }
}
