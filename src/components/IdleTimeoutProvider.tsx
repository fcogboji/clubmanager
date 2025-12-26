"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

interface IdleTimeoutProviderProps {
  children: React.ReactNode;
  timeoutMinutes?: number; // Default 15 minutes
  warningMinutes?: number; // Show warning before logout, default 1 minute
}

export function IdleTimeoutProvider({
  children,
  timeoutMinutes = 15,
  warningMinutes = 1,
}: IdleTimeoutProviderProps) {
  const { isSignedIn, signOut } = useAuth();
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const warningDialogRef = useRef<HTMLDivElement | null>(null);
  const resetTimersRef = useRef<() => void>(() => {});

  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = warningMinutes * 60 * 1000;

  // Public routes that don't need idle timeout
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/portal");

  const hideWarning = useCallback(() => {
    if (warningDialogRef.current) {
      warningDialogRef.current.remove();
      warningDialogRef.current = null;
    }
  }, []);

  const showWarning = useCallback(() => {
    if (warningDialogRef.current) return;

    const dialog = document.createElement("div");
    dialog.id = "idle-timeout-warning";
    dialog.innerHTML = `
      <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;">
        <div style="background: white; padding: 24px; border-radius: 12px; max-width: 400px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
          <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: #1f2937;">Session Timeout Warning</h2>
          <p style="color: #6b7280; margin-bottom: 16px;">You've been inactive for a while. You'll be signed out in <span id="countdown">${warningMinutes * 60}</span> seconds.</p>
          <button id="stay-signed-in" style="background: #667eea; color: white; padding: 10px 24px; border-radius: 8px; border: none; cursor: pointer; font-weight: 500;">
            Stay Signed In
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);
    warningDialogRef.current = dialog;

    // Countdown timer
    let seconds = warningMinutes * 60;
    const countdownEl = document.getElementById("countdown");
    const countdownInterval = setInterval(() => {
      seconds--;
      if (countdownEl) countdownEl.textContent = String(seconds);
      if (seconds <= 0) clearInterval(countdownInterval);
    }, 1000);

    // Stay signed in button
    const stayButton = document.getElementById("stay-signed-in");
    if (stayButton) {
      stayButton.onclick = () => {
        clearInterval(countdownInterval);
        hideWarning();
        resetTimersRef.current();
      };
    }
  }, [warningMinutes, hideWarning]);

  const handleSignOut = useCallback(async () => {
    hideWarning();
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
    // Force a hard redirect to sign-in page to clear all state
    window.location.href = "/sign-in";
  }, [signOut, hideWarning]);

  const resetTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    hideWarning();

    // Set warning timer
    warningRef.current = setTimeout(() => {
      showWarning();
    }, timeoutMs - warningMs);

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      handleSignOut();
    }, timeoutMs);
  }, [timeoutMs, warningMs, showWarning, handleSignOut, hideWarning]);

  // Keep resetTimersRef in sync with resetTimers
  useEffect(() => {
    resetTimersRef.current = resetTimers;
  }, [resetTimers]);

  useEffect(() => {
    if (!isSignedIn || isPublicRoute) return;

    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    const handleActivity = () => {
      resetTimers();
    };

    // Start timers
    resetTimers();

    // Listen for user activity
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      hideWarning();
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [isSignedIn, isPublicRoute, resetTimers, hideWarning]);

  return <>{children}</>;
}
