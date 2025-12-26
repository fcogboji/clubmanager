"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";

interface Session {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  isCancelled: boolean;
  class?: { id: string; name: string };
  _count: { attendances: number };
}

interface Class {
  id: string;
  name: string;
}

export default function SchedulePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Date navigation
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "month">("week");

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    classId: "",
  });

  const fetchData = useCallback(async () => {
    try {
      // Calculate date range
      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate);

      if (viewMode === "week") {
        startDate.setDate(startDate.getDate() - startDate.getDay());
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
      } else {
        startDate.setDate(1);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
      }

      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      const [sessionsRes, classesRes] = await Promise.all([
        fetch(`/api/sessions?${params}`),
        fetch("/api/classes"),
      ]);

      if (sessionsRes.ok) {
        const data = await sessionsRes.json();
        setSessions(data);
      }

      if (classesRes.ok) {
        const data = await classesRes.json();
        setClasses(data);
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setLoading(false);
    }
  }, [currentDate, viewMode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async () => {
    if (!form.title || !form.date || !form.startTime || !form.endTime) {
      alert("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          classId: form.classId || null,
        }),
      });

      if (res.ok) {
        setShowForm(false);
        setForm({
          title: "",
          description: "",
          date: "",
          startTime: "",
          endTime: "",
          location: "",
          classId: "",
        });
        fetchData();
      }
    } catch (error) {
      console.error("Failed to create session:", error);
      alert("Failed to create session");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;

    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
      alert("Failed to delete session");
    }
  };

  const handleCancel = async (sessionId: string, isCancelled: boolean) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCancelled: !isCancelled }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to update session:", error);
    }
  };

  const navigatePeriod = (direction: number) => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const formatDateRange = () => {
    if (viewMode === "week") {
      const days = getWeekDays();
      const start = days[0].toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      const end = days[6].toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
      return `${start} - ${end}`;
    }
    return currentDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  };

  const getSessionsForDate = (date: Date) => {
    return sessions.filter((s) => {
      const sessionDate = new Date(s.date);
      return (
        sessionDate.getDate() === date.getDate() &&
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getFullYear() === date.getFullYear()
      );
    });
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
                <CalendarDays className="w-6 h-6" />
                Schedule
              </h1>
              <p className="text-white/80 text-sm mt-1">
                Manage your classes and sessions
              </p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-white text-primary hover:bg-white/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Session
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-4xl mx-auto">
        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigatePeriod(-1)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-gray-900 min-w-[200px] text-center">
              {formatDateRange()}
            </span>
            <button
              onClick={() => navigatePeriod(1)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                viewMode === "week" ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                viewMode === "month" ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              Month
            </button>
          </div>
        </div>

        {/* Add Session Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">New Session</h2>
                <button onClick={() => setShowForm(false)}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <Input
                  label="Session Title *"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Training Session"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link to Class (optional)
                  </label>
                  <select
                    value={form.classId}
                    onChange={(e) => setForm({ ...form, classId: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="">No class linked</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Date *"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Start Time *"
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  />
                  <Input
                    label="End Time *"
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  />
                </div>

                <Input
                  label="Location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g., Main Hall"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Session details..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleSubmit} loading={saving} className="flex-1">
                    Create Session
                  </Button>
                  <Button variant="secondary" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Week View */}
        {viewMode === "week" && (
          <div className="space-y-4">
            {getWeekDays().map((day) => {
              const daySessions = getSessionsForDate(day);
              const isToday = day.toDateString() === new Date().toDateString();

              return (
                <div key={day.toISOString()}>
                  <div className={`flex items-center gap-2 mb-2 ${isToday ? "text-primary" : "text-gray-600"}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      isToday ? "bg-primary text-white" : "bg-gray-100"
                    }`}>
                      {day.getDate()}
                    </span>
                    <span className="font-medium">
                      {day.toLocaleDateString("en-GB", { weekday: "long", month: "short" })}
                    </span>
                  </div>

                  {daySessions.length > 0 ? (
                    <div className="space-y-2 ml-10">
                      {daySessions.map((session) => (
                        <Card key={session.id} className={session.isCancelled ? "opacity-60" : ""}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className={`font-semibold ${session.isCancelled ? "line-through text-gray-500" : "text-gray-900"}`}>
                                  {session.title}
                                </h3>
                                {session.isCancelled && (
                                  <Badge variant="error">Cancelled</Badge>
                                )}
                                {session.class && (
                                  <Badge variant="default">{session.class.name}</Badge>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {session.startTime} - {session.endTime}
                                </span>
                                {session.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {session.location}
                                  </span>
                                )}
                                {session._count.attendances > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {session._count.attendances} attended
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleCancel(session.id, session.isCancelled)}
                                className="p-2 text-gray-400 hover:text-warning transition-colors"
                                title={session.isCancelled ? "Restore" : "Cancel"}
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(session.id)}
                                className="p-2 text-gray-400 hover:text-error transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="ml-10 py-3 text-sm text-gray-400 border-l-2 border-gray-100 pl-4">
                      No sessions scheduled
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Month View - Simple list */}
        {viewMode === "month" && (
          <div>
            {sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <Card key={session.id} className={session.isCancelled ? "opacity-60" : ""}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-gray-500">
                            {new Date(session.date).toLocaleDateString("en-GB", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          <h3 className={`font-semibold ${session.isCancelled ? "line-through text-gray-500" : "text-gray-900"}`}>
                            {session.title}
                          </h3>
                          {session.isCancelled && <Badge variant="error">Cancelled</Badge>}
                        </div>
                        <div className="flex gap-3 text-sm text-gray-500">
                          <span>{session.startTime} - {session.endTime}</span>
                          {session.location && <span>{session.location}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCancel(session.id, session.isCancelled)}
                          className="p-2 text-gray-400 hover:text-warning"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(session.id)}
                          className="p-2 text-gray-400 hover:text-error"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CalendarDays}
                title="No Sessions This Month"
                description="Schedule sessions for your classes"
                action={
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Session
                  </Button>
                }
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
