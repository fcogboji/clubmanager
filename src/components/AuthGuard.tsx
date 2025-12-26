"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Once Clerk has loaded, check if user is signed in
    if (isLoaded && !isSignedIn) {
      // Redirect to sign-in page
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Also listen for auth state changes (e.g., session expiry)
  useEffect(() => {
    const checkAuthState = () => {
      if (isLoaded && !isSignedIn) {
        router.replace("/sign-in");
      }
    };

    // Check auth state periodically (every 30 seconds)
    const interval = setInterval(checkAuthState, 30000);

    // Also check on visibility change (when user comes back to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAuthState();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isLoaded, isSignedIn, router]);

  // Show nothing while loading auth state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not signed in, show nothing (redirect will happen)
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
