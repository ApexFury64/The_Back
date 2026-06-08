"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";

/**
 * SessionSync — fetches the current user's info from /api/me on mount
 * and writes it into the global Zustand store so that all pages share
 * the same name / school consistently regardless of which page is active.
 */
export default function SessionSync() {
  const setUser = useAppStore((s) => s.setUser);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && !data.error) {
          setUser({
            email: data.email ?? "",
            name: data.name ?? "",
            role: data.role ?? "",
            schoolId: data.schoolId ?? "",
            schoolName: data.schoolName ?? "AI Tutor",
          });
        }
      })
      .catch(() => {
        // silently ignore – unauthenticated pages won't have a session
      });
  }, [setUser]);

  return null;
}
