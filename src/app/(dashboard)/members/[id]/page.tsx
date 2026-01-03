"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  AlertCircle,
  Trash2,
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
  photoUrl?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  class?: { name: string };
  subscription?: { status: string; amount: number };
}

export default function MemberDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await fetch(`/api/members/${id}`);
        if (res.ok) {
          const data = await res.json();
          setMember(data);
        }
      } catch (error) {
        console.error("Failed to fetch member:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this member?")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/members");
      }
    } catch (error) {
      console.error("Failed to delete member:", error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!member) {
    return (
      <div className="p-6 text-center">
        <p>Member not found</p>
        <Button onClick={() => router.push("/members")} className="mt-4">
          Back to Members
        </Button>
      </div>
    );
  }

  const isPaid = member.subscription?.status === "active";

  return (
    <div>
      {/* Header */}
      <div className="gradient-primary px-4 pt-12 pb-8 md:pt-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.push("/members")}
            className="flex items-center text-white/80 hover:text-white mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </button>

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {member.firstName[0]}
                {member.lastName[0]}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {member.firstName} {member.lastName}
              </h1>
              <Badge
                variant={isPaid ? "success" : "error"}
                className="mt-2 bg-white/20 text-white"
              >
                {isPaid ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <AlertCircle className="w-3 h-3" />
                )}
                {isPaid ? "Paid" : "Unpaid"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-4">
        {/* Contact Info */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">
            Contact Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-600 font-semibold text-sm">
                  {member.contactName.split(" ").map((n) => n[0]).join("")}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{member.contactName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <a
                  href={`mailto:${member.contactEmail}`}
                  className="font-medium text-primary"
                >
                  {member.contactEmail}
                </a>
              </div>
            </div>
            {member.contactPhone && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <a
                    href={`tel:${member.contactPhone}`}
                    className="font-medium text-gray-900"
                  >
                    {member.contactPhone}
                  </a>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Class Info */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Class</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-warning" />
            </div>
            <p className="font-medium text-gray-900">
              {member.class?.name || "No class assigned"}
            </p>
          </div>
        </Card>

        {/* Subscription Info */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Subscription</h2>
          {member.subscription ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <Badge variant={isPaid ? "success" : "error"}>
                  {member.subscription.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Monthly Amount</span>
                <span className="font-semibold">
                  {formatCurrency(member.subscription.amount)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No active subscription</p>
          )}
        </Card>

        {/* Delete Button */}
        <Button
          variant="danger"
          className="w-full"
          onClick={handleDelete}
          loading={deleting}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Member
        </Button>
      </div>
    </div>
  );
}
