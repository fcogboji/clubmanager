import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Get attendance reports and analytics
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

    const clubId = user.clubs[0].id;
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const memberId = searchParams.get("memberId");
    const period = searchParams.get("period") || "month"; // week, month, year, all
    const reportType = searchParams.get("type") || "summary"; // summary, member, class

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0); // All time
    }

    interface AttendanceWhere {
      member: { clubId: string };
      date: { gte: Date };
      classId?: string;
      memberId?: string;
    }

    const attendanceWhere: AttendanceWhere = {
      member: { clubId },
      date: { gte: startDate },
    };

    if (classId) {
      attendanceWhere.classId = classId;
    }

    if (memberId) {
      attendanceWhere.memberId = memberId;
    }

    // Get attendance records
    const attendances = await prisma.attendance.findMany({
      where: attendanceWhere,
      include: {
        member: {
          select: { id: true, firstName: true, lastName: true },
        },
        class: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: "desc" },
    });

    // Calculate stats
    const totalRecords = attendances.length;
    const presentCount = attendances.filter((a) => a.status === "present").length;
    const absentCount = attendances.filter((a) => a.status === "absent").length;
    const lateCount = attendances.filter((a) => a.status === "late").length;
    const excusedCount = attendances.filter((a) => a.status === "excused").length;

    const attendanceRate = totalRecords > 0 ? (presentCount + lateCount) / totalRecords : 0;

    if (reportType === "member" && memberId) {
      // Member-specific report
      const member = await prisma.member.findFirst({
        where: { id: memberId, clubId },
        include: { class: true },
      });

      // Get sessions the member should have attended
      const totalSessions = await prisma.attendance.count({
        where: {
          memberId,
          date: { gte: startDate },
        },
      });

      return NextResponse.json({
        member,
        period,
        stats: {
          totalSessions,
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          excused: excusedCount,
          attendanceRate: Math.round(attendanceRate * 100),
        },
        recentAttendance: attendances.slice(0, 10),
      });
    }

    if (reportType === "class" && classId) {
      // Class-specific report
      const cls = await prisma.class.findFirst({
        where: { id: classId, clubId },
      });

      // Get per-member stats for this class
      const memberStats = await prisma.member.findMany({
        where: {
          clubId,
          classId,
        },
        include: {
          attendances: {
            where: {
              classId,
              date: { gte: startDate },
            },
          },
        },
      });

      const memberBreakdown = memberStats.map((m) => {
        const memberAttendances = m.attendances;
        const memberTotal = memberAttendances.length;
        const memberPresent = memberAttendances.filter((a) => a.status === "present" || a.status === "late").length;

        return {
          id: m.id,
          name: `${m.firstName} ${m.lastName}`,
          totalSessions: memberTotal,
          attended: memberPresent,
          attendanceRate: memberTotal > 0 ? Math.round((memberPresent / memberTotal) * 100) : 0,
        };
      });

      return NextResponse.json({
        class: cls,
        period,
        stats: {
          totalRecords,
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          excused: excusedCount,
          attendanceRate: Math.round(attendanceRate * 100),
        },
        memberBreakdown: memberBreakdown.sort((a, b) => b.attendanceRate - a.attendanceRate),
      });
    }

    // Summary report (default)
    // Get stats by class
    const classes = await prisma.class.findMany({
      where: { clubId },
      select: { id: true, name: true },
    });

    const classStats = await Promise.all(
      classes.map(async (cls) => {
        const classAttendances = attendances.filter((a) => a.classId === cls.id);
        const classTotal = classAttendances.length;
        const classPresent = classAttendances.filter(
          (a) => a.status === "present" || a.status === "late"
        ).length;

        return {
          id: cls.id,
          name: cls.name,
          totalSessions: classTotal,
          attendanceRate: classTotal > 0 ? Math.round((classPresent / classTotal) * 100) : 0,
        };
      })
    );

    // Get attendance by day of week
    const dayStats: Record<string, { total: number; present: number }> = {
      Monday: { total: 0, present: 0 },
      Tuesday: { total: 0, present: 0 },
      Wednesday: { total: 0, present: 0 },
      Thursday: { total: 0, present: 0 },
      Friday: { total: 0, present: 0 },
      Saturday: { total: 0, present: 0 },
      Sunday: { total: 0, present: 0 },
    };

    attendances.forEach((a) => {
      const dayName = new Date(a.date).toLocaleDateString("en-GB", { weekday: "long" });
      if (dayStats[dayName]) {
        dayStats[dayName].total++;
        if (a.status === "present" || a.status === "late") {
          dayStats[dayName].present++;
        }
      }
    });

    const dayBreakdown = Object.entries(dayStats).map(([day, stats]) => ({
      day,
      total: stats.total,
      attendanceRate: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0,
    }));

    return NextResponse.json({
      period,
      summary: {
        totalRecords,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        excused: excusedCount,
        attendanceRate: Math.round(attendanceRate * 100),
      },
      classStats: classStats.sort((a, b) => b.attendanceRate - a.attendanceRate),
      dayBreakdown,
      recentAttendance: attendances.slice(0, 20),
    });
  } catch (error) {
    console.error("Get attendance reports error:", error);
    return NextResponse.json(
      { error: "Failed to get attendance reports" },
      { status: 500 }
    );
  }
}
