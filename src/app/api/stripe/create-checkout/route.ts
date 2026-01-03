import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
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
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    const club = user.clubs[0];
    const body = await request.json();
    const { memberId, amount, planId } = body;

    if (!memberId || (!amount && !planId)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify member ownership
    const member = await prisma.member.findFirst({
      where: {
        id: memberId,
        clubId: club.id,
      },
      include: {
        membershipPlan: true,
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Determine amount from plan or direct input
    let finalAmount = amount;
    let planName = "Club Membership";
    let interval: "month" | "year" | "week" = "month";

    if (planId) {
      const plan = await prisma.membershipPlan.findFirst({
        where: { id: planId, clubId: club.id },
      });
      if (plan) {
        finalAmount = plan.amount;
        planName = plan.name;
        interval = plan.interval as "month" | "year" | "week";
      }
    } else if (member.membershipPlan) {
      finalAmount = member.membershipPlan.amount;
      planName = member.membershipPlan.name;
      interval = member.membershipPlan.interval as "month" | "year" | "week";
    }

    if (!finalAmount) {
      return NextResponse.json(
        { error: "Amount is required" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Build checkout session options
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `${planName} - ${member.firstName} ${member.lastName}`,
              description: `${interval === "month" ? "Monthly" : interval === "year" ? "Annual" : "Weekly"} membership subscription`,
            },
            unit_amount: finalAmount,
            recurring: {
              interval,
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${appUrl}/payments?success=true&memberId=${memberId}`,
      cancel_url: `${appUrl}/payments?canceled=true`,
      metadata: {
        memberId,
        clubId: club.id,
        planId: planId || member.membershipPlanId || "",
      },
      customer_email: member.contactEmail,
    };

    // If club has Stripe Connect, use their connected account
    if (club.stripeAccountId && club.stripeChargesEnabled) {
      // Add application fee for platform (10% platform fee)
      sessionParams.subscription_data = {
        application_fee_percent: 10,
      };

      // Create session on connected account
      const session = await stripe.checkout.sessions.create(sessionParams, {
        stripeAccount: club.stripeAccountId,
      });

      return NextResponse.json({ url: session.url, sessionId: session.id });
    }

    // Create regular checkout session (platform account)
    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
