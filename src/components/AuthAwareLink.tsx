"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface AuthAwareLinkProps {
  children: React.ReactNode;
  className?: string;
  signedOutHref: string;
  signedInHref?: string;
}

export function AuthAwareLink({
  children,
  className,
  signedOutHref,
  signedInHref = "/dashboard",
}: AuthAwareLinkProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isLoaded && isSignedIn) {
      e.preventDefault();
      router.push(signedInHref);
    }
  };

  return (
    <Link
      href={isSignedIn ? signedInHref : signedOutHref}
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
