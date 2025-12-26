import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getDayOfWeek } from "@/lib/utils";

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
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    const clubId = user.clubs[0].id;
    const today = getDayOfWeek();

    // Get all stats in parallel
    const [totalMembers, membersWithSubscriptions, todayClasses, totalRevenue] = await Promise.all([
      // Total members
      prisma.member.count({
        where: { clubId },
      }),

      // Members with subscriptions
      prisma.member.findMany({
        where: { clubId },
        include: {
          subscription: true,
        },
      }),

      // Today's classes
      prisma.class.findMany({
        where: {
          clubId,
          day: today,
        },
        select: {
          id: true,
          name: true,
          day: true,
          time: true,
        },
      }),

      // Total monthly revenue
      prisma.subscription.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          status: "active",
          member: {
            clubId,
          },
        },
      }),
    ]);

    const paidMembers = membersWithSubscriptions.filter(
      (m) => m.subscription?.status === "active"
    ).length;

    const unpaidMembers = totalMembers - paidMembers;

    return NextResponse.json({
      totalMembers,
      paidMembers,
      unpaidMembers,
      totalRevenue: totalRevenue._sum.amount || 0,
      todayClasses,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
