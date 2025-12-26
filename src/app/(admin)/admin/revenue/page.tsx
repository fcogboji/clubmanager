import { Suspense } from "react";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  ArrowUpRight,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

async function getRevenueData() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    allSubscriptions,
    activeSubscriptions,
    subscriptionsLastMonth,
    subscriptionsPreviousMonth,
    recentInvoices,
    clubsWithRevenue,
  ] = await Promise.all([
    // All subscriptions
    prisma.subscription.findMany({
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
            club: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    // Active subscriptions count
    prisma.subscription.aggregate({
      _sum: { amount: true },
      _count: true,
      where: { status: "active" },
    }),
    // Subscriptions created last 30 days
    prisma.subscription.aggregate({
      _sum: { amount: true },
      _count: true,
      where: { createdAt: { gte: thirtyDaysAgo }, status: "active" },
    }),
    // Subscriptions created 30-60 days ago
    prisma.subscription.aggregate({
      _sum: { amount: true },
      _count: true,
      where: {
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        status: "active",
      },
    }),
    // Recent invoices
    prisma.invoice.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        subscription: {
          include: {
            member: {
              select: {
                firstName: true,
                lastName: true,
                club: { select: { name: true } },
              },
            },
          },
        },
      },
    }),
    // Revenue by club
    prisma.club.findMany({
      select: {
        id: true,
        name: true,
        members: {
          select: {
            subscription: {
              select: {
                amount: true,
                status: true,
              },
            },
          },
        },
      },
    }),
  ]);

  // Calculate club revenue breakdown
  const clubRevenue = clubsWithRevenue
    .map((club) => {
      const activeAmount = club.members.reduce((acc, m) => {
        if (m.subscription?.status === "active") {
          return acc + (m.subscription.amount || 0);
        }
        return acc;
      }, 0);
      return {
        id: club.id,
        name: club.name,
        monthlyRevenue: activeAmount,
        platformFee: Math.round(activeAmount * 0.1),
        activeSubscriptions: club.members.filter(
          (m) => m.subscription?.status === "active"
        ).length,
      };
    })
    .filter((c) => c.monthlyRevenue > 0)
    .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue);

  // Calculate totals
  const totalMRR = activeSubscriptions._sum.amount || 0;
  const platformRevenue = Math.round(totalMRR * 0.1);
  const newMRR = subscriptionsLastMonth._sum.amount || 0;
  const previousMRR = subscriptionsPreviousMonth._sum.amount || 0;
  const mrrGrowth = previousMRR > 0
    ? ((newMRR - previousMRR) / previousMRR * 100).toFixed(1)
    : newMRR > 0 ? "100" : "0";

  // Subscription status breakdown
  const statusBreakdown = {
    active: allSubscriptions.filter((s) => s.status === "active").length,
    past_due: allSubscriptions.filter((s) => s.status === "past_due").length,
    canceled: allSubscriptions.filter((s) => s.status === "canceled").length,
  };

  return {
    totalMRR,
    platformRevenue,
    activeCount: activeSubscriptions._count,
    newSubscriptions: subscriptionsLastMonth._count,
    mrrGrowth: parseFloat(mrrGrowth),
    statusBreakdown,
    clubRevenue,
    recentInvoices,
    allSubscriptions,
  };
}

async function RevenueContent() {
  const data = await getRevenueData();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Revenue Tracking</h1>
        <p className="text-gray-600">
          Monitor platform revenue and subscription metrics
        </p>
      </div>

      {/* Revenue Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-green-200 text-sm">Your Platform Revenue</span>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(data.platformRevenue)}</p>
          <p className="text-green-200 text-sm mt-1">10% of all subscriptions</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-purple-200 text-sm">Total Platform MRR</span>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(data.totalMRR)}</p>
          <p className="text-purple-200 text-sm mt-1">
            {data.mrrGrowth > 0 ? "+" : ""}{data.mrrGrowth}% vs last month
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-gray-500 text-sm">Active Subscriptions</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.activeCount}</p>
          <p className="text-blue-600 text-sm mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4" />
            +{data.newSubscriptions} this month
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-gray-500 text-sm">Revenue Clubs</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.clubRevenue.length}</p>
          <p className="text-gray-500 text-sm mt-1">generating revenue</p>
        </div>
      </div>

      {/* Subscription Status */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{data.statusBreakdown.active}</p>
              <p className="text-sm text-gray-500">Active subscriptions</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{data.statusBreakdown.past_due}</p>
              <p className="text-sm text-gray-500">Past due (payment failed)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{data.statusBreakdown.canceled}</p>
              <p className="text-sm text-gray-500">Canceled subscriptions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Revenue by Club */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Revenue by Club</h2>
            <p className="text-sm text-gray-500">Top performing clubs</p>
          </div>
          <div className="divide-y divide-gray-100">
            {data.clubRevenue.length > 0 ? (
              data.clubRevenue.slice(0, 10).map((club, index) => (
                <div key={club.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{club.name}</p>
                        <p className="text-sm text-gray-500">
                          {club.activeSubscriptions} active subscriptions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {formatCurrency(club.monthlyRevenue)}
                      </p>
                      <p className="text-sm text-green-600">
                        +{formatCurrency(club.platformFee)} fee
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No revenue data yet
              </div>
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Recent Invoices</h2>
            <p className="text-sm text-gray-500">Latest payment activity</p>
          </div>
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {data.recentInvoices.length > 0 ? (
              data.recentInvoices.map((invoice) => (
                <div key={invoice.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {invoice.subscription.member.firstName}{" "}
                        {invoice.subscription.member.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {invoice.subscription.member.club.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {formatCurrency(invoice.amount)}
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          invoice.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : invoice.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(invoice.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No invoices yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* All Subscriptions Table */}
      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">All Subscriptions</h2>
          <p className="text-sm text-gray-500">Complete subscription list</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-6 font-semibold text-gray-600 text-sm">
                  Member
                </th>
                <th className="text-left py-3 px-6 font-semibold text-gray-600 text-sm">
                  Club
                </th>
                <th className="text-right py-3 px-6 font-semibold text-gray-600 text-sm">
                  Amount
                </th>
                <th className="text-center py-3 px-6 font-semibold text-gray-600 text-sm">
                  Interval
                </th>
                <th className="text-center py-3 px-6 font-semibold text-gray-600 text-sm">
                  Status
                </th>
                <th className="text-center py-3 px-6 font-semibold text-gray-600 text-sm">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.allSubscriptions.slice(0, 20).map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="py-3 px-6">
                    <p className="font-medium text-gray-900">
                      {sub.member.firstName} {sub.member.lastName}
                    </p>
                  </td>
                  <td className="py-3 px-6">
                    <p className="text-sm text-gray-600">{sub.member.club.name}</p>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(sub.amount)}
                    </p>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <span className="text-sm text-gray-600 capitalize">
                      {sub.interval}ly
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        sub.status === "active"
                          ? "bg-green-100 text-green-700"
                          : sub.status === "past_due"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center text-sm text-gray-500">
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminRevenuePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      }
    >
      <RevenueContent />
    </Suspense>
  );
}
