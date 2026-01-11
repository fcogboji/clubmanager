import { MobileHeader, SideNavigation } from "@/components/navigation";
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
            <MobileHeader />
            <main className="md:ml-64 pt-16 md:pt-0">{children}</main>
          </div>
        </IdleTimeoutProvider>
      </AuthGuard>
    </AuthErrorBoundary>
  );
}
