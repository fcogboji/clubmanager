import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Fallback admin emails from environment variable (for initial setup)
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) || [];

type UserRole = "admin" | "superadmin" | "user";

interface UserPublicMetadata {
  role?: UserRole;
}

export async function isAdmin(): Promise<boolean> {
  const user = await currentUser();
  if (!user) return false;

  // Check Clerk publicMetadata for role
  const metadata = user.publicMetadata as UserPublicMetadata;
  if (metadata?.role === "superadmin" || metadata?.role === "admin") {
    return true;
  }

  // Fallback: Check environment variable for initial admin setup
  const email = user.primaryEmailAddress?.emailAddress?.toLowerCase();
  if (email && ADMIN_EMAILS.includes(email)) {
    // Auto-promote this user to superadmin in Clerk
    await setUserRole(user.id, "superadmin");
    return true;
  }

  return false;
}

export async function requireAdmin() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Check if user is admin
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    redirect("/dashboard");
  }

  return {
    userId,
    email: user.primaryEmailAddress?.emailAddress || "",
    name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Admin",
    role: (user.publicMetadata as UserPublicMetadata)?.role || "superadmin",
  };
}

export async function getAdminUser() {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
}

// Set user role in Clerk metadata
export async function setUserRole(userId: string, role: UserRole) {
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      role,
    },
  });
}

// Get user role from Clerk
export async function getUserRole(userId: string): Promise<UserRole> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return (user.publicMetadata as UserPublicMetadata)?.role || "user";
}

// Check if a specific user is admin (by userId)
export async function isUserAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "superadmin" || role === "admin";
}
