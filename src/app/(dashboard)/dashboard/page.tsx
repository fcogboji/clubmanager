import { Suspense } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users,
  CheckCircle,
  AlertCircle,
  Wallet,
  UserPlus,
  ClipboardCheck,
  Calendar,
  CreditCard,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { getGreeting, formatCurrency, getDayOfWeek } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

async function getDashboardData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { clubs: true },
  });

  if (!user || !user.clubs[0]) {
    return null;
  }

  const clubId = user.clubs[0].id;
  const today = getDayOfWeek();

  const [totalMembers, membersWithSubscriptions, todayClasses, totalRevenue] = await Promise.all([
    prisma.member.count({ where: { clubId } }),
    prisma.member.findMany({
      where: { clubId },
      include: { subscription: true },
    }),
    prisma.class.findMany({
      where: { clubId, day: today },
      select: { id: true, name: true, day: true, time: true },
    }),
    prisma.subscription.aggregate({
      _sum: { amount: true },
      where: { status: "active", member: { clubId } },
    }),
  ]);

  const paidMembers = membersWithSubscriptions.filter(
    (m) => m.subscription?.status === "active"
  ).length;

  return {
    totalMembers,
    paidMembers,
    unpaidMembers: totalMembers - paidMembers,
    totalRevenue: totalRevenue._sum.amount || 0,
    todayClasses,
  };
}

async function DashboardContent() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect("/sign-in");
  }

  const data = await getDashboardData(userId);

  if (!data) {
    return <div className="p-6">Loading...</div>;
  }

  const quickActions = [
    {
      href: "/members?action=add",
      icon: UserPlus,
      label: "Add Member",
      gradient: "from-primary to-primary-dark",
    },
    {
      href: "/attendance",
      icon: ClipboardCheck,
      label: "Attendance",
      gradient: "from-success to-green-600",
    },
    {
      href: "/classes?action=add",
      icon: Calendar,
      label: "Add Class",
      gradient: "from-warning to-orange-600",
    },
    {
      href: "/payments",
      icon: CreditCard,
      label: "Payments",
      gradient: "from-purple-500 to-purple-700",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="gradient-primary rounded-b-[2rem] px-4 pt-12 pb-8 md:pt-8 md:rounded-none">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/80 text-sm">{getGreeting()}</p>
              <h1 className="text-2xl font-bold text-white">
                {user?.firstName || "Admin"}
              </h1>
            </div>
            <SignOutButton>
              <button className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                <LogOut className="w-5 h-5 text-white" />
              </button>
            </SignOutButton>
          </div>

          {/* Revenue Card */}
          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.totalRevenue)}
              </p>
            </div>
            <Link
              href="/payments"
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-primary" />
            </Link>
          </Card>
        </div>
      </div>

      <div className="px-4 -mt-4 max-w-4xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xl font-bold text-primary">{data.totalMembers}</p>
            <p className="text-xs text-gray-500">Total</p>
          </Card>
          <Card className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <p className="text-xl font-bold text-success">{data.paidMembers}</p>
            <p className="text-xs text-gray-500">Paid</p>
          </Card>
          <Card className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-error/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-error" />
            </div>
            <p className="text-xl font-bold text-error">{data.unpaidMembers}</p>
            <p className="text-xs text-gray-500">Unpaid</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Card className="text-center hover:shadow-md transition-shadow" hoverable>
                  <div
                    className={`w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br ${action.gradient} flex items-center justify-center`}
                  >
                    <action.icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {action.label}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Today's Classes */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Today&apos;s Classes</h2>
            <Link
              href="/classes"
              className="text-sm font-semibold text-primary hover:underline"
            >
              View All
            </Link>
          </div>

          {data.todayClasses.length > 0 ? (
            <div className="space-y-3">
              {data.todayClasses.map((cls) => (
                <Link key={cls.id} href={`/attendance?classId=${cls.id}`}>
                  <Card className="flex items-center gap-4" hoverable>
                    <div className="bg-primary/10 px-3 py-2 rounded-lg">
                      <p className="text-sm font-bold text-primary">{cls.time}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{cls.name}</p>
                      <p className="text-sm text-gray-500">{cls.day}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="font-semibold text-gray-900 mb-1">No Classes Today</p>
              <p className="text-sm text-gray-500">Enjoy your day off or add a new class</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardContent />
    </Suspense>
  );
}
