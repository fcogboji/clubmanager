import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUserWithClub } from "@/lib/auth";

export async function GET() {
  try {
    const user = await ensureUserWithClub();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.clubs[0]) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    const clubId = user.clubs[0].id;

    const classes = await prisma.class.findMany({
      where: { clubId },
      include: {
        _count: {
          select: { members: true },
        },
      },
      orderBy: [
        { day: "asc" },
        { time: "asc" },
      ],
    });

    return NextResponse.json(classes);
  } catch (error) {
    console.error("Classes GET error:", error);
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

    const { name, day, time } = body;

    if (!name || !day || !time) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        day,
        time,
        clubId,
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error("Classes POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
