"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";

/**
 * SessionSync — fetches the current user's info from /api/me on mount
 * and writes it into the global Zustand store so that all pages share
 * the same name / school consistently regardless of which page is active.
 *
 * Re-fetches any time the stored userName is missing (e.g. after logout/refresh).
 */
export default function SessionSync() {
  const setUser = useAppStore((s) => s.setUser);
  const storedUserName = useAppStore((s) => s.userName);
  const hasFetched = useRef(false);

  useEffect(() => {
    // Always re-fetch if userName is missing (first load, post-logout, etc.)
    if (hasFetched.current && storedUserName) return;
    hasFetched.current = true;

    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && !data.error) {
          // For super-admins who have no school, use a platform-level name
          const roleSchoolName =
            data.role === "SUPER_ADMIN"
              ? "AI Tutor Platform"
              : data.schoolName || "AI Tutor";

          setUser({
            email: data.email ?? "",
            name: data.name ?? "",
            role: data.role ?? "",
            schoolId: data.schoolId ?? "",
            schoolName: roleSchoolName,
          });
        }
      })
      .catch(() => {
        // Silently ignore — unauthenticated pages won't have a session
      });
  }, [setUser, storedUserName]);

  return null;
}
