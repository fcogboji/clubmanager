import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/portal(.*)",
  "/api/parent(.*)",
  "/api/csrf(.*)",
  "/industries(.*)",
  "/terms(.*)",
  "/privacy(.*)",
]);

const isApiRoute = createRouteMatcher(["/api/(.*)"]);

// Security headers to apply to all responses
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Enable XSS filter (for older browsers)
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer policy - send origin only for cross-origin requests
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions policy - disable sensitive features
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.clerk.accounts.dev https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.clerk.com https://img.clerk.com https://*.stripe.com",
    "font-src 'self' data:",
    "connect-src 'self' https://*.clerk.accounts.dev https://api.stripe.com https://*.clerk.com wss://*.clerk.accounts.dev",
    "frame-src 'self' https://js.stripe.com https://*.clerk.accounts.dev https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ];
  response.headers.set("Content-Security-Policy", cspDirectives.join("; "));

  // Strict Transport Security (only in production)
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  return response;
}

export default clerkMiddleware(async (auth, req) => {
  // For API routes that aren't public, check auth and return 401 if not authenticated
  if (isApiRoute(req) && !isPublicRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      const response = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
      return addSecurityHeaders(response);
    }
    // User is authenticated, allow the request to proceed to the API route
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // For non-API routes that aren't public, protect with redirect
  if (!isPublicRoute(req) && !isApiRoute(req)) {
    await auth.protect();
  }

  const response = NextResponse.next();
  return addSecurityHeaders(response);
});

export const config = {
  matcher: [
    // Skip all internal paths (_next, static files)
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
