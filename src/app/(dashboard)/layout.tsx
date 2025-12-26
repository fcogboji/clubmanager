import { BottomNavigation, SideNavigation } from "@/components/navigation";
import { IdleTimeoutProvider } from "@/components/IdleTimeoutProvider";
import { AuthGuard } from "@/components/AuthGuard";
import { AuthErrorBoundary } from "@/components/AuthErrorBoundary";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthErrorBoundary>
      <AuthGuard>
        <IdleTimeoutProvider timeoutMinutes={15} warningMinutes={1}>
          <div className="min-h-screen bg-gray-50">
            <SideNavigation />
            <main className="md:ml-64 pb-20 md:pb-0">{children}</main>
            <BottomNavigation />
          </div>
        </IdleTimeoutProvider>
      </AuthGuard>
    </AuthErrorBoundary>
  );
}
