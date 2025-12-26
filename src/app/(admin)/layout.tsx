import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  DollarSign,
  Activity,
  Settings,
  LogOut,
  Shield,
  ChevronRight,
} from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { requireAdmin } from "@/lib/admin";

const adminNavItems = [
  {
    href: "/admin",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    href: "/admin/clubs",
    icon: Building2,
    label: "Clubs",
  },
  {
    href: "/admin/users",
    icon: Users,
    label: "Users",
  },
  {
    href: "/admin/revenue",
    icon: DollarSign,
    label: "Revenue",
  },
  {
    href: "/admin/activity",
    icon: Activity,
    label: "Activity",
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect if not admin
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <header className="bg-gray-900 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Platform Admin</h1>
                <p className="text-xs text-gray-400">Club Manager</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
              >
                Go to Dashboard
                <ChevronRight className="w-4 h-4" />
              </Link>
              <div className="h-6 w-px bg-gray-700" />
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-300">{admin.email}</span>
                <SignOutButton>
                  <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </SignOutButton>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-1">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 mt-4">
            <div className="bg-orange-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-orange-600 mb-2">
                <Shield className="w-5 h-5" />
                <span className="font-semibold text-sm">Admin Access</span>
              </div>
              <p className="text-xs text-orange-700">
                You have full platform access. All actions are logged.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
