import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUserWithClub } from "@/lib/auth";

// Get all membership plans for the club
export async function GET() {
  try {
    const user = await ensureUserWithClub();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.clubs[0]) {
      return NextResponse.json({ error: "No club found" }, { status: 404 });
    }

    const plans = await prisma.membershipPlan.findMany({
      where: { clubId: user.clubs[0].id },
      include: {
        _count: {
          select: { members: true },
        },
      },
      orderBy: { amount: "asc" },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Get membership plans error:", error);
    return NextResponse.json(
      { error: "Failed to get membership plans" },
      { status: 500 }
    );
  }
}

// Create a new membership plan
export async function POST(request: NextRequest) {
  try {
    const user = await ensureUserWithClub();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.clubs[0]) {
      return NextResponse.json({ error: "No club found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, amount, interval } = body;

    if (!name || !amount) {
      return NextResponse.json(
        { error: "Name and amount are required" },
        { status: 400 }
      );
    }

    const plan = await prisma.membershipPlan.create({
      data: {
        name,
        description: description || null,
        amount: Math.round(amount), // Amount should already be in pence
        interval: interval || "month",
        clubId: user.clubs[0].id,
      },
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Create membership plan error:", error);
    return NextResponse.json(
      { error: "Failed to create membership plan" },
      { status: 500 }
    );
  }
}
