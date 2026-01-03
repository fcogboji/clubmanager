import { cookies } from "next/headers";
import { prisma } from "./prisma";

interface MemberSession {
  token: string;
  accountId: string;
  clubId: string;
}

export async function getMemberSession(): Promise<MemberSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("member_session");

    if (!sessionCookie?.value) {
      return null;
    }

    const session = JSON.parse(sessionCookie.value) as MemberSession;
    return session;
  } catch {
    return null;
  }
}

export async function getCurrentAccount() {
  const session = await getMemberSession();

  if (!session) {
    return null;
  }

  const account = await prisma.memberAccount.findUnique({
    where: { id: session.accountId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      emailVerified: true,
      sessionToken: true,
      sessionTokenExpiry: true,
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

  // Validate session token against the database
  if (!account) {
    return null;
  }

  // Check if session token matches and is not expired
  if (
    account.sessionToken !== session.token ||
    !account.sessionTokenExpiry ||
    new Date(account.sessionTokenExpiry) < new Date()
  ) {
    return null;
  }

  return account;
}

export async function requireMemberAuth() {
  const account = await getCurrentAccount();

  if (!account) {
    throw new Error("Unauthorized");
  }

  return account;
}
