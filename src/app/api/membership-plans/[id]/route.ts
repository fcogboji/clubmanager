import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Get a single membership plan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { clubs: true },
    });

    if (!user || !user.clubs[0]) {
      return NextResponse.json({ error: "No club found" }, { status: 404 });
    }

    const plan = await prisma.membershipPlan.findFirst({
      where: {
        id,
        clubId: user.clubs[0].id,
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

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Get membership plan error:", error);
    return NextResponse.json(
      { error: "Failed to get membership plan" },
      { status: 500 }
    );
  }
}

// Update a membership plan
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { clubs: true },
    });

    if (!user || !user.clubs[0]) {
      return NextResponse.json({ error: "No club found" }, { status: 404 });
    }

    // Verify plan belongs to club
    const existingPlan = await prisma.membershipPlan.findFirst({
      where: {
        id,
        clubId: user.clubs[0].id,
      },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, amount, interval, isActive } = body;

    const plan = await prisma.membershipPlan.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(amount !== undefined && { amount: Math.round(amount) }),
        ...(interval !== undefined && { interval }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Update membership plan error:", error);
    return NextResponse.json(
      { error: "Failed to update membership plan" },
      { status: 500 }
    );
  }
}

// Delete a membership plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { clubs: true },
    });

    if (!user || !user.clubs[0]) {
      return NextResponse.json({ error: "No club found" }, { status: 404 });
    }

    // Verify plan belongs to club
    const existingPlan = await prisma.membershipPlan.findFirst({
      where: {
        id,
        clubId: user.clubs[0].id,
      },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    await prisma.membershipPlan.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete membership plan error:", error);
    return NextResponse.json(
      { error: "Failed to delete membership plan" },
      { status: 500 }
    );
  }
}
