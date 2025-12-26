import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Get club profile
export async function GET() {
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

    return NextResponse.json(user.clubs[0]);
  } catch (error) {
    console.error("Get club error:", error);
    return NextResponse.json(
      { error: "Failed to get club" },
      { status: 500 }
    );
  }
}

// Update club profile
export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { name, description, phone, email, address, website, logoUrl } = body;

    // Validate name if provided
    if (name !== undefined && (!name || name.trim().length === 0)) {
      return NextResponse.json(
        { error: "Club name cannot be empty" },
        { status: 400 }
      );
    }

    const club = await prisma.club.update({
      where: { id: user.clubs[0].id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(address !== undefined && { address }),
        ...(website !== undefined && { website }),
        ...(logoUrl !== undefined && { logoUrl }),
      },
    });

    return NextResponse.json(club);
  } catch (error) {
    console.error("Update club error:", error);
    return NextResponse.json(
      { error: "Failed to update club" },
      { status: 500 }
    );
  }
}
