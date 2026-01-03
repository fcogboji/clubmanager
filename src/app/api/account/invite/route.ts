import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { sendMemberInviteEmail } from "@/lib/email";

// Admin endpoint to invite members to create portal accounts
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

    const club = user.clubs[0];
    const body = await request.json();
    const { memberIds, sendEmail } = body;

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json(
        { error: "Member IDs are required" },
        { status: 400 }
      );
    }

    // Get members to invite
    const members = await prisma.member.findMany({
      where: {
        id: { in: memberIds },
        clubId: club.id,
        memberAccountId: null, // Only members without an account
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        contactEmail: true,
        contactName: true,
      },
    });

    if (members.length === 0) {
      return NextResponse.json(
        { error: "No eligible members found to invite" },
        { status: 400 }
      );
    }

    // Group by email to avoid duplicate invites
    const emailGroups = new Map<string, typeof members>();
    members.forEach((m) => {
      const email = m.contactEmail.toLowerCase();
      const existing = emailGroups.get(email) || [];
      existing.push(m);
      emailGroups.set(email, existing);
    });

    const invitations: Array<{
      email: string;
      contactName: string;
      members: string[];
      registrationUrl: string;
    }> = [];

    for (const [email, groupMembers] of emailGroups) {
      // Check if account already exists
      const existingAccount = await prisma.memberAccount.findFirst({
        where: {
          email,
          clubId: club.id,
        },
      });

      if (existingAccount) {
        // Link members to existing account
        await prisma.member.updateMany({
          where: {
            id: { in: groupMembers.map((m) => m.id) },
          },
          data: {
            memberAccountId: existingAccount.id,
          },
        });
        continue;
      }

      // Generate registration URL
      const registrationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal/${club.slug}/register?email=${encodeURIComponent(email)}`;

      invitations.push({
        email,
        contactName: groupMembers[0].contactName,
        members: groupMembers.map((m) => `${m.firstName} ${m.lastName}`),
        registrationUrl,
      });

      // Send email invitation if sendEmail is true
      if (sendEmail) {
        const emailResult = await sendMemberInviteEmail({
          to: email,
          name: groupMembers[0].contactName,
          clubName: club.name,
          memberNames: groupMembers.map((m) => `${m.firstName} ${m.lastName}`),
          registrationUrl,
        });

        // Log the email
        await prisma.emailLog.create({
          data: {
            to: email,
            subject: `You're invited to ${club.name} Member Portal`,
            type: "member_invite",
            status: emailResult.success ? "sent" : "failed",
            error: emailResult.error ? JSON.stringify(emailResult.error) : null,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      invitedCount: invitations.length,
      invitations,
    });
  } catch (error) {
    console.error("Member invite error:", error);
    return NextResponse.json(
      { error: "Failed to send invitations" },
      { status: 500 }
    );
  }
}
