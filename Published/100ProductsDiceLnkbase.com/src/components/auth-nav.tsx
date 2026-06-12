"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

import {
  getAuthSnapshot,
  signedOutSnapshot,
  signedUpSnapshot,
  subscribeToAuth,
} from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AuthNav() {
  const pathname = usePathname();
  const authSnapshot = useSyncExternalStore(
    subscribeToAuth,
    getAuthSnapshot,
    () => signedOutSnapshot,
  );
  const signedUp = authSnapshot === signedUpSnapshot;
  const productsActive = pathname === "/" || pathname.startsWith("/product");
  const navItemClass =
    "h-9 rounded-full px-3 text-sm font-medium text-zinc-600 hover:bg-white hover:text-zinc-950";
  const activeNavItemClass = "bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-200/70";

  return (
    <div className="flex items-center gap-2">
      <nav className="flex items-center gap-1 rounded-full bg-zinc-100/80 p-1 text-sm">
        <Button
          variant="ghost"
          className={cn(navItemClass, productsActive && activeNavItemClass)}
          render={<Link href="/#products" />}
          nativeButton={false}
        >
          Products
        </Button>
        <Button
          variant="ghost"
          className={cn(navItemClass, pathname === "/pricing" && activeNavItemClass)}
          render={<Link href="/pricing" />}
          nativeButton={false}
        >
          Pricing
        </Button>
      </nav>
      {signedUp ? (
        <div className="flex items-center gap-2">
          <Button
            aria-label="Add new"
            className="h-10 rounded-full bg-sky-500 px-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-600 sm:px-4"
            render={<Link href="/#products" />}
            nativeButton={false}
          >
            <Plus data-icon="inline-start" />
            <span className="hidden sm:inline">Add new</span>
          </Button>
          <Button
            className={cn(
              "h-10 rounded-full bg-zinc-950 px-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 sm:px-4",
              pathname === "/dashboard" && "bg-emerald-600 hover:bg-emerald-600",
            )}
            render={<Link href="/dashboard" />}
            nativeButton={false}
          >
            Dashboard
          </Button>
        </div>
      ) : null}
      {signedUp ? null : (
        <Button
          className="ml-1 h-9 rounded-full px-4 font-semibold shadow-sm"
          render={<Link href="/signup" />}
          nativeButton={false}
        >
          Sign up
        </Button>
      )}
    </div>
  );
}
