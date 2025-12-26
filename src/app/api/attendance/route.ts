import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

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
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const classId = searchParams.get("classId");
    const date = searchParams.get("date");

    const attendance = await prisma.attendance.findMany({
      where: {
        ...(classId && { classId }),
        ...(date && { date: new Date(date) }),
        class: {
          clubId: user.clubs[0].id,
        },
      },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Attendance GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    const body = await request.json();
    const { classId, date, attendance } = body;

    if (!classId || !date || !attendance) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify class ownership
    const classData = await prisma.class.findFirst({
      where: {
        id: classId,
        clubId: user.clubs[0].id,
      },
    });

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Upsert attendance records
    const results = await Promise.all(
      attendance.map(
        async (record: { memberId: string; status: string }) => {
          return prisma.attendance.upsert({
            where: {
              memberId_classId_date: {
                memberId: record.memberId,
                classId,
                date: attendanceDate,
              },
            },
            update: {
              status: record.status,
            },
            create: {
              memberId: record.memberId,
              classId,
              date: attendanceDate,
              status: record.status,
            },
          });
        }
      )
    );

    return NextResponse.json(results, { status: 201 });
  } catch (error) {
    console.error("Attendance POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
