"use client";

import type { ReactNode } from "react";
import { DocSessionProvider } from "@/context/doc-session";

export function Providers({ children }: { children: ReactNode }) {
  return <DocSessionProvider>{children}</DocSessionProvider>;
}
