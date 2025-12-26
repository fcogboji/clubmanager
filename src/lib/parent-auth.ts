import { cookies } from "next/headers";
import { prisma } from "./prisma";

interface ParentSession {
  token: string;
  parentId: string;
  clubId: string;
}

export async function getParentSession(): Promise<ParentSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("parent_session");

    if (!sessionCookie?.value) {
      return null;
    }

    const session = JSON.parse(sessionCookie.value) as ParentSession;
    return session;
  } catch {
    return null;
  }
}

export async function getCurrentParent() {
  const session = await getParentSession();

  if (!session) {
    return null;
  }

  const parent = await prisma.parentAccount.findUnique({
    where: { id: session.parentId },
    include: {
      club: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
        },
      },
      members: {
        include: {
          class: {
            select: { id: true, name: true },
          },
          subscription: true,
          attendances: {
            take: 10,
            orderBy: { date: "desc" },
            include: {
              class: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
  });

  return parent;
}

export async function requireParentAuth() {
  const parent = await getCurrentParent();

  if (!parent) {
    throw new Error("Unauthorized");
  }

  return parent;
}
