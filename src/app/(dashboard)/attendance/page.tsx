"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, X, Clock, Save, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
}

interface Class {
  id: string;
  name: string;
  day: string;
  time: string;
}

interface AttendanceRecord {
  memberId: string;
  status: "present" | "absent" | "late";
}

function AttendanceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classId = searchParams.get("classId");

  const [classes, setClasses] = useState<Class[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate] = useState(new Date());

  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetch("/api/classes");
      const data = await res.json();
      setClasses(data);

      if (classId) {
        const cls = data.find((c: Class) => c.id === classId);
        if (cls) {
          setSelectedClass(cls);
        }
      }
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  const fetchMembers = useCallback(async (clsId: string) => {
    try {
      const res = await fetch(`/api/classes/${clsId}/members`);
      const data = await res.json();
      setMembers(data);
      setAttendance(
        data.map((member: Member) => ({
          memberId: member.id,
          status: "absent" as const,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch members:", error);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    if (selectedClass) {
      fetchMembers(selectedClass.id);
    }
  }, [selectedClass, fetchMembers]);

  const updateAttendance = (
    memberId: string,
    status: "present" | "absent" | "late"
  ) => {
    setAttendance((prev) =>
      prev.map((record) =>
        record.memberId === memberId ? { ...record, status } : record
      )
    );
  };

  const handleSave = async () => {
    if (!selectedClass) return;

    setSaving(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClass.id,
          date: selectedDate.toISOString(),
          attendance,
        }),
      });

      if (res.ok) {
        alert("Attendance saved successfully!");
        router.push("/classes");
      }
    } catch (error) {
      console.error("Failed to save attendance:", error);
      alert("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  // Class selection view
  if (!selectedClass) {
    return (
      <div>
        <div className="gradient-primary rounded-b-[2rem] px-4 pt-12 pb-6 md:pt-8 md:rounded-none">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-white">Take Attendance</h1>
            <p className="text-white/80 text-sm">Select a class to continue</p>
          </div>
        </div>

        <div className="px-4 py-6 max-w-4xl mx-auto">
          {classes.length > 0 ? (
            <div className="space-y-3">
              {classes.map((cls) => (
                <Card
                  key={cls.id}
                  hoverable
                  onClick={() => setSelectedClass(cls)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{cls.name}</p>
                      <p className="text-sm text-gray-500">
                        {cls.day} at {cls.time}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No Classes Yet"
              description="Create a class first to take attendance"
              actionLabel="Create Class"
              onAction={() => router.push("/classes?action=add")}
            />
          )}
        </div>
      </div>
    );
  }

  // Attendance taking view
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedClass(null)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          <h1 className="text-xl font-bold text-gray-900">Take Attendance</h1>
          <p className="text-sm text-gray-500">
            {selectedDate.toLocaleDateString("en-GB", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-sm text-primary font-medium mt-1">
            {selectedClass.name}
          </p>
        </div>
      </div>

      {/* Members List */}
      <div className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full">
        {members.length > 0 ? (
          <div className="space-y-3">
            {members.map((member) => {
              const memberAttendance = attendance.find(
                (a) => a.memberId === member.id
              );
              const status = memberAttendance?.status || "absent";

              return (
                <Card key={member.id}>
                  <p className="font-semibold text-gray-900 mb-3">
                    {member.firstName} {member.lastName}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateAttendance(member.id, "present")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
                        status === "present"
                          ? "bg-success text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      Present
                    </button>
                    <button
                      onClick={() => updateAttendance(member.id, "absent")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
                        status === "absent"
                          ? "bg-error text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <X className="w-4 h-4" />
                      Absent
                    </button>
                    <button
                      onClick={() => updateAttendance(member.id, "late")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
                        status === "late"
                          ? "bg-warning text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      Late
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No Members in Class"
            description="Add members to this class to take attendance"
            actionLabel="Add Member"
            onAction={() => router.push("/members?action=add")}
          />
        )}
      </div>

      {/* Save Button */}
      {members.length > 0 && (
        <div className="sticky bottom-16 md:bottom-0 bg-white border-t border-gray-100 p-4">
          <div className="max-w-4xl mx-auto">
            <Button onClick={handleSave} loading={saving} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save Attendance
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AttendancePage() {
  return (
    <Suspense fallback={<Loading />}>
      <AttendanceContent />
    </Suspense>
  );
}
