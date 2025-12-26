import { Suspense } from "react";
import {
  Activity,
  Users,
  Building2,
  CreditCard,
  Mail,
  Calendar,
  Clock,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

async function getActivityData() {
  const [auditLogs, emailLogs, recentUsers, recentClubs, recentSubscriptions] =
    await Promise.all([
      // Audit logs
      prisma.auditLog.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
      }),
      // Email logs
      prisma.emailLog.findMany({
        take: 50,
        orderBy: { sentAt: "desc" },
      }),
      // Recent user signups
      prisma.user.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      }),
      // Recent club creations
      prisma.club.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          createdAt: true,
          owner: { select: { email: true } },
        },
      }),
      // Recent subscriptions
      prisma.subscription.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true,
              club: { select: { name: true } },
            },
          },
        },
      }),
    ]);

  // Combine all activities into a unified timeline
  const activities: {
    id: string;
    type: "user" | "club" | "subscription" | "email" | "audit";
    action: string;
    description: string;
    metadata?: string;
    createdAt: Date;
  }[] = [];

  // Add user signups
  recentUsers.forEach((user) => {
    activities.push({
      id: `user-${user.id}`,
      type: "user",
      action: "User Signup",
      description: `${user.name || "New user"} (${user.email}) created an account`,
      createdAt: user.createdAt,
    });
  });

  // Add club creations
  recentClubs.forEach((club) => {
    activities.push({
      id: `club-${club.id}`,
      type: "club",
      action: "Club Created",
      description: `${club.name} was created by ${club.owner.email}`,
      createdAt: club.createdAt,
    });
  });

  // Add subscriptions
  recentSubscriptions.forEach((sub) => {
    activities.push({
      id: `sub-${sub.id}`,
      type: "subscription",
      action: "New Subscription",
      description: `${sub.member.firstName} ${sub.member.lastName} subscribed to ${sub.member.club.name}`,
      metadata: sub.status,
      createdAt: sub.createdAt,
    });
  });

  // Add email logs
  emailLogs.forEach((email) => {
    activities.push({
      id: `email-${email.id}`,
      type: "email",
      action: "Email Sent",
      description: `${email.type}: ${email.subject} to ${email.to}`,
      metadata: email.status,
      createdAt: email.sentAt,
    });
  });

  // Add audit logs
  auditLogs.forEach((log) => {
    activities.push({
      id: `audit-${log.id}`,
      type: "audit",
      action: log.action,
      description: `${log.action} on ${log.entity} (${log.entityId})`,
      createdAt: log.createdAt,
    });
  });

  // Sort by date
  activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return {
    activities: activities.slice(0, 100),
    auditLogs,
    emailLogs,
    stats: {
      totalAuditLogs: auditLogs.length,
      totalEmailsSent: emailLogs.length,
      recentSignups: recentUsers.length,
      recentClubs: recentClubs.length,
    },
  };
}

function getActivityIcon(type: string) {
  switch (type) {
    case "user":
      return <Users className="w-4 h-4" />;
    case "club":
      return <Building2 className="w-4 h-4" />;
    case "subscription":
      return <CreditCard className="w-4 h-4" />;
    case "email":
      return <Mail className="w-4 h-4" />;
    default:
      return <Activity className="w-4 h-4" />;
  }
}

function getActivityColor(type: string) {
  switch (type) {
    case "user":
      return "bg-blue-100 text-blue-600";
    case "club":
      return "bg-purple-100 text-purple-600";
    case "subscription":
      return "bg-green-100 text-green-600";
    case "email":
      return "bg-orange-100 text-orange-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

async function ActivityContent() {
  const data = await getActivityData();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-gray-600">
            Monitor all platform activity and events
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search activity..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{data.stats.recentSignups}</p>
              <p className="text-sm text-gray-500">Recent Signups</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{data.stats.recentClubs}</p>
              <p className="text-sm text-gray-500">New Clubs</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{data.stats.totalEmailsSent}</p>
              <p className="text-sm text-gray-500">Emails Sent</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{data.stats.totalAuditLogs}</p>
              <p className="text-sm text-gray-500">Audit Events</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Activity Timeline</h2>
          <p className="text-sm text-gray-500">All events across the platform</p>
        </div>

        <div className="divide-y divide-gray-100">
          {data.activities.length > 0 ? (
            data.activities.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getActivityColor(
                      activity.type
                    )}`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {formatTimeAgo(activity.createdAt)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    {activity.metadata && (
                      <span
                        className={`inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                          activity.metadata === "active" || activity.metadata === "sent"
                            ? "bg-green-100 text-green-700"
                            : activity.metadata === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {activity.metadata}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No activity recorded yet</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {data.activities.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {data.activities.length} events
            </p>
            <div className="flex items-center gap-2">
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Email Logs Table */}
      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Email Logs</h2>
          <p className="text-sm text-gray-500">All emails sent from the platform</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-6 font-semibold text-gray-600 text-sm">
                  To
                </th>
                <th className="text-left py-3 px-6 font-semibold text-gray-600 text-sm">
                  Type
                </th>
                <th className="text-left py-3 px-6 font-semibold text-gray-600 text-sm">
                  Subject
                </th>
                <th className="text-center py-3 px-6 font-semibold text-gray-600 text-sm">
                  Status
                </th>
                <th className="text-right py-3 px-6 font-semibold text-gray-600 text-sm">
                  Sent At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.emailLogs.length > 0 ? (
                data.emailLogs.slice(0, 20).map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="py-3 px-6">
                      <p className="text-sm text-gray-900">{log.to}</p>
                    </td>
                    <td className="py-3 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        {log.type}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <p className="text-sm text-gray-600 max-w-xs truncate">
                        {log.subject}
                      </p>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.status === "sent"
                            ? "bg-green-100 text-green-700"
                            : log.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right text-sm text-gray-500">
                      {new Date(log.sentAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No emails sent yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function AdminActivityPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      }
    >
      <ActivityContent />
    </Suspense>
  );
}
