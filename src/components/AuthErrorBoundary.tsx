"use client";

import { Component, ReactNode } from "react";
import Link from "next/link";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Wrapper to use hooks with class component
function AuthErrorBoundaryWrapper({ children }: Props) {
  return <AuthErrorBoundaryInner>{children}</AuthErrorBoundaryInner>;
}

class AuthErrorBoundaryInner extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    // Check if this is an auth-related error
    const isAuthError =
      error.message.includes("Failed to fetch") ||
      error.message.includes("Unauthorized") ||
      error.message.includes("401") ||
      error.message.includes("NEXT_REDIRECT") ||
      error.message.includes("authentication");

    if (isAuthError) {
      // Redirect to sign-in
      window.location.href = "/sign-in";
    }
  }

  render() {
    if (this.state.hasError) {
      const error = this.state.error;
      const isAuthError =
        error?.message.includes("Failed to fetch") ||
        error?.message.includes("Unauthorized") ||
        error?.message.includes("401");

      if (isAuthError) {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-purple-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-4V8a3 3 0 00-6 0v4m6 0H7a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2h-1z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Session Expired
              </h2>
              <p className="text-gray-600 mb-6">
                Your session has expired. Please sign in again to continue.
              </p>
              <Link
                href="/sign-in"
                className="inline-block gradient-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                Sign In Again
              </Link>
            </div>
          </div>
        );
      }

      // For other errors, show a generic error message
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Something Went Wrong
            </h2>
            <p className="text-gray-600 mb-6">
              An error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export { AuthErrorBoundaryWrapper as AuthErrorBoundary };
