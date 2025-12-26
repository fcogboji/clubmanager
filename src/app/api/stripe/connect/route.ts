import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// Create Stripe Connect account and return onboarding URL
export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { clubs: true },
    });

    if (!user || !user.clubs[0]) {
      return NextResponse.json({ error: "No club found" }, { status: 404 });
    }

    const club = user.clubs[0];

    // If club already has a Stripe account, return the dashboard link
    if (club.stripeAccountId) {
      // Check if already onboarded
      const account = await stripe.accounts.retrieve(club.stripeAccountId);

      if (account.details_submitted) {
        // Create a login link for existing connected accounts
        const loginLink = await stripe.accounts.createLoginLink(club.stripeAccountId);
        return NextResponse.json({ url: loginLink.url, isLogin: true });
      }

      // Otherwise create a new onboarding link
      const accountLink = await stripe.accountLinks.create({
        account: club.stripeAccountId,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?stripe=refresh`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?stripe=success`,
        type: "account_onboarding",
      });

      return NextResponse.json({ url: accountLink.url, isLogin: false });
    }

    // Create new Stripe Connect account
    const account = await stripe.accounts.create({
      type: "standard",
      email: user.email,
      metadata: {
        clubId: club.id,
        userId: user.id,
      },
    });

    // Update club with Stripe account ID
    await prisma.club.update({
      where: { id: club.id },
      data: { stripeAccountId: account.id },
    });

    // Create account onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?stripe=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?stripe=success`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url, isLogin: false });
  } catch (error) {
    console.error("Stripe Connect error:", error);
    return NextResponse.json(
      { error: "Failed to create Stripe Connect account" },
      { status: 500 }
    );
  }
}

// Get Stripe Connect account status
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { clubs: true },
    });

    if (!user || !user.clubs[0]) {
      return NextResponse.json({ error: "No club found" }, { status: 404 });
    }

    const club = user.clubs[0];

    if (!club.stripeAccountId) {
      return NextResponse.json({
        connected: false,
        onboarded: false,
        chargesEnabled: false,
        detailsSubmitted: false,
      });
    }

    // Get account status from Stripe
    const account = await stripe.accounts.retrieve(club.stripeAccountId);

    // Update club with latest status
    await prisma.club.update({
      where: { id: club.id },
      data: {
        stripeOnboarded: account.details_submitted,
        stripeDetailsSubmitted: account.details_submitted,
        stripeChargesEnabled: account.charges_enabled,
      },
    });

    return NextResponse.json({
      connected: true,
      onboarded: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      detailsSubmitted: account.details_submitted,
      accountId: club.stripeAccountId,
    });
  } catch (error) {
    console.error("Get Stripe status error:", error);
    return NextResponse.json(
      { error: "Failed to get Stripe status" },
      { status: 500 }
    );
  }
}
