import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

interface ImportedMember {
  firstName: string;
  lastName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  dateOfBirth?: string;
  notes?: string;
  className?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

// Import members from CSV data
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
    const { members, classMapping } = body as {
      members: ImportedMember[];
      classMapping?: Record<string, string>; // className -> classId
    };

    if (!members || !Array.isArray(members)) {
      return NextResponse.json(
        { error: "Invalid members data" },
        { status: 400 }
      );
    }

    // Get existing classes for the club
    const existingClasses = await prisma.class.findMany({
      where: { clubId },
      select: { id: true, name: true },
    });

    const classNameToId = new Map(
      existingClasses.map((c) => [c.name.toLowerCase(), c.id])
    );

    // Apply any custom class mapping
    if (classMapping) {
      Object.entries(classMapping).forEach(([name, id]) => {
        classNameToId.set(name.toLowerCase(), id);
      });
    }

    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // Import members in batches
    for (const member of members) {
      try {
        // Validate required fields
        if (!member.firstName || !member.lastName || !member.contactName || !member.contactEmail) {
          results.skipped++;
          results.errors.push(
            `Skipped: Missing required fields for ${member.firstName || "unknown"} ${member.lastName || "unknown"}`
          );
          continue;
        }

        // Check for duplicate by email + name
        const existing = await prisma.member.findFirst({
          where: {
            clubId,
            contactEmail: member.contactEmail,
            firstName: member.firstName,
            lastName: member.lastName,
          },
        });

        if (existing) {
          results.skipped++;
          results.errors.push(
            `Skipped: ${member.firstName} ${member.lastName} already exists`
          );
          continue;
        }

        // Try to match class by name
        let classId: string | null = null;
        if (member.className) {
          classId = classNameToId.get(member.className.toLowerCase()) || null;
        }

        // Parse date of birth if provided
        let dateOfBirth: Date | null = null;
        if (member.dateOfBirth) {
          const parsed = new Date(member.dateOfBirth);
          if (!isNaN(parsed.getTime())) {
            dateOfBirth = parsed;
          }
        }

        // Create the member
        await prisma.member.create({
          data: {
            firstName: member.firstName.trim(),
            lastName: member.lastName.trim(),
            contactName: member.contactName.trim(),
            contactEmail: member.contactEmail.trim().toLowerCase(),
            contactPhone: member.contactPhone?.trim() || null,
            dateOfBirth,
            notes: member.notes?.trim() || null,
            emergencyContactName: member.emergencyContactName?.trim() || null,
            emergencyContactPhone: member.emergencyContactPhone?.trim() || null,
            clubId,
            classId,
          },
        });

        results.imported++;
      } catch (error) {
        results.skipped++;
        results.errors.push(
          `Error importing ${member.firstName} ${member.lastName}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Import members error:", error);
    return NextResponse.json(
      { error: "Failed to import members" },
      { status: 500 }
    );
  }
}
