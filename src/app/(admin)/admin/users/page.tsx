import { Suspense } from "react";
import Image from "next/image";
import {
  Users,
  Building2,
  Calendar,
  Search,
  Filter,
  ShieldCheck,
  Crown,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { UserRoleManager } from "./UserRoleManager";

interface UserPublicMetadata {
  role?: "user" | "admin" | "superadmin";
}

async function getUsers() {
  const client = await clerkClient();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      clubs: {
        select: {
          id: true,
          name: true,
          stripeChargesEnabled: true,
          _count: { select: { members: true } },
        },
      },
    },
  });

  // Enrich with Clerk data
  const usersWithRoles = await Promise.all(
    users.map(async (user) => {
      try {
        const clerkUser = await client.users.getUser(user.clerkId);
        return {
          ...user,
          role: (clerkUser.publicMetadata as UserPublicMetadata)?.role || "user",
          lastSignInAt: clerkUser.lastSignInAt,
          imageUrl: clerkUser.imageUrl,
        };
      } catch {
        return {
          ...user,
          role: "user" as const,
          lastSignInAt: null,
          imageUrl: null,
        };
      }
    })
  );

  return usersWithRoles;
}

async function UsersContent() {
  const users = await getUsers();

  const stats = {
    total: users.length,
    superadmins: users.filter((u) => u.role === "superadmin").length,
    admins: users.filter((u) => u.role === "admin").length,
    withClubs: users.filter((u) => u.clubs.length > 0).length,
    newThisMonth: users.filter((u) => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(u.createdAt) > thirtyDaysAgo;
    }).length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">
            Manage users and assign platform roles via Clerk
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
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
      <div className="grid md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-500" />
            <p className="text-sm text-gray-500">Super Admins</p>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.superadmins}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-500" />
            <p className="text-sm text-gray-500">Admins</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">With Clubs</p>
          <p className="text-2xl font-bold text-green-600">{stats.withClubs}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">New This Month</p>
          <p className="text-2xl font-bold text-blue-600">{stats.newThisMonth}</p>
        </div>
      </div>

      {/* Role Legend */}
      <div className="bg-purple-50 rounded-xl p-4 mb-6 flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
            <Crown className="w-3 h-3" />
            Super Admin
          </span>
          <span className="text-sm text-gray-600">Full platform access + can manage other admins</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            <ShieldCheck className="w-3 h-3" />
            Admin
          </span>
          <span className="text-sm text-gray-600">Platform admin access</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
            Club Owner
          </span>
          <span className="text-sm text-gray-600">Standard user (manages their club)</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">
                  User
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">
                  Role
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">
                  Clubs
                </th>
                <th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm">
                  Members
                </th>
                <th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm">
                  Last Sign In
                </th>
                <th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm">
                  Joined
                </th>
                <th className="text-right py-4 px-6 font-semibold text-gray-600 text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => {
                const totalMembers = user.clubs.reduce((acc, c) => acc + c._count.members, 0);

                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {user.imageUrl ? (
                          <Image
                            src={user.imageUrl}
                            alt=""
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-xl object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            user.role === "superadmin"
                              ? "bg-yellow-100"
                              : user.role === "admin"
                              ? "bg-purple-100"
                              : "bg-gray-100"
                          }`}>
                            {user.role === "superadmin" ? (
                              <Crown className="w-5 h-5 text-yellow-600" />
                            ) : user.role === "admin" ? (
                              <ShieldCheck className="w-5 h-5 text-purple-600" />
                            ) : (
                              <Users className="w-5 h-5 text-gray-600" />
                            )}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">
                            {user.name || "No name"}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {user.role === "superadmin" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                          <Crown className="w-3 h-3" />
                          Super Admin
                        </span>
                      ) : user.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          <ShieldCheck className="w-3 h-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          Club Owner
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {user.clubs.length > 0 ? (
                        <div className="space-y-1">
                          {user.clubs.slice(0, 2).map((club) => (
                            <div key={club.id} className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">{club.name}</span>
                            </div>
                          ))}
                          {user.clubs.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{user.clubs.length - 2} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No clubs</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        <Users className="w-4 h-4" />
                        {totalMembers}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {user.lastSignInAt ? (
                        <span className="text-sm text-gray-600">
                          {new Date(user.lastSignInAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Never</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <UserRoleManager
                        userId={user.clerkId}
                        userEmail={user.email}
                        currentRole={user.role}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No users registered yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      }
    >
      <UsersContent />
    </Suspense>
  );
}
