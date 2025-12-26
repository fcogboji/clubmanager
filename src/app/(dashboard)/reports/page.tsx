"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";

interface AttendanceReport {
  period: string;
  summary: {
    totalRecords: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendanceRate: number;
  };
  classStats: Array<{
    id: string;
    name: string;
    totalSessions: number;
    attendanceRate: number;
  }>;
  dayBreakdown: Array<{
    day: string;
    total: number;
    attendanceRate: number;
  }>;
  recentAttendance: Array<{
    id: string;
    date: string;
    status: string;
    member: { firstName: string; lastName: string };
    class: { name: string };
  }>;
}

interface Class {
  id: string;
  name: string;
}

export default function ReportsPage() {
  const [report, setReport] = useState<AttendanceReport | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");
  const [selectedClass, setSelectedClass] = useState("");

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ period });
      if (selectedClass) {
        params.append("classId", selectedClass);
        params.append("type", "class");
      }

      const res = await fetch(`/api/attendance/reports?${params}`);
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (error) {
      console.error("Failed to fetch report:", error);
    } finally {
      setLoading(false);
    }
  }, [period, selectedClass]);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetch("/api/classes");
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "absent":
        return <XCircle className="w-4 h-4 text-error" />;
      case "late":
        return <Clock className="w-4 h-4 text-warning" />;
      case "excused":
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getRateColor = (rate: number) => {
    if (rate >= 80) return "text-success";
    if (rate >= 60) return "text-warning";
    return "text-error";
  };

  if (loading && !report) {
    return <Loading />;
  }

  return (
    <div>
      {/* Header */}
      <div className="gradient-primary rounded-b-[2rem] px-4 pt-12 pb-6 md:pt-8 md:rounded-none">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Attendance Reports
          </h1>
          <p className="text-white/80 text-sm mt-1">
            Track attendance trends and member engagement
          </p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-4xl mx-auto">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        {report && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <Card className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <p className={`text-2xl font-bold ${getRateColor(report.summary.attendanceRate)}`}>
                  {report.summary.attendanceRate}%
                </p>
                <p className="text-xs text-gray-500">Attendance Rate</p>
              </Card>

              <Card className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <p className="text-2xl font-bold text-success">{report.summary.present}</p>
                <p className="text-xs text-gray-500">Present</p>
              </Card>

              <Card className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-error/10 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-error" />
                </div>
                <p className="text-2xl font-bold text-error">{report.summary.absent}</p>
                <p className="text-xs text-gray-500">Absent</p>
              </Card>

              <Card className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-warning/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
                <p className="text-2xl font-bold text-warning">{report.summary.late}</p>
                <p className="text-xs text-gray-500">Late</p>
              </Card>
            </div>

            {/* Class Performance */}
            {report.classStats && report.classStats.length > 0 && (
              <Card className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Attendance by Class
                </h2>
                <div className="space-y-3">
                  {report.classStats.map((cls) => (
                    <div key={cls.id} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{cls.name}</span>
                          <span className={`font-semibold ${getRateColor(cls.attendanceRate)}`}>
                            {cls.attendanceRate}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              cls.attendanceRate >= 80
                                ? "bg-success"
                                : cls.attendanceRate >= 60
                                ? "bg-warning"
                                : "bg-error"
                            }`}
                            style={{ width: `${cls.attendanceRate}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {cls.totalSessions} sessions recorded
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Day of Week Performance */}
            {report.dayBreakdown && (
              <Card className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Attendance by Day of Week
                </h2>
                <div className="grid grid-cols-7 gap-2">
                  {report.dayBreakdown.map((day) => (
                    <div key={day.day} className="text-center">
                      <p className="text-xs text-gray-500 mb-1">{day.day.slice(0, 3)}</p>
                      <div
                        className={`h-16 rounded-lg flex items-end justify-center pb-1 ${
                          day.total > 0
                            ? day.attendanceRate >= 80
                              ? "bg-success/20"
                              : day.attendanceRate >= 60
                              ? "bg-warning/20"
                              : "bg-error/20"
                            : "bg-gray-100"
                        }`}
                      >
                        <span
                          className={`text-sm font-semibold ${
                            day.total > 0 ? getRateColor(day.attendanceRate) : "text-gray-400"
                          }`}
                        >
                          {day.total > 0 ? `${day.attendanceRate}%` : "-"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{day.total}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Recent Attendance */}
            {report.recentAttendance && report.recentAttendance.length > 0 && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Recent Attendance Records
                </h2>
                <div className="space-y-2">
                  {report.recentAttendance.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      {getStatusIcon(record.status)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {record.member.firstName} {record.member.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{record.class.name}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            record.status === "present"
                              ? "success"
                              : record.status === "absent"
                              ? "error"
                              : "warning"
                          }
                        >
                          {record.status}
                        </Badge>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(record.date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
