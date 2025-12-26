"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, ShieldCheck, User, ChevronDown, Loader2 } from "lucide-react";

interface UserRoleManagerProps {
  userId: string;
  userEmail: string;
  currentRole: string;
}

export function UserRoleManager({ userId, userEmail, currentRole }: UserRoleManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const roles = [
    {
      value: "superadmin",
      label: "Super Admin",
      icon: Crown,
      color: "text-yellow-600 bg-yellow-50",
      description: "Full platform access",
    },
    {
      value: "admin",
      label: "Admin",
      icon: ShieldCheck,
      color: "text-purple-600 bg-purple-50",
      description: "Admin panel access",
    },
    {
      value: "user",
      label: "Club Owner",
      icon: User,
      color: "text-gray-600 bg-gray-50",
      description: "Standard user",
    },
  ];

  const handleRoleChange = async (newRole: string) => {
    if (newRole === currentRole) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId: userId, role: newRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to update role");
      } else {
        router.refresh();
      }
    } catch (error) {
      alert("Failed to update role");
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const currentRoleInfo = roles.find((r) => r.value === currentRole) || roles[2];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <span className="text-sm font-medium">Change Role</span>
            <ChevronDown className="w-4 h-4" />
          </>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden">
            <div className="p-3 border-b border-gray-100">
              <p className="text-xs text-gray-500">Change role for</p>
              <p className="font-medium text-gray-900 truncate">{userEmail}</p>
            </div>

            <div className="p-2">
              {roles.map((role) => (
                <button
                  key={role.value}
                  onClick={() => handleRoleChange(role.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    currentRole === role.value
                      ? "bg-purple-50 border-2 border-purple-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${role.color}`}>
                    <role.icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{role.label}</p>
                    <p className="text-xs text-gray-500">{role.description}</p>
                  </div>
                  {currentRole === role.value && (
                    <span className="ml-auto text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                      Current
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Roles are stored in Clerk publicMetadata and take effect immediately.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
