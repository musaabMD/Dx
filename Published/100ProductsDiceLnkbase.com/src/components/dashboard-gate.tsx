"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getAuthSnapshot,
  signedUpSnapshot,
  subscribeToAuth,
} from "@/lib/auth-store";

export function DashboardGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authSnapshot, setAuthSnapshot] = useState<string | null>(null);
  const signedUp = authSnapshot === signedUpSnapshot;

  useEffect(() => {
    function updateAuthSnapshot() {
      setAuthSnapshot(getAuthSnapshot());
    }

    updateAuthSnapshot();
    return subscribeToAuth(updateAuthSnapshot);
  }, []);

  useEffect(() => {
    if (authSnapshot !== null && !signedUp) {
      router.replace("/signup");
    }
  }, [authSnapshot, router, signedUp]);

  if (authSnapshot === null || !signedUp) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 text-sm text-zinc-500">
        Redirecting to signup...
      </div>
    );
  }

  return children;
}
