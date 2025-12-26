"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  Users,
  LogOut,
  Calendar,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { formatCurrency } from "@/lib/utils";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  status: string;
  class?: { id: string; name: string };
  subscription?: {
    status: string;
    amount: number;
    currentPeriodEnd?: string;
  };
  recentAttendance: Array<{
    date: string;
    status: string;
    className: string;
  }>;
}

interface ParentProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  club: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
  };
  members: Member[];
}

export default function PortalDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/parent/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        if (data.members.length > 0) {
          setSelectedMember(data.members[0].id);
        }
      } else {
        // Not authenticated, redirect to login
        router.push(`/portal/${slug}`);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      router.push(`/portal/${slug}`);
    } finally {
      setLoading(false);
    }
  }, [router, slug]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = async () => {
    try {
      await fetch("/api/parent/auth", { method: "DELETE" });
      router.push(`/portal/${slug}`);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!profile) {
    return null;
  }

  const currentMember = profile.members.find((m) => m.id === selectedMember);

  return (
    <div>
      {/* Header */}
      <div className="gradient-primary px-4 pt-12 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {profile.club.logoUrl ? (
                <Image
                  src={profile.club.logoUrl}
                  alt={profile.club.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-xl object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-white">{profile.club.name}</h1>
                <p className="text-white/80 text-sm">Parent Portal</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <LogOut className="w-5 h-5 text-white" />
            </button>
          </div>

          <p className="text-white/80">Welcome back, {profile.name}</p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Member Selector (if multiple) */}
        {profile.members.length > 1 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-500 mb-2">Select Child</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {profile.members.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedMember(member.id)}
                  className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                    selectedMember === member.id
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {member.firstName} {member.lastName}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentMember && (
          <>
            {/* Member Info Card */}
            <Card className="mb-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xl">
                    {currentMember.firstName[0]}
                    {currentMember.lastName[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    {currentMember.firstName} {currentMember.lastName}
                  </h2>
                  {currentMember.class && (
                    <div className="flex items-center gap-1 text-sm text-primary mt-1">
                      <Calendar className="w-4 h-4" />
                      {currentMember.class.name}
                    </div>
                  )}
                  <Badge
                    variant={currentMember.status === "active" ? "success" : "warning"}
                    className="mt-2"
                  >
                    {currentMember.status}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Subscription Status */}
            <Card className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Subscription
              </h3>

              {currentMember.subscription ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status</span>
                    <Badge
                      variant={
                        currentMember.subscription.status === "active"
                          ? "success"
                          : currentMember.subscription.status === "past_due"
                          ? "error"
                          : "warning"
                      }
                    >
                      {currentMember.subscription.status === "active" && (
                        <CheckCircle className="w-3 h-3" />
                      )}
                      {currentMember.subscription.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(currentMember.subscription.amount)}/month
                    </span>
                  </div>
                  {currentMember.subscription.currentPeriodEnd && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Next Payment</span>
                      <span className="text-gray-900">
                        {new Date(currentMember.subscription.currentPeriodEnd).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "short", year: "numeric" }
                        )}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="w-12 h-12 text-warning mx-auto mb-2" />
                  <p className="text-gray-600">No active subscription</p>
                  <p className="text-sm text-gray-500">
                    Contact the club to set up your payment
                  </p>
                </div>
              )}
            </Card>

            {/* Recent Attendance */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Attendance
              </h3>

              {currentMember.recentAttendance.length > 0 ? (
                <div className="space-y-2">
                  {currentMember.recentAttendance.map((record, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{record.className}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(record.date).toLocaleDateString("en-GB", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                      <Badge
                        variant={
                          record.status === "present"
                            ? "success"
                            : record.status === "absent"
                            ? "error"
                            : "warning"
                        }
                      >
                        {record.status === "present" && <CheckCircle className="w-3 h-3" />}
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-gray-500">No attendance records yet</p>
              )}
            </Card>
          </>
        )}

        {profile.members.length === 0 && (
          <Card className="text-center py-8">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No members linked to your account yet</p>
            <p className="text-sm text-gray-500">
              Contact the club to link your children to your account
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
