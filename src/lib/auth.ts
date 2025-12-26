import { auth } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      clubs: true,
    },
  });

  return user;
}

export async function getOrCreateUser(clerkId: string, email: string, name?: string) {
  let user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId,
        email,
        name,
      },
    });
  }

  return user;
}

export async function getUserClub() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  // Get the first club or create one if none exists
  let club = user.clubs[0];

  if (!club) {
    const slug = `club-${user.id.slice(0, 8)}`;
    club = await prisma.club.create({
      data: {
        name: "My Club",
        slug,
        ownerId: user.id,
      },
    });
  }

  return club;
}

export async function ensureUserWithClub() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Try to find existing user with clubs
  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { clubs: true },
  });

  // If no user exists, create one with a club
  if (!user) {
    // Get user info from Clerk
    const { currentUser } = await import("@clerk/nextjs/server");
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return null;
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ");

    if (!email) {
      return null;
    }

    // Generate unique slug
    const baseSlug = "my-club";
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.club.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email,
        name: name || null,
        clubs: {
          create: {
            name: "My Club",
            slug,
          },
        },
      },
      include: { clubs: true },
    });
  } else if (!user.clubs.length) {
    // User exists but has no club - create one
    const slug = `club-${user.id.slice(0, 8)}`;
    await prisma.club.create({
      data: {
        name: "My Club",
        slug,
        ownerId: user.id,
      },
    });
    user = await prisma.user.findUnique({
      where: { id: user.id },
      include: { clubs: true },
    });
  }

  return user;
}
