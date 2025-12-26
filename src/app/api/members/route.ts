import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUserWithClub } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await ensureUserWithClub();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.clubs[0]) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    const clubId = user.clubs[0].id;
    const searchParams = request.nextUrl.searchParams;
    const includeSubscription = searchParams.get("include") === "subscription";

    const members = await prisma.member.findMany({
      where: { clubId },
      include: {
        class: true,
        subscription: includeSubscription,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data for API response
    if (includeSubscription) {
      return NextResponse.json(
        members.map((m: typeof members[number]) => ({
          id: m.id,
          member: {
            id: m.id,
            firstName: m.firstName,
            lastName: m.lastName,
          },
          subscription: m.subscription,
        }))
      );
    }

    return NextResponse.json(members);
  } catch (error) {
    console.error("Members GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await ensureUserWithClub();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.clubs[0]) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    const clubId = user.clubs[0].id;
    const body = await request.json();

    const { firstName, lastName, parentName, parentEmail, parentPhone, classId, photoUrl } = body;

    if (!firstName || !lastName || !parentName || !parentEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const member = await prisma.member.create({
      data: {
        firstName,
        lastName,
        parentName,
        parentEmail,
        parentPhone: parentPhone || null,
        photoUrl: photoUrl || null,
        clubId,
        classId: classId || null,
      },
      include: {
        class: true,
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Members POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
