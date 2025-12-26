"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Send,
  Mail,
  Users,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";

interface Message {
  id: string;
  subject: string;
  content: string;
  type: string;
  status: string;
  recipientCount: number;
  recipientFilter?: string;
  createdAt: string;
  recipients: Array<{
    email: string;
    name: string;
    status: string;
  }>;
}

interface Class {
  id: string;
  name: string;
}

interface MembershipPlan {
  id: string;
  name: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Compose form
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    classIds: [] as string[],
    planId: "",
    paymentStatus: "",
  });

  const fetchData = useCallback(async () => {
    try {
      const [messagesRes, classesRes, plansRes] = await Promise.all([
        fetch("/api/messages"),
        fetch("/api/classes"),
        fetch("/api/membership-plans"),
      ]);

      if (messagesRes.ok) {
        const data = await messagesRes.json();
        setMessages(data.messages || []);
      }

      if (classesRes.ok) {
        const data = await classesRes.json();
        setClasses(data);
      }

      if (plansRes.ok) {
        const data = await plansRes.json();
        setPlans(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) {
      alert("Please enter a subject and message");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          content,
          type: "email",
          filters: Object.fromEntries(
            Object.entries(filters).filter(([_, v]) =>
              Array.isArray(v) ? v.length > 0 : v !== ""
            )
          ),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Message sent to ${data.recipientCount} recipients!`);
        setShowCompose(false);
        setSubject("");
        setContent("");
        setFilters({ status: "", classIds: [], planId: "", paymentStatus: "" });
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const toggleClassFilter = (classId: string) => {
    setFilters((prev) => ({
      ...prev,
      classIds: prev.classIds.includes(classId)
        ? prev.classIds.filter((id) => id !== classId)
        : [...prev.classIds, classId],
    }));
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      {/* Header */}
      <div className="gradient-primary rounded-b-[2rem] px-4 pt-12 pb-6 md:pt-8 md:rounded-none">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Send className="w-6 h-6" />
                Messages
              </h1>
              <p className="text-white/80 text-sm mt-1">
                Send announcements to your members
              </p>
            </div>
            <Button
              onClick={() => setShowCompose(!showCompose)}
              className="bg-white text-primary hover:bg-white/90"
            >
              <Mail className="w-4 h-4 mr-2" />
              Compose
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-4xl mx-auto">
        {/* Compose Form */}
        {showCompose && (
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">New Message</h2>

            {/* Filters */}
            <div className="mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <Filter className="w-4 h-4" />
                Filter Recipients
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
                />
              </button>

              {showFilters && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Member Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200"
                    >
                      <option value="">All Members</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="lapsed">Lapsed</option>
                    </select>
                  </div>

                  {/* Payment Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Status
                    </label>
                    <select
                      value={filters.paymentStatus}
                      onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200"
                    >
                      <option value="">All</option>
                      <option value="paid">Paid (Active Subscription)</option>
                      <option value="unpaid">Unpaid (No Subscription)</option>
                    </select>
                  </div>

                  {/* Class Filter */}
                  {classes.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Classes
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {classes.map((cls) => (
                          <button
                            key={cls.id}
                            onClick={() => toggleClassFilter(cls.id)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              filters.classIds.includes(cls.id)
                                ? "bg-primary text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            {cls.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Plan Filter */}
                  {plans.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Membership Plan
                      </label>
                      <select
                        value={filters.planId}
                        onChange={(e) => setFilters({ ...filters, planId: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200"
                      >
                        <option value="">All Plans</option>
                        {plans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Input
                label="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter message subject"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your message here..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  rows={6}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSend} loading={sending}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="secondary" onClick={() => setShowCompose(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Message History */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Message History</h2>

          {messages.length > 0 ? (
            <div className="space-y-3">
              {messages.map((message) => (
                <Card key={message.id}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{message.subject}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {message.recipientCount} recipients
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(message.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={message.status === "sent" ? "success" : "error"}
                    >
                      {message.status === "sent" ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Sent
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3" />
                          {message.status}
                        </>
                      )}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">{message.content}</p>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Mail}
              title="No Messages Yet"
              description="Send your first announcement to your members"
              action={
                <Button onClick={() => setShowCompose(true)}>
                  <Mail className="w-4 h-4 mr-2" />
                  Compose Message
                </Button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
