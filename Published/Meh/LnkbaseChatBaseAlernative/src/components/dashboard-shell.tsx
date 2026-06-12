"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowLeft, PanelLeft } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function DashboardShell({
  title,
  backHref,
  backLabel = "Back",
  agentCount,
  flushContent = false,
  showSidebar = true,
  children,
}: {
  title?: string;
  backHref?: string;
  backLabel?: string;
  eyebrow?: string;
  agentCount?: number;
  flushContent?: boolean;
  showSidebar?: boolean;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const pageTitle =
    title ??
    (pathname === "/dashboard" ? "Agents" : "Workspace");
  const content = (
    <SidebarInset className="min-h-screen max-w-full overflow-x-hidden bg-white text-[#111111]">
      <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-black/[0.07] bg-white/90 px-4 backdrop-blur-xl sm:px-6">
        {showSidebar && (
          <>
            <DashboardSidebarTrigger />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
          </>
        )}
        {backHref && (
          <Link
            href={backHref}
            aria-label={backLabel}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-black/[0.08] bg-white px-2.5 text-sm font-medium text-[#4c4c55] shadow-sm transition hover:bg-[#f6f6f4] hover:text-[#111111]"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">{backLabel}</span>
          </Link>
        )}
        <h1 className="truncate text-sm font-semibold text-[#111111]">
          {pageTitle}
        </h1>
      </header>
      <main
        className={
          flushContent
            ? "w-full max-w-full flex-1 overflow-x-hidden p-0"
            : "w-full max-w-full flex-1 overflow-x-hidden px-4 py-6 sm:px-8"
        }
      >
        {children}
      </main>
    </SidebarInset>
  );

  if (!showSidebar) {
    return <div className="flex min-h-svh w-full">{content}</div>;
  }

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <AppSidebar agentCount={agentCount} />
      {content}
    </SidebarProvider>
  );
}

function DashboardSidebarTrigger() {
  const { open, setOpen } = useSidebar();
  const toggleOpen = () => setOpen(!open);

  return (
    <button
      type="button"
      data-sidebar="trigger"
      aria-label="Toggle sidebar"
      className="-ml-1 inline-flex size-7 items-center justify-center rounded-lg text-[#4c4c55] transition hover:bg-[#f6f6f4] hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleOpen();
        }
      }}
      onPointerDown={(event) => {
        event.preventDefault();
        toggleOpen();
      }}
    >
      <PanelLeft size={16} />
      <span className="sr-only">Toggle sidebar</span>
    </button>
  );
}
