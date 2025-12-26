"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CreditCard,
  CheckCircle,
  Clock,
  ExternalLink,
  AlertCircle,
  DollarSign,
  Mail,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  parentEmail: string;
  membershipPlan?: {
    id: string;
    name: string;
    amount: number;
  };
  subscription?: {
    id: string;
    status: string;
    amount: number;
    stripeSubId: string;
    currentPeriodEnd?: string;
  };
}

interface MembershipPlan {
  id: string;
  name: string;
  amount: number;
  interval: string;
}

interface PaymentStats {
  totalRevenue: number;
  activeSubscriptions: number;
  pendingPayments: number;
  failedPayments: number;
}

function PaymentsContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    activeSubscriptions: 0,
    pendingPayments: 0,
    failedPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [creatingLink, setCreatingLink] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "pending" | "failed">("all");

  const fetchData = useCallback(async () => {
    try {
      const [membersRes, plansRes] = await Promise.all([
        fetch("/api/members?include=subscription"),
        fetch("/api/membership-plans"),
      ]);

      if (membersRes.ok) {
        const data = await membersRes.json();
        setMembers(Array.isArray(data) ? data : []);

        // Calculate stats
        const active = data.filter((m: Member) => m.subscription?.status === "active");
        const pending = data.filter((m: Member) => !m.subscription);
        const failed = data.filter((m: Member) =>
          m.subscription?.status === "past_due" || m.subscription?.status === "unpaid"
        );

        setStats({
          totalRevenue: active.reduce((sum: number, m: Member) => sum + (m.subscription?.amount || 0), 0),
          activeSubscriptions: active.length,
          pendingPayments: pending.length,
          failedPayments: failed.length,
        });
      }

      if (plansRes.ok) {
        const data = await plansRes.json();
        setPlans(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (success === "true") {
      fetchData();
    }
  }, [success, fetchData]);

  const handleCreatePaymentLink = async (memberId: string, planId?: string) => {
    const member = members.find((m) => m.id === memberId);
    let amount: number | null = null;

    if (planId) {
      const plan = plans.find((p) => p.id === planId);
      amount = plan?.amount || null;
    } else if (member?.membershipPlan) {
      amount = member.membershipPlan.amount;
    } else {
      const amountStr = prompt("Enter monthly subscription amount (in £):");
      if (!amountStr) return;
      amount = Math.round(parseFloat(amountStr) * 100);
      if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount");
        return;
      }
    }

    if (!amount) {
      alert("Please specify an amount or assign a membership plan");
      return;
    }

    setCreatingLink(memberId);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          amount,
          planId,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        alert(data.error || "Failed to create payment link");
      }
    } catch (error) {
      console.error("Failed to create payment link:", error);
      alert("Failed to create payment link");
    } finally {
      setCreatingLink(null);
    }
  };

  const handleSendPaymentEmail = async (memberId: string, planId?: string) => {
    const member = members.find((m) => m.id === memberId);
    let amount: number | null = null;

    if (planId) {
      const plan = plans.find((p) => p.id === planId);
      amount = plan?.amount || null;
    } else if (member?.membershipPlan) {
      amount = member.membershipPlan.amount;
    } else {
      const amountStr = prompt("Enter monthly subscription amount (in £):");
      if (!amountStr) return;
      amount = Math.round(parseFloat(amountStr) * 100);
      if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount");
        return;
      }
    }

    if (!amount) {
      alert("Please specify an amount or assign a membership plan");
      return;
    }

    setSendingEmail(memberId);
    try {
      const res = await fetch("/api/stripe/send-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          amount,
          planId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.emailSent) {
          alert(`Payment link sent to ${member?.parentEmail}`);
        } else {
          // Email was skipped (dev mode) or failed - offer to open the link
          const openLink = confirm(
            `${data.message}\n\nWould you like to open the payment link now?`
          );
          if (openLink && data.url) {
            window.open(data.url, "_blank");
          }
        }
      } else {
        alert(data.error || "Failed to send payment link");
      }
    } catch (error) {
      console.error("Failed to send payment email:", error);
      alert("Failed to send payment email");
    } finally {
      setSendingEmail(null);
    }
  };

  const filteredMembers = members.filter((m) => {
    if (filter === "all") return true;
    if (filter === "active") return m.subscription?.status === "active";
    if (filter === "pending") return !m.subscription;
    if (filter === "failed")
      return m.subscription?.status === "past_due" || m.subscription?.status === "unpaid";
    return true;
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      {/* Success Banner */}
      {success === "true" && (
        <div className="bg-success text-white px-4 py-3 text-center">
          <CheckCircle className="w-5 h-5 inline mr-2" />
          Payment successful! The subscription has been activated.
        </div>
      )}

      {/* Header */}
      <div className="gradient-primary rounded-b-[2rem] px-4 pt-12 pb-6 md:pt-8 md:rounded-none">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            Payments
          </h1>
          <p className="text-white/80 text-sm mt-1">
            Manage subscriptions and track revenue
          </p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-4xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-xs text-gray-500">Monthly Revenue</p>
          </Card>

          <Card className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <p className="text-lg font-bold text-success">{stats.activeSubscriptions}</p>
            <p className="text-xs text-gray-500">Active</p>
          </Card>

          <Card className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <p className="text-lg font-bold text-warning">{stats.pendingPayments}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </Card>

          <Card className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-error/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-error" />
            </div>
            <p className="text-lg font-bold text-error">{stats.failedPayments}</p>
            <p className="text-xs text-gray-500">Failed</p>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { value: "all", label: "All Members", count: members.length },
            { value: "active", label: "Active", count: stats.activeSubscriptions },
            { value: "pending", label: "Pending", count: stats.pendingPayments },
            { value: "failed", label: "Failed", count: stats.failedPayments },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as typeof filter)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === tab.value
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Members List */}
        {filteredMembers.length > 0 ? (
          <div className="space-y-3">
            {filteredMembers.map((member) => {
              const hasSubscription = !!member.subscription;
              const isActive = member.subscription?.status === "active";
              const isFailed =
                member.subscription?.status === "past_due" ||
                member.subscription?.status === "unpaid";

              return (
                <Card key={member.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        {member.parentEmail}
                      </p>

                      {member.membershipPlan && (
                        <p className="text-sm text-primary mb-2">
                          Plan: {member.membershipPlan.name} - {formatCurrency(member.membershipPlan.amount)}/month
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={isActive ? "success" : isFailed ? "error" : "warning"}
                        >
                          {isActive ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : isFailed ? (
                            <AlertCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {isActive
                            ? "Active"
                            : isFailed
                            ? member.subscription?.status
                            : "No Subscription"}
                        </Badge>

                        {hasSubscription && (
                          <span className="text-sm text-gray-500">
                            {formatCurrency(member.subscription!.amount)}/month
                          </span>
                        )}
                      </div>

                      {member.subscription?.currentPeriodEnd && (
                        <p className="text-xs text-gray-400 mt-1">
                          Next payment:{" "}
                          {new Date(member.subscription.currentPeriodEnd).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {!isActive && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleSendPaymentEmail(member.id, member.membershipPlan?.id)}
                            loading={sendingEmail === member.id}
                          >
                            <Mail className="w-4 h-4 mr-1" />
                            Send Link
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleCreatePaymentLink(member.id, member.membershipPlan?.id)}
                            loading={creatingLink === member.id}
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            {hasSubscription ? "Retry" : "Open Link"}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={CreditCard}
            title="No Members Found"
            description={
              filter === "all"
                ? "Add members to start managing payments"
                : `No members with ${filter} subscriptions`
            }
          />
        )}
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PaymentsContent />
    </Suspense>
  );
}
