import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const memberId = session.metadata?.memberId;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        if (memberId && subscriptionId && customerId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const amount = subscription.items.data[0]?.price?.unit_amount || 0;

          await prisma.subscription.upsert({
            where: { memberId },
            update: {
              stripeSubId: subscriptionId,
              stripeCustomerId: customerId,
              status: "active",
              amount,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
            create: {
              memberId,
              stripeSubId: subscriptionId,
              stripeCustomerId: customerId,
              status: "active",
              amount,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;

        const existingSub = await prisma.subscription.findUnique({
          where: { stripeSubId: subscriptionId },
        });

        if (existingSub) {
          await prisma.subscription.update({
            where: { stripeSubId: subscriptionId },
            data: {
              status: subscription.status === "active" ? "active" : subscription.status,
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;

        await prisma.subscription.update({
          where: { stripeSubId: subscriptionId },
          data: {
            status: "canceled",
          },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          await prisma.subscription.update({
            where: { stripeSubId: subscriptionId },
            data: {
              status: "past_due",
            },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
