import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/portal(.*)",
  "/api/parent(.*)",
  "/industries(.*)",
]);

// Admin routes - require authentication (admin check done in admin layout)
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

const isApiRoute = createRouteMatcher(["/api/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // For API routes that aren't public, check auth and return 401 if not authenticated
  if (isApiRoute(req) && !isPublicRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    // User is authenticated, allow the request to proceed to the API route
    return NextResponse.next();
  }

  // For non-API routes that aren't public, protect with redirect
  if (!isPublicRoute(req) && !isApiRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip all internal paths (_next, static files)
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
