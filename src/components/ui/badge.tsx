import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "success" | "warning" | "error" | "default";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  const variants = {
    success: "bg-green-100 text-green-700",
    warning: "bg-orange-100 text-orange-700",
    error: "bg-red-100 text-red-700",
    default: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
