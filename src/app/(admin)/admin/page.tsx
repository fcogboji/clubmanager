import { Suspense } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

async function getAdminStats() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    totalClubs,
    totalUsers,
    totalMembers,
    activeSubscriptions,
    recentClubs,
    clubsLastMonth,
    clubsPreviousMonth,
    totalRevenue,
    revenueLastMonth,
    recentActivity,
  ] = await Promise.all([
    // Total clubs
    prisma.club.count(),
    // Total users
    prisma.user.count(),
    // Total members across all clubs
    prisma.member.count(),
    // Active subscriptions
    prisma.subscription.count({ where: { status: "active" } }),
    // Recent clubs (last 5)
    prisma.club.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { email: true, name: true } },
        _count: { select: { members: true } },
      },
    }),
    // Clubs created last 30 days
    prisma.club.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    // Clubs created 30-60 days ago
    prisma.club.count({
      where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    }),
    // Total revenue (sum of all subscription amounts - represents monthly recurring)
    prisma.subscription.aggregate({
      _sum: { amount: true },
      where: { status: "active" },
    }),
    // Revenue from subscriptions created last 30 days
    prisma.subscription.aggregate({
      _sum: { amount: true },
      where: { status: "active", createdAt: { gte: thirtyDaysAgo } },
    }),
    // Recent audit log activity
    prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Calculate platform fee (10%)
  const monthlyRecurringRevenue = totalRevenue._sum.amount || 0;
  const platformFee = Math.round(monthlyRecurringRevenue * 0.1);

  // Calculate growth
  const clubGrowth = clubsPreviousMonth > 0
    ? ((clubsLastMonth - clubsPreviousMonth) / clubsPreviousMonth * 100).toFixed(1)
    : clubsLastMonth > 0 ? "100" : "0";

  return {
    totalClubs,
    totalUsers,
    totalMembers,
    activeSubscriptions,
    monthlyRecurringRevenue,
    platformFee,
    clubsLastMonth,
    clubGrowth: parseFloat(clubGrowth),
    recentClubs,
    recentActivity,
  };
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  href,
  color = "primary",
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  href?: string;
  color?: "primary" | "success" | "warning" | "error";
}) {
  const colorClasses = {
    primary: "bg-purple-100 text-purple-600",
    success: "bg-green-100 text-green-600",
    warning: "bg-orange-100 text-orange-600",
    error: "bg-red-100 text-red-600",
  };

  const content = (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-500"
          }`}>
            {trend === "up" ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : trend === "down" ? (
              <ArrowDownRight className="w-4 h-4" />
            ) : null}
            {trendValue}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{title}</p>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

async function AdminDashboardContent() {
  const stats = await getAdminStats();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-gray-600">Monitor and manage your Club Manager platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Clubs"
          value={stats.totalClubs}
          icon={Building2}
          trend={stats.clubGrowth > 0 ? "up" : stats.clubGrowth < 0 ? "down" : "neutral"}
          trendValue={`${stats.clubGrowth}%`}
          href="/admin/clubs"
          color="primary"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          href="/admin/users"
          color="success"
        />
        <StatCard
          title="Total Members"
          value={stats.totalMembers.toLocaleString()}
          icon={Users}
          color="warning"
        />
        <StatCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions.toLocaleString()}
          icon={CreditCard}
          color="success"
        />
      </div>

      {/* Revenue Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-purple-200 text-sm">Monthly Recurring Revenue</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.monthlyRecurringRevenue)}</p>
            </div>
          </div>
          <p className="text-purple-200 text-sm">
            Total value of all active subscriptions across the platform
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-green-200 text-sm">Your Platform Revenue (10%)</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.platformFee)}</p>
            </div>
          </div>
          <p className="text-green-200 text-sm">
            Your 10% platform fee from all active subscriptions
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Clubs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Recent Clubs</h2>
              <Link
                href="/admin/clubs"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.recentClubs.length > 0 ? (
              stats.recentClubs.map((club) => (
                <div key={club.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{club.name}</p>
                      <p className="text-sm text-gray-500">{club.owner.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {club._count.members} members
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(club.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No clubs registered yet
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
              <Link
                href="/admin/activity"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Activity className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{log.action}</span> on{" "}
                        <span className="font-medium">{log.entity}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                No activity logged yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-semibold text-gray-900">New This Month</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.clubsLastMonth}</p>
          <p className="text-sm text-gray-500">clubs registered</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <span className="font-semibold text-gray-900">Stripe Connected</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.recentClubs.filter((c) => c.stripeChargesEnabled).length}
          </p>
          <p className="text-sm text-gray-500">clubs accepting payments</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <span className="font-semibold text-gray-900">Pending Setup</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.recentClubs.filter((c) => !c.stripeChargesEnabled).length}
          </p>
          <p className="text-sm text-gray-500">clubs need Stripe setup</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
