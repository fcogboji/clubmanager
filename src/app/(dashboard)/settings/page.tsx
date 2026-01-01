"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Settings,
  CreditCard,
  Building2,
  Tag,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Upload,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { formatCurrency } from "@/lib/utils";

interface Club {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  stripeAccountId?: string;
  stripeOnboarded: boolean;
  stripeChargesEnabled: boolean;
}

interface MembershipPlan {
  id: string;
  name: string;
  description?: string;
  amount: number;
  interval: string;
  isActive: boolean;
  _count: { members: number };
}

interface StripeStatus {
  connected: boolean;
  onboarded: boolean;
  chargesEnabled: boolean;
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const stripeStatus = searchParams.get("stripe");

  const [activeTab, setActiveTab] = useState<"profile" | "stripe" | "plans">("profile");
  const [club, setClub] = useState<Club | null>(null);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [stripe, setStripe] = useState<StripeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connectingStripe, setConnectingStripe] = useState(false);

  // Form states
  const [clubForm, setClubForm] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    website: "",
  });

  const [planForm, setPlanForm] = useState({
    name: "",
    description: "",
    amount: "",
    interval: "month",
  });
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [showPlanForm, setShowPlanForm] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [clubRes, plansRes, stripeRes] = await Promise.all([
        fetch("/api/club"),
        fetch("/api/membership-plans"),
        fetch("/api/stripe/connect"),
      ]);

      if (clubRes.ok) {
        const clubData = await clubRes.json();
        setClub(clubData);
        setClubForm({
          name: clubData.name || "",
          description: clubData.description || "",
          phone: clubData.phone || "",
          email: clubData.email || "",
          address: clubData.address || "",
          website: clubData.website || "",
        });
      }

      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(plansData);
      }

      if (stripeRes.ok) {
        const stripeData = await stripeRes.json();
        setStripe(stripeData);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (stripeStatus === "success") {
      fetchData();
    }
  }, [stripeStatus, fetchData]);

  const handleSaveClub = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/club", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clubForm),
      });

      if (res.ok) {
        const updated = await res.json();
        setClub(updated);
        alert("Club profile updated successfully!");
      }
    } catch (error) {
      console.error("Failed to save club:", error);
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleConnectStripe = async () => {
    setConnectingStripe(true);
    try {
      const res = await fetch("/api/stripe/connect", {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch (error) {
      console.error("Failed to connect Stripe:", error);
      alert("Failed to connect Stripe account");
    } finally {
      setConnectingStripe(false);
    }
  };

  const handleSavePlan = async () => {
    if (!planForm.name || !planForm.amount) {
      alert("Name and amount are required");
      return;
    }

    setSaving(true);
    try {
      const url = editingPlan
        ? `/api/membership-plans/${editingPlan}`
        : "/api/membership-plans";
      const method = editingPlan ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: planForm.name,
          description: planForm.description || null,
          amount: Math.round(parseFloat(planForm.amount) * 100),
          interval: planForm.interval,
        }),
      });

      if (res.ok) {
        fetchData();
        setShowPlanForm(false);
        setEditingPlan(null);
        setPlanForm({ name: "", description: "", amount: "", interval: "month" });
      }
    } catch (error) {
      console.error("Failed to save plan:", error);
      alert("Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;

    try {
      const res = await fetch(`/api/membership-plans/${planId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to delete plan:", error);
      alert("Failed to delete plan");
    }
  };

  const startEditPlan = (plan: MembershipPlan) => {
    setPlanForm({
      name: plan.name,
      description: plan.description || "",
      amount: (plan.amount / 100).toString(),
      interval: plan.interval,
    });
    setEditingPlan(plan.id);
    setShowPlanForm(true);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      {/* Success Banner */}
      {stripeStatus === "success" && (
        <div className="bg-success text-white px-4 py-3 text-center">
          <CheckCircle className="w-5 h-5 inline mr-2" />
          Stripe account connected successfully!
        </div>
      )}

      {/* Header */}
      <div className="gradient-primary rounded-b-[2rem] px-4 pt-12 pb-6 md:pt-8 md:rounded-none">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Settings
          </h1>
          <p className="text-white/80 text-sm mt-1">
            Manage your club profile, payments, and membership plans
          </p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === "profile"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Building2 className="w-4 h-4 inline mr-2" />
            Club Profile
          </button>
          <button
            onClick={() => setActiveTab("stripe")}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === "stripe"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <CreditCard className="w-4 h-4 inline mr-2" />
            Stripe Connect
          </button>
          <button
            onClick={() => setActiveTab("plans")}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === "plans"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Tag className="w-4 h-4 inline mr-2" />
            Membership Plans
          </button>
        </div>

        {/* Club Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Club Information</h2>

              <div className="space-y-4">
                <Input
                  label="Club Name"
                  value={clubForm.name}
                  onChange={(e) => setClubForm({ ...clubForm, name: e.target.value })}
                  placeholder="Enter club name"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={clubForm.description}
                    onChange={(e) => setClubForm({ ...clubForm, description: e.target.value })}
                    placeholder="Brief description of your club"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Contact Phone"
                    type="tel"
                    value={clubForm.phone}
                    onChange={(e) => setClubForm({ ...clubForm, phone: e.target.value })}
                    placeholder="+44 123 456 7890"
                  />
                  <Input
                    label="Contact Email"
                    type="email"
                    value={clubForm.email}
                    onChange={(e) => setClubForm({ ...clubForm, email: e.target.value })}
                    placeholder="contact@club.com"
                  />
                </div>

                <Input
                  label="Address"
                  value={clubForm.address}
                  onChange={(e) => setClubForm({ ...clubForm, address: e.target.value })}
                  placeholder="123 Club Street, City, Postcode"
                />

                <Input
                  label="Website"
                  type="url"
                  value={clubForm.website}
                  onChange={(e) => setClubForm({ ...clubForm, website: e.target.value })}
                  placeholder="https://yourclub.com"
                />

                <Button onClick={handleSaveClub} loading={saving}>
                  Save Changes
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Stripe Connect Tab */}
        {activeTab === "stripe" && (
          <div className="space-y-6">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Setup</h2>
              <p className="text-gray-600 mb-6">
                Connect your Stripe account to receive payments directly from members.
                We charge a 10% platform fee on transactions to cover payment processing and platform services.
              </p>

              {stripe?.connected ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      stripe.chargesEnabled ? "bg-success/10" : "bg-warning/10"
                    }`}>
                      {stripe.chargesEnabled ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-warning" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Stripe Account Connected</p>
                      <p className="text-sm text-gray-500">
                        {stripe.chargesEnabled
                          ? "Your account is fully set up and can receive payments"
                          : "Please complete onboarding to receive payments"}
                      </p>
                    </div>
                    <Badge variant={stripe.chargesEnabled ? "success" : "warning"}>
                      {stripe.chargesEnabled ? "Active" : "Pending"}
                    </Badge>
                  </div>

                  <Button onClick={handleConnectStripe} variant="secondary" loading={connectingStripe}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {stripe.chargesEnabled ? "Manage Stripe Account" : "Complete Setup"}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Connect Stripe</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Set up your Stripe account to start collecting subscription payments from your members automatically.
                  </p>
                  <Button onClick={handleConnectStripe} loading={connectingStripe}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Connect Stripe Account
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Membership Plans Tab */}
        {activeTab === "plans" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Membership Plans</h2>
                <p className="text-sm text-gray-600">
                  Define subscription tiers for your members
                </p>
              </div>
              <Button
                onClick={() => {
                  setShowPlanForm(true);
                  setEditingPlan(null);
                  setPlanForm({ name: "", description: "", amount: "", interval: "month" });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Plan
              </Button>
            </div>

            {/* Plan Form */}
            {showPlanForm && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">
                  {editingPlan ? "Edit Plan" : "New Plan"}
                </h3>
                <div className="space-y-4">
                  <Input
                    label="Plan Name"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    placeholder="e.g., U10 Football Team"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (optional)
                    </label>
                    <textarea
                      value={planForm.description}
                      onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                      placeholder="Brief description of what's included"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      rows={2}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Amount (£)"
                      type="number"
                      step="0.01"
                      min="0"
                      value={planForm.amount}
                      onChange={(e) => setPlanForm({ ...planForm, amount: e.target.value })}
                      placeholder="29.00"
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Billing Interval
                      </label>
                      <select
                        value={planForm.interval}
                        onChange={(e) => setPlanForm({ ...planForm, interval: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      >
                        <option value="week">Weekly</option>
                        <option value="month">Monthly</option>
                        <option value="year">Yearly</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleSavePlan} loading={saving}>
                      {editingPlan ? "Update Plan" : "Create Plan"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowPlanForm(false);
                        setEditingPlan(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Plans List */}
            {plans.length > 0 ? (
              <div className="space-y-3">
                {plans.map((plan) => (
                  <Card key={plan.id}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                          <Badge variant={plan.isActive ? "success" : "warning"}>
                            {plan.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        {plan.description && (
                          <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="font-semibold text-primary">
                            {formatCurrency(plan.amount)}/{plan.interval}
                          </span>
                          <span>{plan._count.members} members</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditPlan(plan)}
                          className="p-2 text-gray-400 hover:text-primary transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          className="p-2 text-gray-400 hover:text-error transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : !showPlanForm ? (
              <Card className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Tag className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-semibold text-gray-900 mb-1">No Membership Plans</p>
                <p className="text-sm text-gray-500 mb-4">
                  Create plans to streamline your billing process
                </p>
                <Button
                  onClick={() => setShowPlanForm(true)}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Plan
                </Button>
              </Card>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SettingsContent />
    </Suspense>
  );
}
