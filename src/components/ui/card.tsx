import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ children, className, onClick, hoverable }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl p-4 shadow-sm",
        hoverable && "cursor-pointer hover:shadow-md transition-shadow duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}
