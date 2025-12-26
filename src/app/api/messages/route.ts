import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { sendBroadcastEmail } from "@/lib/email";

// Get all messages for the club
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
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const messages = await prisma.message.findMany({
      where: { clubId: user.clubs[0].id },
      include: {
        recipients: {
          take: 5, // Only get first 5 recipients for preview
        },
        _count: {
          select: { recipients: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    const total = await prisma.message.count({
      where: { clubId: user.clubs[0].id },
    });

    return NextResponse.json({ messages, total });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { error: "Failed to get messages" },
      { status: 500 }
    );
  }
}

// Send a new message
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
    const { subject, content, type, filters } = body;

    if (!subject || !content) {
      return NextResponse.json(
        { error: "Subject and content are required" },
        { status: 400 }
      );
    }

    // Build member query based on filters
    interface MemberFilter {
      clubId: string;
      status?: string;
      classId?: string | { in: string[] };
      membershipPlanId?: string | null;
      subscription?: { status: string } | null;
    }

    const memberWhere: MemberFilter = { clubId };

    if (filters) {
      if (filters.status) {
        memberWhere.status = filters.status;
      }
      if (filters.classIds && filters.classIds.length > 0) {
        memberWhere.classId = { in: filters.classIds };
      }
      if (filters.planId) {
        memberWhere.membershipPlanId = filters.planId;
      }
      if (filters.paymentStatus === "paid") {
        memberWhere.subscription = { status: "active" };
      } else if (filters.paymentStatus === "unpaid") {
        memberWhere.subscription = null;
      }
    }

    // Get members matching filters
    const members = await prisma.member.findMany({
      where: memberWhere,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        parentName: true,
        parentEmail: true,
      },
    });

    if (members.length === 0) {
      return NextResponse.json(
        { error: "No recipients match the selected filters" },
        { status: 400 }
      );
    }

    // Create message and recipients
    const message = await prisma.message.create({
      data: {
        subject,
        content,
        type: type || "email",
        status: "sent",
        recipientCount: members.length,
        recipientFilter: filters ? JSON.stringify(filters) : null,
        clubId,
        recipients: {
          create: members.map((m) => ({
            email: m.parentEmail,
            name: m.parentName || `${m.firstName} ${m.lastName}`,
            status: "sent",
          })),
        },
      },
      include: {
        recipients: true,
      },
    });

    // Get club name for email
    const club = user.clubs[0];

    // Send emails to all recipients
    const emailResults = await Promise.all(
      members.map(async (m) => {
        const result = await sendBroadcastEmail({
          to: m.parentEmail,
          recipientName: m.parentName || `${m.firstName} ${m.lastName}`,
          clubName: club.name,
          subject,
          content,
        });
        return { email: m.parentEmail, ...result };
      })
    );

    // Log email results
    const failedEmails = emailResults.filter((r) => !r.success);
    const sentCount = emailResults.filter((r) => r.success).length;

    await prisma.emailLog.create({
      data: {
        to: members.map((m) => m.parentEmail).join(", "),
        subject,
        type: "broadcast",
        status: failedEmails.length === 0 ? "sent" : "partial",
        error: failedEmails.length > 0 ? JSON.stringify(failedEmails) : null,
      },
    });

    return NextResponse.json({
      success: true,
      message,
      recipientCount: members.length,
      sentCount,
      failedCount: failedEmails.length,
    });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
