import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentParent } from "@/lib/parent-auth";

// Get parent profile with linked members
export async function GET() {
  try {
    const parent = await getCurrentParent();

    if (!parent) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      id: parent.id,
      name: parent.name,
      email: parent.email,
      phone: parent.phone,
      emailVerified: parent.emailVerified,
      club: parent.club,
      members: parent.members.map((m) => ({
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
    console.error("Get parent profile error:", error);
    return NextResponse.json(
      { error: "Failed to get profile" },
      { status: 500 }
    );
  }
}

// Update parent profile
export async function PATCH(request: NextRequest) {
  try {
    const parent = await getCurrentParent();

    if (!parent) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone } = body;

    const updated = await prisma.parentAccount.update({
      where: { id: parent.id },
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
    console.error("Update parent profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
