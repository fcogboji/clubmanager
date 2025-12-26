"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  X,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Calendar,
  User,
  Upload,
  Filter,
  ChevronDown,
  UserPlus,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  parentName: string;
  parentEmail: string;
  status: string;
  class?: { id: string; name: string };
  membershipPlan?: { id: string; name: string };
  subscription?: { status: string };
}

interface Class {
  id: string;
  name: string;
}

interface MembershipPlan {
  id: string;
  name: string;
}

function MembersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showAddForm = searchParams.get("action") === "add";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [members, setMembers] = useState<Member[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(showAddForm);
  const [showImport, setShowImport] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: "",
    classId: "",
    planId: "",
    paymentStatus: "",
  });

  // Import state
  const [csvData, setCsvData] = useState<Array<Record<string, string>>>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [importStep, setImportStep] = useState(1);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    classId: "",
    membershipPlanId: "",
    notes: "",
  });

  const fetchData = useCallback(async () => {
    try {
      const [membersRes, classesRes, plansRes] = await Promise.all([
        fetch("/api/members?include=subscription"),
        fetch("/api/classes"),
        fetch("/api/membership-plans"),
      ]);

      if (membersRes.ok) {
        const data = await membersRes.json();
        setMembers(Array.isArray(data) ? data : []);
      }

      if (classesRes.ok) {
        const data = await classesRes.json();
        setClasses(Array.isArray(data) ? data : []);
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

  // Filter members
  const filteredMembers = members.filter((member) => {
    // Text search
    const matchesSearch =
      !searchQuery ||
      member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.parentEmail.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus = !filters.status || member.status === filters.status;

    // Class filter
    const matchesClass = !filters.classId || member.class?.id === filters.classId;

    // Plan filter
    const matchesPlan = !filters.planId || member.membershipPlan?.id === filters.planId;

    // Payment status filter
    const matchesPayment =
      !filters.paymentStatus ||
      (filters.paymentStatus === "paid" && member.subscription?.status === "active") ||
      (filters.paymentStatus === "unpaid" && member.subscription?.status !== "active");

    return matchesSearch && matchesStatus && matchesClass && matchesPlan && matchesPayment;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          membershipPlanId: formData.membershipPlanId || null,
        }),
      });

      if (res.ok) {
        setFormData({
          firstName: "",
          lastName: "",
          parentName: "",
          parentEmail: "",
          parentPhone: "",
          classId: "",
          membershipPlanId: "",
          notes: "",
        });
        setIsAdding(false);
        router.replace("/members");
        fetchData();
      }
    } catch (error) {
      console.error("Failed to add member:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        alert("CSV file must have a header row and at least one data row");
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
      const rows = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
        return headers.reduce((obj, header, i) => {
          obj[header] = values[i] || "";
          return obj;
        }, {} as Record<string, string>);
      });

      setCsvData(rows);

      // Auto-map columns based on common names
      const autoMapping: Record<string, string> = {};
      const fieldMappings: Record<string, string[]> = {
        firstName: ["first name", "firstname", "first", "given name"],
        lastName: ["last name", "lastname", "surname", "family name"],
        parentName: ["parent name", "parentname", "guardian", "guardian name"],
        parentEmail: ["parent email", "parentemail", "email", "guardian email"],
        parentPhone: ["phone", "telephone", "mobile", "parent phone"],
        className: ["class", "group", "team", "class name"],
        dateOfBirth: ["dob", "date of birth", "birthday", "birth date"],
        notes: ["notes", "comments", "remarks"],
      };

      headers.forEach((header) => {
        const lowerHeader = header.toLowerCase();
        for (const [field, aliases] of Object.entries(fieldMappings)) {
          if (aliases.some((alias) => lowerHeader.includes(alias))) {
            autoMapping[field] = header;
            break;
          }
        }
      });

      setColumnMapping(autoMapping);
      setImportStep(2);
    };

    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!csvData.length) return;

    setImporting(true);
    try {
      // Transform CSV data using column mapping
      const members = csvData.map((row) => ({
        firstName: row[columnMapping.firstName] || "",
        lastName: row[columnMapping.lastName] || "",
        parentName: row[columnMapping.parentName] || "",
        parentEmail: row[columnMapping.parentEmail] || "",
        parentPhone: row[columnMapping.parentPhone] || "",
        className: row[columnMapping.className] || "",
        dateOfBirth: row[columnMapping.dateOfBirth] || "",
        notes: row[columnMapping.notes] || "",
      }));

      const res = await fetch("/api/members/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ members }),
      });

      if (res.ok) {
        const result = await res.json();
        alert(`Import complete!\n\nImported: ${result.imported}\nSkipped: ${result.skipped}\n\n${result.errors.slice(0, 5).join("\n")}`);
        setShowImport(false);
        setCsvData([]);
        setColumnMapping({});
        setImportStep(1);
        fetchData();
      }
    } catch (error) {
      console.error("Import failed:", error);
      alert("Failed to import members");
    } finally {
      setImporting(false);
    }
  };

  const clearFilters = () => {
    setFilters({ status: "", classId: "", planId: "", paymentStatus: "" });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  if (loading) {
    return <Loading />;
  }

  // Import Modal
  if (showImport) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="gradient-primary px-4 pt-12 pb-6 md:pt-8">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => {
                setShowImport(false);
                setCsvData([]);
                setImportStep(1);
              }}
              className="flex items-center text-white/80 hover:text-white mb-4"
            >
              <X className="w-5 h-5 mr-1" />
              Cancel
            </button>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Upload className="w-6 h-6" />
              Import Members
            </h1>
            <p className="text-white/80 text-sm mt-1">
              Step {importStep} of 3: {importStep === 1 ? "Upload File" : importStep === 2 ? "Map Columns" : "Review & Import"}
            </p>
          </div>
        </div>

        <div className="px-4 py-6 max-w-2xl mx-auto">
          {/* Step 1: Upload */}
          {importStep === 1 && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload CSV File</h2>
              <p className="text-gray-600 mb-6">
                Upload a CSV or Excel file with your member data. The file should include columns for
                first name, last name, parent name, and parent email.
              </p>

              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="font-medium text-gray-900">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500">CSV files only</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-900 mb-2">Expected Columns</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• First Name (required)</li>
                  <li>• Last Name (required)</li>
                  <li>• Parent/Guardian Name (required)</li>
                  <li>• Parent Email (required)</li>
                  <li>• Parent Phone (optional)</li>
                  <li>• Class/Team Name (optional)</li>
                </ul>
              </div>
            </Card>
          )}

          {/* Step 2: Map Columns */}
          {importStep === 2 && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Map Your Columns</h2>
              <p className="text-gray-600 mb-6">
                Match the columns from your file to the member fields. We&apos;ve auto-detected some mappings.
              </p>

              <div className="space-y-4">
                {["firstName", "lastName", "parentName", "parentEmail", "parentPhone", "className"].map((field) => {
                  const labels: Record<string, string> = {
                    firstName: "First Name *",
                    lastName: "Last Name *",
                    parentName: "Parent Name *",
                    parentEmail: "Parent Email *",
                    parentPhone: "Parent Phone",
                    className: "Class/Team Name",
                  };

                  const headers = csvData.length > 0 ? Object.keys(csvData[0]) : [];

                  return (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {labels[field]}
                      </label>
                      <select
                        value={columnMapping[field] || ""}
                        onChange={(e) =>
                          setColumnMapping({ ...columnMapping, [field]: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg border border-gray-200"
                      >
                        <option value="">-- Select column --</option>
                        {headers.map((header) => (
                          <option key={header} value={header}>
                            {header}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={() => setImportStep(3)}>
                  Continue to Review
                </Button>
                <Button variant="secondary" onClick={() => setImportStep(1)}>
                  Back
                </Button>
              </div>
            </Card>
          )}

          {/* Step 3: Review */}
          {importStep === 3 && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Import</h2>
              <p className="text-gray-600 mb-4">
                You&apos;re about to import <strong>{csvData.length}</strong> members.
              </p>

              {/* Preview */}
              <div className="border rounded-xl overflow-hidden mb-6">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <p className="text-sm font-medium text-gray-700">Preview (first 5 rows)</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Parent</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Class</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-4 py-2">
                            {row[columnMapping.firstName]} {row[columnMapping.lastName]}
                          </td>
                          <td className="px-4 py-2">{row[columnMapping.parentName]}</td>
                          <td className="px-4 py-2">{row[columnMapping.parentEmail]}</td>
                          <td className="px-4 py-2">{row[columnMapping.className] || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleImport} loading={importing}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import {csvData.length} Members
                </Button>
                <Button variant="secondary" onClick={() => setImportStep(2)}>
                  Back
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Add Member Form
  if (isAdding) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="gradient-primary px-4 pt-12 pb-6 md:pt-8">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => {
                setIsAdding(false);
                router.replace("/members");
              }}
              className="flex items-center text-white/80 hover:text-white mb-4"
            >
              <X className="w-5 h-5 mr-1" />
              Cancel
            </button>
            <h1 className="text-2xl font-bold text-white">Add New Member</h1>
          </div>
        </div>

        <div className="px-4 py-6 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name *"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Enter first name"
                required
              />
              <Input
                label="Last Name *"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Enter last name"
                required
              />
            </div>

            <Input
              label="Parent/Guardian Name *"
              value={formData.parentName}
              onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
              placeholder="Enter parent name"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Parent Email *"
                type="email"
                value={formData.parentEmail}
                onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                placeholder="parent@example.com"
                required
              />
              <Input
                label="Parent Phone"
                type="tel"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>

            {/* Class Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Class</label>
              <div className="flex flex-wrap gap-2">
                {classes.map((cls) => (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        classId: formData.classId === cls.id ? "" : cls.id,
                      })
                    }
                    className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-colors ${
                      formData.classId === cls.id
                        ? "border-primary bg-primary text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {cls.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Membership Plan Selection */}
            {plans.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Membership Plan
                </label>
                <select
                  value={formData.membershipPlanId}
                  onChange={(e) => setFormData({ ...formData, membershipPlanId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="">No plan assigned</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full mt-6" loading={submitting}>
              Add Member
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Members</h1>
              <p className="text-white/80 text-sm">
                {filteredMembers.length} of {members.length} members
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowImport(true)}
                className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                title="Import from CSV"
              >
                <Upload className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => setIsAdding(true)}
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
              >
                <Plus className="w-6 h-6 text-primary" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-13 pl-12 pr-4 bg-white rounded-2xl text-gray-900 placeholder-gray-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-4 max-w-4xl mx-auto">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="default" className="ml-1">
              {Object.values(filters).filter((v) => v !== "").length}
            </Badge>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>

        {showFilters && (
          <div className="mt-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                >
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="lapsed">Lapsed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Payment</label>
                <select
                  value={filters.paymentStatus}
                  onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                >
                  <option value="">All</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Class</label>
                <select
                  value={filters.classId}
                  onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                >
                  <option value="">All</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Plan</label>
                <select
                  value={filters.planId}
                  onChange={(e) => setFilters({ ...filters, planId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                >
                  <option value="">All</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Members List */}
      <div className="px-4 pb-6 max-w-4xl mx-auto">
        {filteredMembers.length > 0 ? (
          <div className="space-y-3">
            {filteredMembers.map((member) => {
              const isPaid = member.subscription?.status === "active";

              return (
                <Link key={member.id} href={`/members/${member.id}`}>
                  <Card className="flex items-center gap-4" hoverable>
                    <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">
                        {member.firstName?.[0] ?? ''}
                        {member.lastName?.[0] ?? ''}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {member.firstName} {member.lastName}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-primary mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="truncate">
                          {member.class?.name || "No class assigned"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <User className="w-3 h-3" />
                        <span className="truncate">{member.parentName}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={isPaid ? "success" : "error"}>
                        {isPaid ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        {isPaid ? "Paid" : "Unpaid"}
                      </Badge>
                      <ChevronRight className="w-5 h-5 text-gray-300" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title={searchQuery || hasActiveFilters ? "No Results Found" : "No Members Yet"}
            description={
              searchQuery || hasActiveFilters
                ? "Try adjusting your search or filters"
                : "Add your first member or import from CSV"
            }
            action={
              !searchQuery && !hasActiveFilters ? (
                <div className="flex gap-3">
                  <Button onClick={() => setIsAdding(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                  <Button variant="secondary" onClick={() => setShowImport(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Import CSV
                  </Button>
                </div>
              ) : undefined
            }
          />
        )}
      </div>
    </div>
  );
}

export default function MembersPage() {
  return (
    <Suspense fallback={<Loading />}>
      <MembersContent />
    </Suspense>
  );
}
