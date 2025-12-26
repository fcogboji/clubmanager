import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, setUserRole, getUserRole } from "@/lib/admin";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET - List all users with their roles
export async function GET() {
  try {
    await requireAdmin();

    const client = await clerkClient();

    // Get all users from database
    const dbUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        clubs: {
          select: {
            id: true,
            name: true,
            _count: { select: { members: true } },
          },
        },
      },
    });

    // Get Clerk metadata for each user
    const usersWithRoles = await Promise.all(
      dbUsers.map(async (user) => {
        try {
          const clerkUser = await client.users.getUser(user.clerkId);
          return {
            ...user,
            role: (clerkUser.publicMetadata as { role?: string })?.role || "user",
            clerkData: {
              firstName: clerkUser.firstName,
              lastName: clerkUser.lastName,
              imageUrl: clerkUser.imageUrl,
              lastSignInAt: clerkUser.lastSignInAt,
            },
          };
        } catch {
          return {
            ...user,
            role: "user",
            clerkData: null,
          };
        }
      })
    );

    return NextResponse.json({ users: usersWithRoles });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json(
      { error: "Unauthorized or server error" },
      { status: 401 }
    );
  }
}

// PATCH - Update user role
export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    const body = await request.json();
    const { clerkId, role } = body;

    if (!clerkId || !role) {
      return NextResponse.json(
        { error: "Missing clerkId or role" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["user", "admin", "superadmin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Prevent removing your own superadmin role
    const client = await clerkClient();
    const targetUser = await client.users.getUser(clerkId);

    if (targetUser.primaryEmailAddress?.emailAddress === admin.email && role !== "superadmin") {
      return NextResponse.json(
        { error: "Cannot remove your own superadmin role" },
        { status: 400 }
      );
    }

    // Update role in Clerk
    await setUserRole(clerkId, role);

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: "UPDATE_USER_ROLE",
        entity: "User",
        entityId: clerkId,
        metadata: { newRole: role, updatedBy: admin.email },
      },
    });

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}`
    });
  } catch (error) {
    console.error("Update user role error:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}
