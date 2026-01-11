import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";
import Stripe from "stripe";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function generateVerifyToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

interface RegisterRequest {
  clubSlug: string;
  member: {
    firstName: string;
    lastName: string;
    contactName: string;
    contactEmail: string;
    contactPhone?: string;
    classId?: string | null;
    membershipPlanId?: string | null;
  };
  account: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  };
}

// Public registration endpoint - no CSRF required for public form
export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { clubSlug, member, account } = body;

    // Validate required fields
    if (!clubSlug || !member || !account) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (
      !member.firstName ||
      !member.lastName ||
      !member.contactName ||
      !member.contactEmail
    ) {
      return NextResponse.json(
        { error: "Member information is incomplete" },
        { status: 400 }
      );
    }

    if (!account.email || !account.password || !account.name) {
      return NextResponse.json(
        { error: "Account information is incomplete" },
        { status: 400 }
      );
    }

    if (account.password.length < 8) {
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
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // Check if account already exists for this club
    const existingAccount = await prisma.memberAccount.findFirst({
      where: {
        email: account.email.toLowerCase(),
        clubId: club.id,
      },
    });

    if (existingAccount) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    // Validate class if provided
    if (member.classId) {
      const classExists = await prisma.class.findFirst({
        where: { id: member.classId, clubId: club.id, status: "active" },
      });
      if (!classExists) {
        return NextResponse.json(
          { error: "Selected class is not available" },
          { status: 400 }
        );
      }
    }

    // Validate and get membership plan if provided
    let membershipPlan = null;
    if (member.membershipPlanId) {
      membershipPlan = await prisma.membershipPlan.findFirst({
        where: { id: member.membershipPlanId, clubId: club.id, isActive: true },
      });
      if (!membershipPlan) {
        return NextResponse.json(
          { error: "Selected membership plan is not available" },
          { status: 400 }
        );
      }
    }

    // Create member account
    const verifyToken = generateVerifyToken();
    const memberAccount = await prisma.memberAccount.create({
      data: {
        email: account.email.toLowerCase(),
        passwordHash: hashPassword(account.password),
        name: account.name,
        phone: account.phone || null,
        verifyToken,
        clubId: club.id,
      },
    });

    // Create member record
    const newMember = await prisma.member.create({
      data: {
        firstName: member.firstName,
        lastName: member.lastName,
        contactName: member.contactName,
        contactEmail: member.contactEmail.toLowerCase(),
        contactPhone: member.contactPhone || null,
        clubId: club.id,
        classId: member.classId || null,
        membershipPlanId: member.membershipPlanId || null,
        memberAccountId: memberAccount.id,
        status: "active",
      },
    });

    // Send verification email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationUrl = `${appUrl}/api/account/verify?token=${verifyToken}&club=${clubSlug}`;
    await sendVerificationEmail({
      to: account.email,
      name: account.name,
      clubName: club.name,
      verificationUrl,
    });

    // If there's a paid plan and club has Stripe set up, create checkout session
    if (membershipPlan && club.stripeAccountId && club.stripeChargesEnabled) {
      const interval = membershipPlan.interval as "month" | "year" | "week";

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: {
                name: `${membershipPlan.name} - ${member.firstName} ${member.lastName}`,
                description: `${
                  interval === "month"
                    ? "Monthly"
                    : interval === "year"
                    ? "Annual"
                    : "Weekly"
                } membership subscription`,
              },
              unit_amount: membershipPlan.amount,
              recurring: {
                interval,
              },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${appUrl}/portal/${clubSlug}?payment=success`,
        cancel_url: `${appUrl}/join/${clubSlug}?payment=canceled`,
        metadata: {
          memberId: newMember.id,
          clubId: club.id,
          planId: membershipPlan.id,
          source: "public_registration",
        },
        customer_email: member.contactEmail,
        subscription_data: {
          application_fee_percent: 10,
        },
      };

      const session = await stripe.checkout.sessions.create(sessionParams, {
        stripeAccount: club.stripeAccountId,
      });

      return NextResponse.json({
        success: true,
        message: "Registration successful. Redirecting to payment.",
        memberId: newMember.id,
        checkoutUrl: session.url,
      });
    }

    // No payment required - return success
    return NextResponse.json({
      success: true,
      message:
        "Registration successful. Please check your email to verify your account.",
      memberId: newMember.id,
    });
  } catch (error) {
    console.error("Public registration error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
