import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAccount } from "@/lib/member-auth";

// Get account profile with linked members
export async function GET() {
  try {
    const account = await getCurrentAccount();

    if (!account) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      id: account.id,
      name: account.name,
      email: account.email,
      phone: account.phone,
      emailVerified: account.emailVerified,
      club: account.club,
      members: account.members.map((m) => ({
        id: m.id,
        firstName: m.firstName,
        lastName: m.lastName,
        dateOfBirth: m.dateOfBirth,
        class: m.class,
        status: m.status,
        subscription: m.subscription
          ? {
              status: m.subscription.status,
              amount: m.subscription.amount,
              currentPeriodEnd: m.subscription.currentPeriodEnd,
            }
          : null,
        recentAttendance: m.attendances.map((a) => ({
          date: a.date,
          status: a.status,
          className: a.class.name,
        })),
      })),
    });
  } catch (error) {
    console.error("Get account profile error:", error);
    return NextResponse.json(
      { error: "Failed to get profile" },
      { status: 500 }
    );
  }
}

// Update account profile
export async function PATCH(request: NextRequest) {
  try {
    const account = await getCurrentAccount();

    if (!account) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone } = body;

    const updated = await prisma.memberAccount.update({
      where: { id: account.id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
      },
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
    });
  } catch (error) {
    console.error("Update account profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
