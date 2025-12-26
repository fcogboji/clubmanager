import { Suspense } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  CreditCard,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Calendar,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

async function getClubs() {
  const clubs = await prisma.club.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: {
        select: { id: true, email: true, name: true, createdAt: true },
      },
      _count: {
        select: {
          members: true,
          classes: true,
          membershipPlans: true,
        },
      },
    },
  });

  // Get subscription counts for each club
  const clubsWithRevenue = await Promise.all(
    clubs.map(async (club) => {
      const subscriptions = await prisma.subscription.aggregate({
        _sum: { amount: true },
        _count: true,
        where: {
          status: "active",
          member: { clubId: club.id },
        },
      });
      return {
        ...club,
        activeSubscriptions: subscriptions._count,
        monthlyRevenue: subscriptions._sum.amount || 0,
      };
    })
  );

  return clubsWithRevenue;
}

async function ClubsContent() {
  const clubs = await getClubs();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Clubs</h1>
          <p className="text-gray-600">
            Manage and monitor all registered clubs on the platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search clubs..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Total Clubs</p>
          <p className="text-2xl font-bold text-gray-900">{clubs.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Stripe Connected</p>
          <p className="text-2xl font-bold text-green-600">
            {clubs.filter((c) => c.stripeChargesEnabled).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Total Members</p>
          <p className="text-2xl font-bold text-gray-900">
            {clubs.reduce((acc, c) => acc + c._count.members, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Platform MRR</p>
          <p className="text-2xl font-bold text-purple-600">
            {formatCurrency(clubs.reduce((acc, c) => acc + Math.round(c.monthlyRevenue * 0.1), 0))}
          </p>
        </div>
      </div>

      {/* Clubs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">
                  Club
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">
                  Owner
                </th>
                <th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm">
                  Members
                </th>
                <th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm">
                  Subscriptions
                </th>
                <th className="text-right py-4 px-6 font-semibold text-gray-600 text-sm">
                  Monthly Revenue
                </th>
                <th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm">
                  Stripe
                </th>
                <th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm">
                  Created
                </th>
                <th className="text-right py-4 px-6 font-semibold text-gray-600 text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clubs.map((club) => (
                <tr key={club.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{club.name}</p>
                        <p className="text-sm text-gray-500">/{club.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {club.owner.name || "No name"}
                      </p>
                      <p className="text-sm text-gray-500">{club.owner.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-full text-sm font-medium">
                      <Users className="w-4 h-4" />
                      {club._count.members}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      <CreditCard className="w-4 h-4" />
                      {club.activeSubscriptions}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(club.monthlyRevenue)}
                    </p>
                    <p className="text-xs text-green-600">
                      +{formatCurrency(Math.round(club.monthlyRevenue * 0.1))} fee
                    </p>
                  </td>
                  <td className="py-4 px-6 text-center">
                    {club.stripeChargesEnabled ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                        <XCircle className="w-4 h-4" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <p className="text-sm text-gray-600">
                      {new Date(club.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`mailto:${club.owner.email}`}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title="Email owner"
                      >
                        <Mail className="w-4 h-4 text-gray-600" />
                      </a>
                      {club.website && (
                        <a
                          href={club.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="Visit website"
                        >
                          <ExternalLink className="w-4 h-4 text-gray-600" />
                        </a>
                      )}
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {clubs.length === 0 && (
          <div className="p-12 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No clubs registered yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminClubsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      }
    >
      <ClubsContent />
    </Suspense>
  );
}
