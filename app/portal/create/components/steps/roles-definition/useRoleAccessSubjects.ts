"use client";

import { useEffect, useMemo, useState } from "react";
import { PRIMARY_SUPER_ADMIN_SUBJECT_KEY } from "../../form-state";
import type { RoleAccessSubject, OrganizationUserListItem } from "./types";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function buildSuperAdminSubject(name: string, email: string): RoleAccessSubject {
  const normalizedEmail = normalizeEmail(email);
  return {
    key: PRIMARY_SUPER_ADMIN_SUBJECT_KEY,
    name: name.trim() || "Super Admin",
    email: normalizedEmail || "Admin email pending",
    role: "SUPER_ADMIN",
    isSuperAdmin: true,
  };
}

function buildUserSubject(user: OrganizationUserListItem): RoleAccessSubject | null {
  const normalizedEmail = normalizeEmail(user.email ?? "");
  if (!normalizedEmail) {
    return null;
  }

  return {
    key: `user:${user.id}`,
    name: user.name?.trim() || normalizedEmail,
    email: normalizedEmail,
    role: user.role?.trim() || "EMPLOYEE",
    isSuperAdmin: user.role === "SUPER_ADMIN",
  };
}

export function useRoleAccessSubjects({
  organizationId,
  superAdminName,
  superAdminEmail,
}: {
  organizationId?: string;
  superAdminName: string;
  superAdminEmail: string;
}) {
  const [users, setUsers] = useState<OrganizationUserListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    if (!organizationId) {
      return;
    }

    let cancelled = false;

    async function loadUsers() {
      setLoading(true);
      setFetchError(null);

      try {
        const response = await fetch(`/api/users?organizationId=${organizationId}`);
        const payload = (await response.json()) as
          | OrganizationUserListItem[]
          | { error?: string; details?: string };

        if (!response.ok) {
          throw new Error(
            "error" in payload
              ? payload.error || payload.details || "Failed to fetch employees"
              : "Failed to fetch employees",
          );
        }

        if (!cancelled) {
          setUsers(Array.isArray(payload) ? payload : []);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setFetchError(
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to fetch organization employees",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, [organizationId, refreshToken]);

  const superAdminSubject = useMemo(
    () => buildSuperAdminSubject(superAdminName, superAdminEmail),
    [superAdminEmail, superAdminName],
  );

  const subjects = useMemo(() => {
    const normalizedAdminEmail = normalizeEmail(superAdminEmail);
    const nextSubjects = [superAdminSubject];
    const scopedUsers = organizationId ? users : [];

    scopedUsers.forEach((user) => {
      const subject = buildUserSubject(user);
      if (!subject) {
        return;
      }
      if (normalizedAdminEmail && subject.email === normalizedAdminEmail) {
        return;
      }
      nextSubjects.push(subject);
    });

    return nextSubjects;
  }, [organizationId, superAdminEmail, superAdminSubject, users]);

  return {
    error: organizationId ? fetchError : null,
    loading,
    refresh: () => setRefreshToken((current) => current + 1),
    subjects,
    superAdminKey: superAdminSubject.key,
  };
}
