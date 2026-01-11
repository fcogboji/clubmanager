"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Users,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  MapPin,
  Mail,
  Phone,
  Globe,
  ArrowRight,
  User,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";

interface Club {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  website: string | null;
  stripeOnboarded: boolean;
}

interface Class {
  id: string;
  name: string;
  day: string;
  time: string;
  _count: { members: number };
}

interface MembershipPlan {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  interval: string;
}

type Step = "info" | "select" | "details" | "account" | "success";

export default function PublicJoinPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [club, setClub] = useState<Club | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [step, setStep] = useState<Step>("info");
  const [showPassword, setShowPassword] = useState(false);

  // Form data
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [memberData, setMemberData] = useState({
    firstName: "",
    lastName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });
  const [accountData, setAccountData] = useState({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/public/club/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            router.push("/");
            return;
          }
          throw new Error("Failed to fetch club");
        }

        const data = await res.json();
        setClub(data.club);
        setClasses(data.classes || []);
        setPlans(data.plans || []);
      } catch (err) {
        console.error("Error fetching club:", err);
        setError("Failed to load club information");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug, router]);

  const formatPrice = (amount: number, interval: string) => {
    const price = (amount / 100).toFixed(2);
    const intervalLabel = interval === "month" ? "/mo" : interval === "year" ? "/yr" : `/${interval}`;
    return `£${price}${intervalLabel}`;
  };

  const handleSubmit = async () => {
    setError("");

    if (accountData.password !== accountData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (accountData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/public/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubSlug: slug,
          member: {
            ...memberData,
            classId: selectedClass || null,
            membershipPlanId: selectedPlan || null,
          },
          account: {
            email: memberData.contactEmail,
            password: accountData.password,
            name: memberData.contactName,
            phone: memberData.contactPhone,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }

      const data = await res.json();

      // If there's a checkout URL (for paid plans), redirect to it
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const canProceedToDetails = selectedClass || selectedPlan;
  const canProceedToAccount =
    memberData.firstName &&
    memberData.lastName &&
    memberData.contactName &&
    memberData.contactEmail;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Club Not Found</h1>
          <p className="text-gray-600">This club doesn&apos;t exist or is no longer accepting registrations.</p>
        </Card>
      </div>
    );
  }

  // Success Step
  if (step === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Registration Complete!</h1>
          <p className="text-gray-600 mb-6">
            Welcome to {club.name}! Your account has been created. Check your email to verify your account and access the member portal.
          </p>
          <Button onClick={() => router.push(`/portal/${slug}`)}>
            Go to Member Portal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="gradient-primary">
        <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
          <div className="flex items-center gap-4 mb-6">
            {club.logoUrl ? (
              <Image
                src={club.logoUrl}
                alt={club.name}
                width={80}
                height={80}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-white"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 flex items-center justify-center">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">{club.name}</h1>
              <p className="text-white/80 text-sm sm:text-base">Join our community</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between max-w-xs sm:max-w-sm">
            {["info", "select", "details", "account"].map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step === s
                      ? "bg-white text-primary"
                      : ["info", "select", "details", "account"].indexOf(step) > i
                      ? "bg-white/30 text-white"
                      : "bg-white/10 text-white/50"
                  }`}
                >
                  {i + 1}
                </div>
                {i < 3 && (
                  <div
                    className={`w-6 sm:w-12 h-0.5 ${
                      ["info", "select", "details", "account"].indexOf(step) > i
                        ? "bg-white/30"
                        : "bg-white/10"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 -mt-4">
        {/* Step 1: Club Info */}
        {step === "info" && (
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">About Us</h2>
              {club.description ? (
                <p className="text-gray-600">{club.description}</p>
              ) : (
                <p className="text-gray-500 italic">No description provided</p>
              )}

              {/* Contact Info */}
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                {club.address && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{club.address}</span>
                  </div>
                )}
                {club.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <a href={`mailto:${club.email}`} className="text-primary hover:underline">
                      {club.email}
                    </a>
                  </div>
                )}
                {club.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <a href={`tel:${club.phone}`} className="text-gray-600">
                      {club.phone}
                    </a>
                  </div>
                )}
                {club.website && (
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <a
                      href={club.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {club.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
              </div>
            </Card>

            {/* Classes Preview */}
            {classes.length > 0 && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Available Classes ({classes.length})
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {classes.slice(0, 4).map((cls) => (
                    <div
                      key={cls.id}
                      className="p-3 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <p className="font-medium text-gray-900">{cls.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {cls.day} at {cls.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {classes.length > 4 && (
                  <p className="text-sm text-gray-500 mt-3">
                    +{classes.length - 4} more classes available
                  </p>
                )}
              </Card>
            )}

            {/* Membership Plans Preview */}
            {plans.length > 0 && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Membership Plans
                </h2>
                <div className="space-y-3">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{plan.name}</p>
                        {plan.description && (
                          <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                        )}
                      </div>
                      <Badge variant="default" className="text-lg font-semibold">
                        {formatPrice(plan.amount, plan.interval)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Button className="w-full" onClick={() => setStep("select")}>
              Start Registration
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: Select Class & Plan */}
        {step === "select" && (
          <div className="space-y-4 sm:space-y-6">
            <button
              onClick={() => setStep("info")}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </button>

            {/* Class Selection */}
            {classes.length > 0 && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  <Calendar className="w-5 h-5 inline mr-2" />
                  Select a Class
                </h2>
                <div className="space-y-3">
                  {classes.map((cls) => (
                    <button
                      key={cls.id}
                      onClick={() => setSelectedClass(selectedClass === cls.id ? "" : cls.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        selectedClass === cls.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{cls.name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {cls.day} at {cls.time}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedClass === cls.id
                              ? "border-primary bg-primary"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedClass === cls.id && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* Plan Selection */}
            {plans.length > 0 && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  <CreditCard className="w-5 h-5 inline mr-2" />
                  Select a Membership Plan
                </h2>
                <div className="space-y-3">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(selectedPlan === plan.id ? "" : plan.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        selectedPlan === plan.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{plan.name}</p>
                          {plan.description && (
                            <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="default" className="text-lg font-semibold">
                            {formatPrice(plan.amount, plan.interval)}
                          </Badge>
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedPlan === plan.id
                                ? "border-primary bg-primary"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedPlan === plan.id && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {!classes.length && !plans.length && (
              <Card className="text-center py-8">
                <p className="text-gray-600">
                  This club hasn&apos;t set up any classes or membership plans yet.
                  You can still register to join.
                </p>
              </Card>
            )}

            <Button
              className="w-full"
              onClick={() => setStep("details")}
              disabled={!canProceedToDetails && (classes.length > 0 || plans.length > 0)}
            >
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 3: Member Details */}
        {step === "details" && (
          <div className="space-y-4 sm:space-y-6">
            <button
              onClick={() => setStep("select")}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </button>

            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                <User className="w-5 h-5 inline mr-2" />
                Member Details
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Enter the details of the person joining. For minors, this would be the child&apos;s information.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={memberData.firstName}
                      onChange={(e) =>
                        setMemberData({ ...memberData, firstName: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={memberData.lastName}
                      onChange={(e) =>
                        setMemberData({ ...memberData, lastName: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                <User className="w-5 h-5 inline mr-2" />
                Contact Details
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Enter the contact details. For minors, this would be the parent/guardian information.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    value={memberData.contactName}
                    onChange={(e) =>
                      setMemberData({ ...memberData, contactName: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="Full name of contact person"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={memberData.contactEmail}
                      onChange={(e) =>
                        setMemberData({ ...memberData, contactEmail: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={memberData.contactPhone}
                      onChange={(e) =>
                        setMemberData({ ...memberData, contactPhone: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="Phone number (optional)"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Button
              className="w-full"
              onClick={() => setStep("account")}
              disabled={!canProceedToAccount}
            >
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 4: Create Account */}
        {step === "account" && (
          <div className="space-y-4 sm:space-y-6">
            <button
              onClick={() => setStep("details")}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </button>

            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                <Lock className="w-5 h-5 inline mr-2" />
                Create Your Account
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Create an account to manage your membership and make payments.
              </p>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={memberData.contactEmail}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will be your login email
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={accountData.password}
                      onChange={(e) =>
                        setAccountData({ ...accountData, password: e.target.value })
                      }
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="Min 8 characters"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={accountData.confirmPassword}
                    onChange={(e) =>
                      setAccountData({ ...accountData, confirmPassword: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Summary */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Member</span>
                  <span className="font-medium">
                    {memberData.firstName} {memberData.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Contact</span>
                  <span className="font-medium">{memberData.contactName}</span>
                </div>
                {selectedClass && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Class</span>
                    <span className="font-medium">
                      {classes.find((c) => c.id === selectedClass)?.name}
                    </span>
                  </div>
                )}
                {selectedPlan && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Plan</span>
                    <span className="font-medium">
                      {plans.find((p) => p.id === selectedPlan)?.name} -{" "}
                      {formatPrice(
                        plans.find((p) => p.id === selectedPlan)?.amount || 0,
                        plans.find((p) => p.id === selectedPlan)?.interval || "month"
                      )}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            <Button
              className="w-full"
              onClick={handleSubmit}
              loading={submitting}
              disabled={!accountData.password || !accountData.confirmPassword}
            >
              {selectedPlan && club.stripeOnboarded
                ? "Complete Registration & Pay"
                : "Complete Registration"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-xs text-center text-gray-500">
              By registering, you agree to the club&apos;s terms and conditions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
