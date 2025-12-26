import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Get sessions for the club
export async function GET(request: NextRequest) {
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
      return NextResponse.json({ error: "No club found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const upcoming = searchParams.get("upcoming") === "true";

    interface SessionWhere {
      clubId: string;
      classId?: string;
      date?: { gte?: Date; lte?: Date };
    }

    const where: SessionWhere = { clubId: user.clubs[0].id };

    if (classId) {
      where.classId = classId;
    }

    if (startDate || endDate || upcoming) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
      if (upcoming) {
        where.date.gte = new Date();
      }
    }

    const sessions = await prisma.session.findMany({
      where,
      include: {
        class: {
          select: { id: true, name: true },
        },
        _count: {
          select: { attendances: true },
        },
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Get sessions error:", error);
    return NextResponse.json(
      { error: "Failed to get sessions" },
      { status: 500 }
    );
  }
}

// Create a new session
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
      return NextResponse.json({ error: "No club found" }, { status: 404 });
    }

    const clubId = user.clubs[0].id;
    const body = await request.json();
    const { title, description, date, startTime, endTime, location, classId } = body;

    if (!title || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Title, date, start time, and end time are required" },
        { status: 400 }
      );
    }

    // Verify class belongs to club if provided
    if (classId) {
      const classExists = await prisma.class.findFirst({
        where: { id: classId, clubId },
      });
      if (!classExists) {
        return NextResponse.json(
          { error: "Class not found" },
          { status: 404 }
        );
      }
    }

    const session = await prisma.session.create({
      data: {
        title,
        description: description || null,
        date: new Date(date),
        startTime,
        endTime,
        location: location || null,
        classId: classId || null,
        clubId,
      },
      include: {
        class: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("Create session error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
