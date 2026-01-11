import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint to get club info for registration
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const club = await prisma.club.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        description: true,
        logoUrl: true,
        phone: true,
        email: true,
        address: true,
        website: true,
        stripeOnboarded: true,
      },
    });

    if (!club) {
      return NextResponse.json(
        { error: "Club not found" },
        { status: 404 }
      );
    }

    // Get active classes
    const classes = await prisma.class.findMany({
      where: {
        clubId: club.id,
        status: "active",
      },
      select: {
        id: true,
        name: true,
        day: true,
        time: true,
        _count: {
          select: { members: true },
        },
      },
      orderBy: { name: "asc" },
    });

    // Get active membership plans
    const plans = await prisma.membershipPlan.findMany({
      where: {
        clubId: club.id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        amount: true,
        interval: true,
      },
      orderBy: { amount: "asc" },
    });

    return NextResponse.json({
      club,
      classes,
      plans,
    });
  } catch (error) {
    console.error("Error fetching public club info:", error);
    return NextResponse.json(
      { error: "Failed to fetch club information" },
      { status: 500 }
    );
  }
}
