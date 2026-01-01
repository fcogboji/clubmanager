"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: "100vh",
            backgroundColor: "#f9fafb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "24rem" }}>
            <div
              style={{
                width: "4rem",
                height: "4rem",
                margin: "0 auto 1.5rem",
                borderRadius: "9999px",
                backgroundColor: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                color: "#111827",
                marginBottom: "0.5rem",
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                color: "#6b7280",
                marginBottom: "1.5rem",
              }}
            >
              A critical error occurred. Please try again.
            </p>
            {error.digest && (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#9ca3af",
                  marginBottom: "1rem",
                }}
              >
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                backgroundColor: "#4f46e5",
                color: "white",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.75rem",
                fontWeight: "600",
                border: "none",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
