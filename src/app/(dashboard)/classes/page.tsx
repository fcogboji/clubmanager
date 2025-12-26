"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Plus,
  X,
  Trash2,
  Users,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";

interface Class {
  id: string;
  name: string;
  day: string;
  time: string;
  _count?: { members: number };
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const dayColors: Record<string, string> = {
  Monday: "from-primary to-primary-dark",
  Tuesday: "from-pink-400 to-rose-500",
  Wednesday: "from-cyan-400 to-blue-500",
  Thursday: "from-green-400 to-emerald-500",
  Friday: "from-pink-500 to-yellow-400",
  Saturday: "from-purple-300 to-pink-300",
  Sunday: "from-red-300 to-pink-200",
};

function ClassesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showAddForm = searchParams.get("action") === "add";

  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(showAddForm);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    day: "",
    time: "",
  });

  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetch("/api/classes");
      const data = await res.json();
      setClasses(data);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({ name: "", day: "", time: "" });
        setIsAdding(false);
        router.replace("/classes");
        fetchClasses();
      }
    } catch (error) {
      console.error("Failed to add class:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (classId: string, className: string) => {
    if (!confirm(`Are you sure you want to delete "${className}"?`)) return;

    try {
      const res = await fetch(`/api/classes/${classId}`, { method: "DELETE" });
      if (res.ok) {
        fetchClasses();
      }
    } catch (error) {
      console.error("Failed to delete class:", error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (isAdding) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="gradient-primary px-4 pt-12 pb-6 md:pt-8">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => {
                setIsAdding(false);
                router.replace("/classes");
              }}
              className="flex items-center text-white/80 hover:text-white mb-4"
            >
              <X className="w-5 h-5 mr-1" />
              Cancel
            </button>
            <h1 className="text-2xl font-bold text-white">Create New Class</h1>
          </div>
        </div>

        <div className="px-4 py-6 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Class Name *"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., U12 Football, Ballet"
              required
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Day *
              </label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setFormData({ ...formData, day })}
                    className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-colors ${
                      formData.day === day
                        ? "border-primary bg-primary text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Time *"
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
              placeholder="e.g., 16:00, 4:00 PM"
              required
            />

            <Button type="submit" className="w-full mt-6" loading={submitting}>
              Create Class
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="gradient-primary rounded-b-[2rem] px-4 pt-12 pb-6 md:pt-8 md:rounded-none">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Classes</h1>
              <p className="text-white/80 text-sm">
                {classes.length} {classes.length === 1 ? "class" : "classes"} scheduled
              </p>
            </div>
            <button
              onClick={() => setIsAdding(true)}
              className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
            >
              <Plus className="w-6 h-6 text-primary" />
            </button>
          </div>
        </div>
      </div>

      {/* Classes List */}
      <div className="px-4 py-6 max-w-4xl mx-auto">
        {classes.length > 0 ? (
          <div className="space-y-3">
            {classes.map((cls) => (
              <Card key={cls.id} className="overflow-hidden p-0">
                <div className="flex">
                  <div
                    className={`w-1.5 bg-gradient-to-b ${
                      dayColors[cls.day] || "from-primary to-primary-dark"
                    }`}
                  />
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900">
                        {cls.name}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(cls.id, cls.name);
                        }}
                        className="p-2 rounded-lg bg-red-50 text-error hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{cls.day}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{cls.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                          {cls._count?.members || 0} members
                        </span>
                      </div>
                      <Link
                        href={`/attendance?classId=${cls.id}`}
                        className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                      >
                        Take Attendance
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No Classes Yet"
            description="Create your first class to start scheduling"
            actionLabel="Create Class"
            onAction={() => setIsAdding(true)}
          />
        )}
      </div>
    </div>
  );
}

export default function ClassesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ClassesContent />
    </Suspense>
  );
}
